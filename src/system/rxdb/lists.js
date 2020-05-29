import assert from 'assert'
import { ObjectsApi } from 'src/api/objects'
import { ReactiveItemHolder } from 'src/system/rxdb/reactive'
import { CacheItemTypeEnum } from 'src/system/rxdb/cache'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
import { RxCollectionEnum, rxdb } from 'src/system/rxdb/index'
import { ListsApi as ListApi, ListsApi } from 'src/api/lists'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.RXDB_LST)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.RXDB_LST)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.RXDB_LST)
const logC = getLogFunc(LogLevelEnum.CRITICAL, LogModulesEnum.RXDB_LST)

// класс для запроса списков
class Lists {
  constructor (cache) {
    this.cache = cache
  }

  // вернет реактивный список (все элементы списка - тоже реактивны)
  async find (mangoQuery) {
    let fetchFunc = async () => {
      return {
        item: await ListApi.getList(mangoQuery),
        actualAge: 'day'
      }
    }
    let rxDoc = await this.cache.getItem(this.cache.makeListId(mangoQuery), fetchFunc)
    if (!rxDoc) throw new Error('объект не найден на сервере')
    let reactiveItemHolder = new ReactiveItemHolder(rxDoc)
    return { rxDoc, reactiveList: reactiveItemHolder.reactiveItem.item }
  }

  // от сервера прилетел эвент
  async processEvent (event) {
    const f = this.processEvent
    logD(f, 'start')
    switch (event.type) {
      case 'USER_SUBSCRIBED': {
        let rxDocSubj = await this.cache.getItem(this.cache.makeObjectId(event.subject.oid))
        let rxDocObj = await this.cache.getItem(this.cache.makeObjectId(event.object.oid))
        if (event.subject.oid === rxdb.currentUser().oid) { // если это мы подписались
          // todo!
          // await context.dispatch('cache/update', {
          //   key: event.subject.oid,
          //   path: 'subscriptions',
          //   setter: (oldValue) => {
          //     let subscriptions = oldValue
          //     let index = subscriptions.findIndex(s => s.oid === event.object.oid)
          //     assert.ok(index === -1)
          //     subscriptions.push(event.object)
          //     return subscriptions
          //   }
          // }, { root: true })
          // // на кого я подписан...
          // await context.dispatch('cache/update', {
          //   key: event.object.oid,
          //   path: 'subscribers',
          //   setter: (oldValue) => {
          //     let subscribers = oldValue
          //     let index = subscribers.findIndex(s => s.oid === event.subject.oid)
          //     assert.ok(index === -1)
          //     subscribers.push(event.subject)
          //     return subscribers
          //   }
          // }, { root: true })
        }
        break
      }
      case 'USER_UNSUBSCRIBED': {
        let rxDocSubj = await this.cache.getItem(this.cache.makeObjectId(event.subject.oid))
        let rxDocObj = await this.cache.getItem(this.cache.makeObjectId(event.object.oid))
        if (event.subject.oid === rxdb.currentUser().oid) { // если это мы подписались
          // todo!
          // if (event.subject.oid === context.rootState.auth.userOid) {
          //   await context.dispatch('cache/update', {
          //     key: event.subject.oid,
          //     path: 'subscriptions',
          //     setter: (oldValue) => {
          //       let subscriptions = oldValue
          //       let index = subscriptions.findIndex(s => s.oid === event.object.oid)
          //       assert.ok(index >= 0)
          //       subscriptions.splice(index, 1)
          //       return subscriptions
          //     }
          //   }, { root: true })
          //   // на кого я подписан...
          //   await context.dispatch('cache/update', {
          //     key: event.object.oid,
          //     path: 'subscribers',
          //     setter: (oldValue) => {
          //       let subscribers = oldValue
          //       let index = subscribers.findIndex(s => s.oid === event.subject.oid)
          //       assert.ok(index >= 0)
          //       subscribers.splice(index, 1)
          //       return subscribers
          //     }
          //   }, { root: true })
          // }
        }
        break
      }
      default:
        throw new Error(`unsupported Event ${event.type}`)
    }
    let { type, wsItem: itemServer, wsRevision } = event
    logD(f, 'complete')
  }

  // подходит ли object под этот фильтр
  isRestricted (context, filter, objectShort) {
    // logD('isRestricted', filter, objectShort)
    assert(objectShort && objectShort.oid && objectShort.type && objectShort.name, '!objectShort')
    if (!filter) return true
    if (filter.types && !filter.types.includes(objectShort.type)) return false
    if (filter.oids && !filter.oids.includes(objectShort.oid)) return false
    if (filter.name && filter.name !== objectShort.name) return false
    if (filter.nameRegExp && objectShort.name.search(new RegExp(filter.nameRegExp)) === -1) return false
    if (filter.compositionOids) {
      for (let compositionOid of filter.compositionOids) {
        if (!objectShort.meta.items.map(composition => composition.oid).includes(compositionOid)) return false
      }
    }
    return true
  }

  async processEvent2 (context, event) {
    switch (event.type) {
      case 'NODE_CREATED':
        return await this.updateListsNodeCreated(context, event)
      case 'CHAIN_CREATED':
      case 'VOTED':
        return
      default:
        throw new Error(`bad event type ${event.type}`)
    }
  }

// прелетел эвент - создано ядро. Добавить ядро во все сферы и на личную сферу
  async updateListsNodeCreated (context, event) {
    logD('addNode start', event)
    let objectShort = event.object
    assert(objectShort.oid && objectShort.name != null)
    for (let key in context.rootState.cache.cachedItems) {
      let keyPattern = 'list: '
      if (!key.startsWith(keyPattern)) continue
      let { oid, pagination, filter, sortStrategy } = JSON.parse(key.slice(keyPattern.length))
      assert(oid && filter, 'oid && filter')

      if (oid === context.rootState.auth.userOid) { // личная сфера пользователя
        assert(event.subject)
        if (event.subject.oid !== context.rootState.auth.userOid) continue // прилетевшее ядро создано НЕ этим пользователем
        // список - это личная сфера этого пользователя
      }
      assert(event.sphereOids)
      if (!event.sphereOids.includes(oid)) continue // sphereOids - список сфер, на которые падает созданное ядро
      if (!this.isRestricted(context, filter, objectShort)) continue // элемент не подходит под этот фильр

      logD('try add item to list... ', { oid, pagination, filter, sortStrategy })
      await context.dispatch('cache/update', {
        key: key,
        path: '',
        setter: (value) => {
          // { items, count, totalCount, nextPageToken }
          logD('setter: ', value)
          assert(value.items && value.count >= 0 && value.totalCount >= 0)
          let insertedIndx
          if (oid === context.rootState.auth.userOid) insertedIndx = 0
          else insertedIndx = value.items.length
          // вставляем в insertedIndx используем splice для реактивности
          value.items.splice(insertedIndx, 0, { ...objectShort })
          value.count++
          value.totalCount++
          return value
        }
      }, { root: true })
    }
    logD('addNode complete')
  }
}

export { Lists }
