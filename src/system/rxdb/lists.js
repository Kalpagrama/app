import assert from 'assert'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
import { makeId, RxCollectionEnum, rxdb } from 'src/system/rxdb/index'
import { ListsApi as ListApi, ListsApi } from 'src/api/lists'
import { getReactive, updateRxDoc } from 'src/system/rxdb/reactive'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.RXDB_LST)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.RXDB_LST)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.RXDB_LST)
const logC = getLogFunc(LogLevelEnum.CRITICAL, LogModulesEnum.RXDB_LST)

const LstCollectionEnum = Object.freeze({
  LST_SPHERE_NODES: 'LST_SPHERE_NODES',
  LST_SPHERE_CHAINS: 'LST_SPHERE_CHAINS',
  LST_SPHERE_SPHERES: 'LST_SPHERE_SPHERES',
  LST_FEED: 'LST_FEED',
  LST_SUBSCRIBERS: 'LST_SUBSCRIBERS', // подписчики на какой-либо объект
  LST_SUBSCRIPTIONS: 'LST_SUBSCRIPTIONS' // подписки пользователя
})

function makeListCacheId (mangoQuery) {
  assert(mangoQuery && mangoQuery.selector && mangoQuery.selector.rxCollectionEnum, 'bad query 3' + JSON.stringify(mangoQuery))
  let rxCollectionEnum = mangoQuery.selector.rxCollectionEnum
  assert(rxCollectionEnum in LstCollectionEnum, 'bad rxCollectionEnum' + rxCollectionEnum)
  return rxCollectionEnum + '::' + JSON.stringify(mangoQuery)
}

function getMangoQueryFromId (id) {
  let parts = id.split('::')
  assert(parts.length === 2, 'bad id ' + id)
  let collection = parts[0]
  assert(collection in LstCollectionEnum, 'bad collection ' + collection)
  let mangoQuery = JSON.parse(parts[1])
  return mangoQuery
}

// класс для запроса списков
class Lists {
  constructor (cache) {
    this.cache = cache
    // setTimeout(async () => {
    //   let arr = ['AF6DVu7AMAY=', 'AHDF9_IAoIc=', 'AJ2jxUPCMc4=', 'AJ2V+LzCsEU=', 'AJxhm8MCcFo=']
    //   logD('before frind...', arr)
    //   let rxDocs = await this.cache.find({
    //     selector: {
    //       'props.rxCollectionEnum': LstCollectionEnum.LST_SPHERE_NODES,
    //       'props.oid': { $in: arr }
    //     }
    //   })
    //   logD('finded!!!!', rxDocs)
    //   let rxDocsAll = await this.cache.find()
    //   logD('finded!!!! rxDocsAll', rxDocsAll)
    // }, 2000)
  }

  // вернет  список (из кэша или с сервера)
  async find (mangoQuery) {
    let id = makeListCacheId(mangoQuery) // запишется в cache.props.oid
    let fetchFunc = async () => {
      let oid = mangoQuery && mangoQuery.selector.oidSphere ? mangoQuery.selector.oidSphere : null
      let { items, count, totalCount, nextPageToken } = await ListApi.getList(mangoQuery)
      return {
        item: { items, count, totalCount, nextPageToken, oid },
        actualAge: 'day',
        mangoQuery
      }
    }
    let rxDoc = await this.cache.get(id, fetchFunc)
    if (!rxDoc) throw new Error('объект не найден')
    return rxDoc
  }

  // от сервера прилетел эвент (поправим данные в кэше)
  async processEvent (event) {
    assert(rxdb.isLeader(), 'rxdb.isLeader()')
    const f = this.processEvent
    logD(f, 'start')
    const t1 = performance.now()
    switch (event.type) {
      case 'USER_SUBSCRIBED': {
        // списки: подписчики этого объекта
        let rxDocsSubscribers = await this.cache.find({
          selector: {
            'props.rxCollectionEnum': RxCollectionEnum.LST_SUBSCRIBERS,
            'props.oid': event.object.oid
          }
        })
        // списки: подписки этого пользователя
        let rxDocsSubscriptions = await this.cache.find({
          selector: {
            'props.rxCollectionEnum': RxCollectionEnum.LST_SUBSCRIPTIONS,
            'props.oid': event.subject.oid
          }
        })
        // меняем списки
        for (let rxDoc of rxDocsSubscribers) {
          let reactiveItem = getReactive(rxDoc)
          assert(reactiveItem.items, '!reactiveItem.items')
          reactiveItem.items.push(event.subject)
          reactiveItem.count++
          reactiveItem.totalCount++
        }
        for (let rxDoc of rxDocsSubscriptions) {
          let reactiveItem = getReactive(rxDoc)
          assert(reactiveItem.items, '!reactiveItem.items')
          reactiveItem.items.push(event.object)
          reactiveItem.count++
          reactiveItem.totalCount++
        }
        break
      }
      case 'USER_UNSUBSCRIBED': {
        // списки: подписчики этого объекта
        let rxDocsSubscribers = await this.cache.find({
          selector: {
            'props.rxCollectionEnum': RxCollectionEnum.LST_SUBSCRIBERS,
            'props.oid': event.object.oid
          }
        })
        // списки: подписки этого пользователя
        let rxDocsSubscriptions = await this.cache.find({
          selector: {
            'props.rxCollectionEnum': RxCollectionEnum.LST_SUBSCRIPTIONS,
            'props.oid': event.subject.oid
          }
        })
        // меняем списки
        for (let rxDoc of rxDocsSubscribers) {
          let reactiveItem = getReactive(rxDoc)
          assert(reactiveItem.items, '!reactiveItem.items')
          let indx = reactiveItem.items.findIndex(s => s.oid === event.subject.oid)
          if (indx >= 0) {
            reactiveItem.items.splice(indx, 1)
            reactiveItem.count--
            reactiveItem.totalCount--
          }
        }
        for (let rxDoc of rxDocsSubscriptions) {
          let reactiveItem = getReactive(rxDoc)
          assert(reactiveItem.items, '!reactiveItem.items')
          let indx = reactiveItem.items.findIndex(s => s.oid === event.object.oid)
          if (indx >= 0) {
            reactiveItem.items.splice(indx, 1)
            reactiveItem.count--
            reactiveItem.totalCount--
          }
        }
        break
      }
      case 'OBJECT_CREATED':
      case 'OBJECT_DELETED': {
        assert(event.sphereOids && Array.isArray(event.sphereOids), 'event.sphereOids')
        // добавим на все сферы (event.sphereOids)
        let rxCollectionEnum
        if (event.object.type === 'NODE') rxCollectionEnum = LstCollectionEnum.LST_SPHERE_NODES
        else if (event.object.type === 'CHAIN') rxCollectionEnum = LstCollectionEnum.LST_SPHERE_CHAINS
        else throw new Error('bad event.object.type:' + event.object.type)
        let rxDocs = await this.cache.find({
          selector: {
            'props.rxCollectionEnum': rxCollectionEnum,
            'props.oid': { $in: event.sphereOids }
          }
        })
        if (event.type === 'OBJECT_DELETED'){ // удаленный объект может быть на домашней странице
          let rxDocsFeed = await this.cache.find({
            selector: {
              'props.rxCollectionEnum': LstCollectionEnum.LST_FEED,
            }
          })
          rxDocs = [...rxDocs, ...rxDocsFeed]
        }
        logD(f, 'finded lists: ', rxDocs)
        for (let rxDoc of rxDocs) {
          let reactiveItem = getReactive(rxDoc)
          assert(reactiveItem.items, '!reactiveItem.items')
          assert(event.object, '!event.object')
          let indx = reactiveItem.items.findIndex(el => el.oid === event.object.oid)
          if (event.type === 'OBJECT_CREATED') {
            if (indx === -1) {
              reactiveItem.items.splice(0, 0, event.object)
              reactiveItem.count++
              reactiveItem.totalCount++
            }
          } else if (event.type === 'OBJECT_DELETED') {
            logD(f, 'delete object indx=', indx)
            if (indx >= 0) {
              reactiveItem.items.splice(indx, 1)
              reactiveItem.count--
              reactiveItem.totalCount--
            }
          }
        }
        break
      }
      case 'VOTED': {
        if (event.subject.oid === localStorage.getItem('k_user_oid')) {
          // если голосовал текущий юзер - положить в список "проголосованные ядра"
          logD(f, 'find voted nodes start')
          let rxDocs = await this.cache.find({
            selector: {
              'props.rxCollectionEnum': LstCollectionEnum.LST_SPHERE_NODES,
              'props.oid': localStorage.getItem('k_user_oid'),
              'props.mangoQuery.selector.oidAuthor.$ne': localStorage.getItem('k_user_oid')
            }
          })
          logD(f, 'find voted nodes complete', rxDocs)
          for (let rxDoc of rxDocs) {
            let reactiveItem = getReactive(rxDoc)
            assert(reactiveItem.items, '!reactiveItem.items')
            assert(event.object, '!event.object')
            let indx = reactiveItem.items.findIndex(el => el.oid === event.object.oid)
            if (indx === -1) {
              reactiveItem.items.splice(0, 0, event.object)
              reactiveItem.count++
              reactiveItem.totalCount++
            }
          }
        }
        break
      }
      default:
        throw new Error(`unsupported Event ${event.type}`)
    }
    let { type, wsItem: itemServer, wsRevision } = event
    logD(f, `complete: ${performance.now() - t1} msec`)
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
          if (oid === context.rootState.auth.userOid) {
            insertedIndx = 0
          } else {
            insertedIndx = value.items.length
          }
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

export { Lists, LstCollectionEnum }
