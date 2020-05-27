import Vue from 'vue'
import assert from 'assert'
import { isRxDocument, isRxQuery } from 'rxdb'

import { skip } from 'rxjs/operators'
import { rxdb } from 'src/boot/rxdb'
import debounce from 'lodash/debounce'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
import { Mutex } from 'src/system/rxdb/workspace'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.RXDB_REACTIVE)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.RXDB_REACTIVE)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.RXDB_REACTIVE)

const debounceIntervalItem = 2000
// класс-обертка над rxDoc для реактивности
class ReactiveItemHolder {
  constructor (rxDoc) {
    assert(isRxDocument(rxDoc), '!isRxDocument(rxDoc)')
    logD('ReactiveItemHolder::constructor', rxDoc.id)
    if (rxDoc.reactiveItemHolder) {
      this.item = rxDoc.reactiveItemHolder.item
    } else {
      rxDoc.reactiveItemHolder = this
      this.rxDoc = rxDoc
      this.mutex = new Mutex()
      this.vm = new Vue({
        data: {
          item: rxDoc.toJSON()
        }
      })
      this.item = this.vm.item
      this.rxDocSubscribe()
      this.itemSubscribe()
    }
  }

  rxDocSubscribe () {
    const f = this.rxDocSubscribe
    logD(f, `rxDoc subscribe ${this.rxDoc.id} rev: ${this.rxDoc.rev}`)
    if (this.rxDocSubscription) return
    // skip - для пропуска n первых эвантов (после subscribe - сразу генерится эвент(даже если данные не менялись))
    this.rxDocSubscription = this.rxDoc.$.pipe(skip(1)).subscribe(async change => {
      try {
        await this.mutex.lock()
        this.itemUnsubscribe()
        logD(f, `rxDoc changed ${change.id} rev ${change.rev}`)
        for (let key in change) this.item[key] = change[key] // изменившиеся и добавившиеся
        for (let key in this.item) {
          if (!(key in change)) delete this.item[key] // удалившиеся
        }
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
    this.itemUnsubscribeFunc = this.vm.$watch('item', (newVal, oldVal) => {
      // item изменилась (из UI)
      // logD(f, 'item changed from UI', newVal)
      if (!this.debouncedItemSave) {
        this.debouncedItemSave = debounce(async (newVal) => {
          // игнорируем newVal (берем из this.item)!!! this.item содержит самые актуальные данные!
          let f = this.debouncedItemSave
          try {
            await this.mutex.lock()
            await rxdb.lock() // необходимо заблокировать до вызова this.rxDocUnsubscribe() (иначе могут быть пропущены эвенты изменения rxDoc из сети)
            this.rxDocUnsubscribe()
            logD(f, 'item changed from UI (debounce)', this.item)
            await rxdb.upsertItem(this.item, false) // выполняем без блокировки (делаем ее тут - await rxdb.lock())
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
    if (rxQuery.reactiveListHolder) {
      this.list = rxQuery.reactiveListHolder.list
      return this.list
    } else {
      rxQuery.reactiveListHolder = this
      this.rxQuery = rxQuery
      this.mutex = new Mutex()
      let docs = await rxQuery.exec()
      assert(Array.isArray(docs), 'Array.isArray(docs)')
      this.vm = new Vue({
        data: {
          list: docs.map(rxDoc => {
            let reactiveItemHolder = new ReactiveItemHolder(rxDoc)
            return reactiveItemHolder.item
          })
        }
      })
      this.list = this.vm.list
      assert(Array.isArray(this.vm.list), 'Array.isArray(this.vm.list)')
      this.rxQuerySubscribe()
      this.listSubscribe()
      return this.list
    }
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
        if (this.vm.list.length === results.length) {
          let arrayChanged = false
          for (let i = 0; i < results.length; i++) {
            if (results[i].id !== this.vm.list[i].id) {
              arrayChanged = true
              break
            }
          }
          if (!arrayChanged) return // если список не изменился - просто выходим
        }
        logD(f, 'rxQuery changed', results)
        let items = results.map(rxDoc => {
          let reactiveItemHolder = new ReactiveItemHolder(rxDoc)
          return reactiveItemHolder.item
        })
        this.vm.list.splice(0, this.vm.list.length, ...items)
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
    this.listUnsubscribeFunc = this.vm.$watch('list', async (newVal, oldVal) => {
      assert(false, 'изменения списка из UI запрещены')
      // // list изменился (из UI)
      // if (!this.debouncedListSave) {
      //   this.debouncedListSave = debounce(async (newVal, oldVal) => {
      //     let f = this.debouncedListSave
      //     try {
      //       await this.mutex.lock()
      //       await rxdb.lock() // необходимо заблокировать до вызова this.rxQueryUnsubscribe() (иначе могут быть пропущены эвенты изменения rxDoc из сети)
      //       this.rxQueryUnsubscribe()
      //       logD(f, 'reactive list changed from UI', newVal)
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

export { ReactiveItemHolder, ReactiveListHolder }
