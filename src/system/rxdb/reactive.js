import Vue from 'vue'
import assert from 'assert'
import { isRxDocument, isRxQuery } from 'rxdb'

import { skip } from 'rxjs/operators'
import { rxdb } from 'src/system/rxdb'
import debounce from 'lodash/debounce'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
import { getRxCollectionEnumFromId } from 'src/system/rxdb/index'
import merge from 'lodash/merge'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.RXDB_REACTIVE)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.RXDB_REACTIVE)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.RXDB_REACTIVE)

function getReactive (rxDoc) {
  let reactiveItemHolder = new ReactiveItemHolder(rxDoc)
  return getItemData(reactiveItemHolder.reactiveItem)
}

function getItemData (reactiveItem) {
  if (reactiveItem.valueString) return reactiveItem.valueString
  if (reactiveItem.cached) return reactiveItem.cached.data
  return reactiveItem
}

function mergeReactiveItem (reactiveItem, change) {
  return merge(reactiveItem, change, (objValue, srcValue) => {
    if (Array.isArray(objValue) && Array.isArray(srcValue)) {
      objValue.splice(0, objValue.length(), ...srcValue)
      return objValue
    } else if (typeof objValue === 'object' && typeof srcValue === 'object'){
      for (let key in objValue) {
        if (!(key in srcValue)) delete objValue[key] // удаляем удалившиеся
      }
      return undefined // default behavior
    } else return undefined // default behavior
  })
}

const debounceIntervalItem = 2000

// класс-обертка над rxDoc для реактивности
class ReactiveItemHolder {
  constructor (rxDoc) {
    assert(isRxDocument(rxDoc), '!isRxDocument(rxDoc)')
    assert(rxDoc.id, '!rxDoc.id')
    // logD('ReactiveItemHolder::constructor', rxDoc.id)
    if (rxDoc.reactiveItemHolderMaster) {
      this.reactiveItem = rxDoc.reactiveItemHolderMaster.reactiveItem
    } else {
      this.rxDoc = rxDoc
      this.mutex = new Mutex()
      this.vm = new Vue({
        data: {
          reactiveItem: rxDoc.toJSON()
        }
      })
      this.reactiveItem = this.vm.reactiveItem
      rxDoc.reactiveItemHolderMaster = this
      this.rxDocSubscribe()
      this.itemSubscribe()
    }
  }

  rxDocSubscribe () {
    const f = this.rxDocSubscribe
    // logD(f, `rxDoc subscribe ${this.rxDoc.id} rev: ${this.rxDoc.rev}`)
    if (this.rxDocSubscription) return
    // skip - для пропуска n первых эвантов (после subscribe - сразу генерится эвент(даже если данные не менялись))
    this.rxDocSubscription = this.rxDoc.$.pipe(skip(1)).subscribe(async change => {
      try {
        await this.mutex.lock()
        this.itemUnsubscribe()
        logD(f, `rxDoc changed. try to change reactiveItem. ${change.id}`)
        this.reactiveItem = mergeReactiveItem(this.reactiveItem, change)
        logD(f, 'reactiveItem changed')
        // for (let key in change) this.reactiveItem[key] = change[key] // изменившиеся и добавившиеся
        // for (let key in this.reactiveItem) {
        //   if (!(key in change)) delete this.reactiveItem[key] // удалившиеся
        // }
      } finally {
        this.itemSubscribe()
        this.mutex.release()
      }
    })
  }

  rxDocUnsubscribe () {
    const f = this.rxDocUnsubscribe
    logD(f, `rxDoc unsubscribe ${this.rxDoc.id} rev: ${this.rxDoc.rev}`)
    if (this.rxDocSubscription) this.rxDocSubscription.unsubscribe()
    delete this.rxDocSubscription
  }

  itemSubscribe () {
    const f = this.itemSubscribe
    if (this.itemUnsubscribeFunc) return
    this.itemUnsubscribeFunc = this.vm.$watch('reactiveItem', (newVal, oldVal) => {
      // reactiveItem изменилась (из UI)
      // logD(f, 'reactiveItem changed from UI', newVal)
      if (!this.debouncedItemSave) {
        this.debouncedItemSave = debounce(async (newVal) => {
          // игнорируем newVal (берем из this.reactiveItem)!!! this.reactiveItem содержит самые актуальные данные!
          let f = this.debouncedItemSave
          if (this.rxDoc.deleted) return // на всякий случай
          try {
            await this.mutex.lock()
            await rxdb.lock() // необходимо заблокировать до вызова this.rxDocUnsubscribe() (иначе могут быть пропущены эвенты изменения rxDoc из сети)
            this.rxDocUnsubscribe()
            logD(f, 'reactiveItem changed from UI (debounce)', this.reactiveItem)
            assert(this.reactiveItem.id, '!this.reactiveItem.id')
            await rxdb.set(getRxCollectionEnumFromId(this.reactiveItem.id), getItemData(this.reactiveItem), { withLock: false }) // выполняем без блокировки (делаем ее тут - await rxdb.lock())
          } finally {
            this.rxDocSubscribe()
            await rxdb.release()
            this.mutex.release()
          }
        }, debounceIntervalItem)
      }
      this.debouncedItemSave(newVal)
    }, { deep: true, immediate: false })
  }

  itemUnsubscribe () {
    const f = this.itemUnsubscribe
    if (this.itemUnsubscribeFunc) this.itemUnsubscribeFunc()
    delete this.itemUnsubscribeFunc
  }
}

class ReactiveListHolder {
  async create (rxQuery) {
    logD('ReactiveListHolder::constructor', rxQuery)
    assert(isRxQuery(rxQuery), '!isRxQuery(rxQuery)')
    try {
      if (rxQuery.reactiveListHolderMaster) {
        await rxQuery.reactiveListHolderMaster.mutex.lock()
        this.reactiveList = rxQuery.reactiveListHolderMaster.reactiveList
      } else {
        this.mutex = new Mutex()
        await this.mutex.lock()
        rxQuery.reactiveListHolderMaster = this
        this.rxQuery = rxQuery
        let docs = await rxQuery.exec()
        assert(Array.isArray(docs), 'Array.isArray(docs)')
        this.vm = new Vue({
          data: {
            reactiveList: docs.map(rxDoc => getReactive(rxDoc))
          }
        })
        this.reactiveList = this.vm.reactiveList
        assert(Array.isArray(this.vm.reactiveList), 'Array.isArray(this.vm.reactiveList)')
        this.rxQuerySubscribe()
        this.listSubscribe()
      }
    } finally {
      if (rxQuery.reactiveListHolderMaster) {
        rxQuery.reactiveListHolderMaster.mutex.release()
      } else {
        this.mutex.release()
      }
    }

    return this.reactiveList
  }

  rxQuerySubscribe () {
    const f = this.rxQuerySubscribe
    if (this.rxQuerySubscription) return
    // skip - для пропуска n первых эвантов (после subscribe - сразу генерится эвент(даже если данные не менялись))
    this.rxQuerySubscription = this.rxQuery.$.pipe(skip(1)).subscribe(async results => {
      try {
        await this.mutex.lock()
        this.listUnsubscribe()
        // rxQuery дергается даже когда поменялся его итем ( даже если это не влияет на рез-тат!!!)
        if (this.vm.reactiveList.length === results.length) {
          let arrayChanged = false
          for (let i = 0; i < results.length; i++) {
            if (results[i].id !== this.vm.reactiveList[i].id) {
              arrayChanged = true
              break
            }
          }
          if (!arrayChanged) return // если список не изменился - просто выходим
        }
        logD(f, 'rxQuery changed', results)
        let items = results.map(rxDoc => {
          let reactiveItemHolder = new ReactiveItemHolder(rxDoc)
          return reactiveItemHolder.reactiveItem
        })
        this.vm.reactiveList.splice(0, this.vm.reactiveList.length, ...items)
      } finally {
        this.listSubscribe()
        this.mutex.release()
      }
    })
  }

  rxQueryUnsubscribe () {
    if (this.rxQuerySubscription) this.rxQuerySubscription.unsubscribe()
    delete this.rxQuerySubscription
  }

  listSubscribe () {
    const f = this.listSubscribe
    if (this.listUnsubscribeFunc) return
    this.listUnsubscribeFunc = this.vm.$watch('reactiveList', async (newVal, oldVal) => {
      assert(false, 'изменения списка из UI запрещены')
      // // reactiveList изменился (из UI)
      // if (!this.debouncedListSave) {
      //   this.debouncedListSave = debounce(async (newVal, oldVal) => {
      //     let f = this.debouncedListSave
      //     try {
      //       await this.mutex.lock()
      //       await rxdb.lock() // необходимо заблокировать до вызова this.rxQueryUnsubscribe() (иначе могут быть пропущены эвенты изменения rxDoc из сети)
      //       this.rxQueryUnsubscribe()
      //       logD(f, 'reactiveList changed from UI', newVal)
      //       let insertedItems = difference(newVal, oldVal, (left, right) => left.id === right.id) // что добавилось в массив
      //       let deletedItems = difference(oldVal, newVal, (left, right) => left.id === right.id) // что удалено из массива
      //
      //       for (let insertedItem of insertedItems) {
      //         assert(!insertedItem.id)
      //         await rxdb.upsertItem(insertedItem) // сохраним в БД
      //       }
      //       for (let deletedItem of deletedItems) {
      //         assert(deletedItem.id)
      //         await rxdb.delete(deletedItem.id) // сохраним в БД
      //       }
      //     } finally {
      //       this.rxQuerySubscribe()
      //       this.rxdb.release()
      //       this.mutex.release()
      //     }
      //   }, debounceIntervalList)
      // }
      // this.debouncedListSave(newVal, oldVal)
    }, { deep: false, immediate: false })
  }

  listUnsubscribe () {
    if (this.listUnsubscribeFunc) this.listUnsubscribeFunc()
    delete this.listUnsubscribeFunc
  }
}

class Mutex {
  constructor () {
    this.queue = []
    this.locked = false
  }

  lock () {
    return new Promise((resolve, reject) => {
      if (this.locked) {
        this.queue.push([resolve, reject])
      } else {
        this.locked = true
        resolve()
      }
    })
  }

  release () {
    if (this.queue.length > 0) {
      const [resolve, reject] = this.queue.shift()
      resolve()
    } else {
      this.locked = false
    }
  }
}

export { ReactiveItemHolder, ReactiveListHolder, Mutex, getReactive }
