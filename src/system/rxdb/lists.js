import assert from 'assert'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
import { RxCollectionEnum, rxdb } from 'src/system/rxdb/index'
import { ListsApi as ListApi, ListsApi } from 'src/api/lists'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.RXDB_LST)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.RXDB_LST)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.RXDB_LST)
const logC = getLogFunc(LogLevelEnum.CRITICAL, LogModulesEnum.RXDB_LST)

const LstCollectionEnum = Object.freeze({
  LST_SPHERE_NODES: 'LST_SPHERE_NODES',
  LST_SPHERE_SPHERES: 'LST_SPHERE_SPHERES',
  LST_FEED: 'LST_FEED',
  LST_USER_SUBSCRIBERS: 'LST_USER_SUBSCRIBERS', // подписчики пользователя
  LST_USER_SUBSCRIPTIONS: 'LST_USER_SUBSCRIPTIONS' // подписки пользователя
})

function makeListCacheId (mangoQuery) {
  assert(mangoQuery && mangoQuery.selector && mangoQuery.selector.rxCollectionEnum, 'bad query' + JSON.stringify(mangoQuery))
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
        actualAge: 'day'
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
    switch (event.type) {
      case 'USER_SUBSCRIBED': {
        // списки: подписчики этого объекта
        let rxDocsSubscribers = await this.cache.find({
          selector: {
            'props.rxCollectionEnum': RxCollectionEnum.LST_USER_SUBSCRIBERS,
            'props.oid': event.object.oid
          }
        })
        // списки: подписки этого пользователя
        let rxDocsSubscriptions = await this.cache.find({
          selector: {
            'props.rxCollectionEnum': RxCollectionEnum.LST_USER_SUBSCRIPTIONS,
            'props.oid': event.subject.oid
          }
        })
        // меняем списки
        for (let rxDoc of rxDocsSubscribers) {
          await rxDoc.atomicUpdate((oldData) => {
            assert(oldData.cached, '!rxDoc.cached')
            oldData.cached.data.items.push(event.subject)
            oldData.cached.data.count++
            oldData.cached.data.totalCount++
            return oldData
          })
        }
        for (let rxDoc of rxDocsSubscriptions) {
          await rxDoc.atomicUpdate((oldData) => {
            assert(oldData.cached.data, '!rxDoc.cached')
            oldData.cached.data.items.push(event.object)
            oldData.cached.data.count++
            oldData.cached.data.totalCount++
            return oldData
          })
        }
        break
      }
      case 'USER_UNSUBSCRIBED': {
        // списки: подписчики этого объекта
        let rxDocsSubscribers = await this.cache.find({
          selector: {
            'props.rxCollectionEnum': RxCollectionEnum.LST_USER_SUBSCRIBERS,
            'props.oid': event.object.oid
          }
        })
        // списки: подписки этого пользователя
        let rxDocsSubscriptions = await this.cache.find({
          selector: {
            'props.rxCollectionEnum': RxCollectionEnum.LST_USER_SUBSCRIPTIONS,
            'props.oid': event.subject.oid
          }
        })
        // меняем списки
        for (let rxDoc of rxDocsSubscribers) {
          await rxDoc.atomicUpdate((oldData) => {
            assert(oldData.cached.data, '!rxDoc.cached')
            let indx = oldData.cached.data.items.findIndex(s => s.oid === event.subject.oid)
            if (indx === -1) return oldData
            oldData.cached.data.items.splice(indx, 1)
            oldData.cached.data.count--
            oldData.cached.data.totalCount--
            return oldData
          })
        }
        for (let rxDoc of rxDocsSubscriptions) {
          await rxDoc.atomicUpdate((oldData) => {
            assert(oldData.cached.data, '!rxDoc.cached')
            let indx = oldData.cached.data.items.findIndex(s => s.oid === event.object.oid)
            if (indx === -1) return oldData
            oldData.cached.data.items.splice(indx, 1)
            oldData.cached.data.count--
            oldData.cached.data.totalCount--
            return oldData
          })
        }
        break
      }
      case 'NODE_CREATED': {
        assert(event.sphereOids && Array.isArray(event.sphereOids), 'event.sphereOids')
        // добавим на все сферы
        let rxDocs = await this.cache.find({
          selector: {
            'props.rxCollectionEnum': LstCollectionEnum.LST_SPHERE_NODES,
            'props.oid': { $in: event.sphereOids }
          }
        })
        logD(f, 'finded lists: ', rxDocs)
        for (let rxDoc of rxDocs) {
          let mangoQuery = getMangoQueryFromId(rxDoc.id)
          // todo проверить, что event.object isRestricted by mangoQuery
          await rxDoc.atomicUpdate((oldData) => {
            assert(oldData.cached.data, '!rxDoc.cached')
            assert(event.object, '!event.object')
            let indx = oldData.cached.data.items.findIndex(el => el.oid === event.object.oid)
            if (indx === -1) oldData.cached.data.items.splice(0, 0, event.object)
            oldData.cached.data.count++
            oldData.cached.data.totalCount++
            return oldData
          })
        }
        break
      }
      case 'VOTED': {
        if (event.subject.oid === localStorage.getItem('k_user_oid')) {
          // если голосовал текущий юзер - положить в список "проголосованные ядра"
          let rxDocs = await this.cache.find({
            selector: {
              'props.rxCollectionEnum': LstCollectionEnum.LST_SPHERE_NODES,
              'props.oid': localStorage.getItem('k_user_oid')
            }
          })
          for (let rxDoc of rxDocs) {
            let mangoQuery = getMangoQueryFromId(rxDoc.id)
            // todo проверить, что event.object isRestricted by mangoQuery
            await rxDoc.atomicUpdate((oldData) => {
              assert(event.object, '!event.object')
              let indx = oldData.cached.data.items.findIndex(el => el.oid === event.object.oid)
              if (indx === -1) oldData.cached.data.items.splice(0, 0, event.object)
              oldData.cached.data.count++
              oldData.cached.data.totalCount++
              return oldData
            })
          }
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
