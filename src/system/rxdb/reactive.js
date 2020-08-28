import Vue from 'vue'
import assert from 'assert'
import { isRxDocument, isRxQuery } from 'rxdb'

import { skip } from 'rxjs/operators'
import { rxdb } from 'src/system/rxdb'
import debounce from 'lodash/debounce'
import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/boot/log'
import merge from 'lodash/merge'
import set from 'lodash/set'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.RXDB_REACTIVE)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.RXDB_REACTIVE)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.RXDB_REACTIVE)
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))

function getReactive (rxDoc) {
  let reactiveItemHolder = new ReactiveItemHolder(rxDoc)
  return reactiveItemHolder.reactiveItem
}
function mergeReactiveItem (reactiveItem, change) {
  return merge(reactiveItem, change, (objValue, srcValue) => {
    if (Array.isArray(objValue) && Array.isArray(srcValue)) {
      objValue.splice(0, objValue.length(), ...srcValue)
      return objValue
    } else if (typeof objValue === 'object' && typeof srcValue === 'object') {
      for (let key in objValue) {
        if (!(key in srcValue)) delete objValue[key] // удаляем удалившиеся
      }
      return undefined // default behavior
    } else {
      return undefined
    } // default behavior
  })
}

let id = 0
// все измененеия - только через эту ф-ю. Иначе - возможны гонки (из-за debounce)
// либо - менять непосредственно reactiveItem (либо через updateExtended)
async function updateRxDoc (rxDocOrId, path, value, debouncedSave = true) {
  const f = updateRxDoc
  logD(f, 'start')
  const t1 = performance.now()
  // logD(f, 'start2', rxDocOrId, path, value)
  if (!rxDocOrId) return
  let rxDoc
  if (isRxDocument(rxDocOrId)) {
    rxDoc = rxDocOrId
  } else {
    rxDoc = await rxdb.getRxDoc(rxDocOrId)
  }
  if (rxDoc) {
    let reactiveItemHolder = new ReactiveItemHolder(rxDoc)
    try {
      reactiveItemHolder.setDebouncedSave(debouncedSave)
      // logD(f, 'start2', reactiveItemHolder.reactiveItem, path, value)
      set(reactiveItemHolder.reactiveItem, path, value)
      // logD(f, 'complete', reactiveItemHolder.reactiveItem)
    } finally {
      wait(0).then(() => { // нужно чтобы setDebouncedSave сработала после эвентов itemSubscribe
        reactiveItemHolder.setDebouncedSave(true)
      })
    }
  }
  logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
}

const debounceIntervalItem = 2000

// класс-обертка над rxDoc для реактивности
class ReactiveItemHolder {
  constructor (rxDoc) {
    assert(isRxDocument(rxDoc), '!isRxDocument(rxDoc)')
    assert(rxDoc.id, '!rxDoc.id')
    logD('ReactiveItemHolder::constructor', rxDoc.id)
    this.rxDoc = rxDoc
    if (rxDoc.reactiveItemHolderMaster) {
      this.id = rxDoc.reactiveItemHolderMaster.id
      this.reactiveItem = rxDoc.reactiveItemHolderMaster.reactiveItem
      this.itemSubscribe = rxDoc.reactiveItemHolderMaster.itemSubscribe // иногда надо временно отписаться
      this.itemUnsubscribe = rxDoc.reactiveItemHolderMaster.itemUnsubscribe
      this.rxDocSubscribe = rxDoc.reactiveItemHolderMaster.rxDocSubscribe // иногда надо временно отписаться
      this.rxDocUnsubscribe = rxDoc.reactiveItemHolderMaster.rxDocUnsubscribe
      this.getDebouncedSave = rxDoc.reactiveItemHolderMaster.getDebouncedSave
      this.setDebouncedSave = rxDoc.reactiveItemHolderMaster.setDebouncedSave
    } else {
      this.id = id++
      this.rxDoc = rxDoc
      this.mutex = new Mutex()
      this.vm = new Vue({
        data: {
          reactiveItem: rxDoc.toJSON()
        }
      })
      this.reactiveItem = this.vm.reactiveItem
      this.reactiveItem.getData = () => {
        if (this.reactiveItem.valueString) return this.reactiveItem.valueString // schemaKeyValue
        if (this.reactiveItem.cached) return this.reactiveItem.cached.data // cacheSchema
        return this.reactiveItem // wsSchemaItem
      }
      this.reactiveItem.itemSubscribe = this.itemSubscribe // иногда надо временно отписаться
      this.reactiveItem.itemUnsubscribe = this.itemUnsubscribe
      this.debouncedSave = true
      this.rxDocSubscribe()
      this.itemSubscribe()
      this.reactiveItem.updateExtended = async (path, value, debouncedSave = true) => {
        await updateRxDoc(this.rxDoc, path, value, debouncedSave)
      }
      this.getDebouncedSave = () => {
        return this.debouncedSave
      }
      this.setDebouncedSave = (flag) => {
        const f = this.setDebouncedSave
        // logD(f, 'start', flag, this.id)
        this.debouncedSave = flag
      }
      rxDoc.reactiveItemHolderMaster = this
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
        // logD(f, `rxDoc changed. try to change reactiveItem. ${change.id}`)
        this.reactiveItem = mergeReactiveItem(this.reactiveItem, change)
        // logD(f, `reactiveItem changed ${this.reactiveItem.id}`)
      } finally {
        this.itemSubscribe()
        this.mutex.release()
      }
    })
  }

  rxDocUnsubscribe () {
    const f = this.rxDocUnsubscribe
    // logD(f, `rxDoc unsubscribe ${this.rxDoc.id} rev: ${this.rxDoc.rev}`)
    if (this.rxDocSubscription) this.rxDocSubscription.unsubscribe()
    delete this.rxDocSubscription
  }

  itemSubscribe () {
    const f = this.itemSubscribe
    if (this.itemUnsubscribeFunc) return
    this.itemUnsubscribeFunc = this.vm.$watch('reactiveItem', async (newVal, oldVal) => {
      // reactiveItem изменилась (обычно из UI)
      if (!this.debouncedItemSaveFunc) {
        this.itemSaveFunc = async (newVal) => {
          // игнорируем newVal (берем из this.reactiveItem)!!! this.reactiveItem содержит самые актуальные данные!
          const f = this.itemSaveFunc
          if (this.rxDoc.deleted) return // на всякий случай
          try {
            await this.mutex.lock()
            this.rxDocUnsubscribe()
            // logD(f, `try to change rxDoc ${this.reactiveItem.id}`)
            assert(this.reactiveItem.id, '!this.reactiveItem.id')
            let updatedRxDoc = await this.rxDoc.atomicUpdate((oldData) => {
              let actualData = JSON.parse(JSON.stringify(this.reactiveItem))
              actualData._rev = oldData._rev // ревизия от rxdb (иначе - ошибки)
              // logD(f, 'actualData', actualData)
              return actualData
            })
            logD(f, `rxDoc changed ${updatedRxDoc.id}`)
          } finally {
            this.rxDocSubscribe()
            this.mutex.release()
          }
        }
        this.debouncedItemSaveFunc = debounce(this.itemSaveFunc, debounceIntervalItem)
      }
      if (this.getDebouncedSave()) {
        // logD(f, `reactiveItem changed (rxDoc will change via debounce later) ${this.reactiveItem.id}`)
        this.debouncedItemSaveFunc(newVal)
      } else {
        // logD(f, `reactiveItem changed without debounce ${this.reactiveItem.id}`)
        await this.itemSaveFunc(newVal)
      }
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
    logD('ReactiveListHolder::constructor: ', rxQuery.mangoQuery.selector)
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
            reactiveList: docs.map(rxDoc => getReactive(rxDoc).getData())
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
        // logD(f, 'rxQuery changed 1', results)
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
        // logD(f, 'rxQuery changed 2', results)
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
      //     const f = this.debouncedListSave
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

export { ReactiveItemHolder, ReactiveListHolder, Mutex, getReactive, updateRxDoc }
