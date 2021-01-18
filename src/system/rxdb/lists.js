import assert from 'assert'
import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/system/log'
import { rxdb } from 'src/system/rxdb/index_browser'
import { RxCollectionEnum, LstCollectionEnum } from 'src/system/rxdb/common'
import { ListsApi as ListApi, ListsApi } from 'src/api/lists'
import { getReactiveDoc, ReactiveListWithPaginationFactory, updateRxDocPayload } from 'src/system/rxdb/reactive'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.RXDB_LST)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.RXDB_LST)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.RXDB_LST)
const logC = getLogFunc(LogLevelEnum.CRITICAL, LogSystemModulesEnum.RXDB_LST)

function makeListCacheId (mangoQuery) {
   assert(mangoQuery && mangoQuery.selector && mangoQuery.selector.rxCollectionEnum, 'bad query 3' + JSON.stringify(mangoQuery))
   let rxCollectionEnum = mangoQuery.selector.rxCollectionEnum
   assert(rxCollectionEnum in LstCollectionEnum, 'bad rxCollectionEnum' + rxCollectionEnum)
   return rxCollectionEnum + '::' + JSON.stringify(mangoQuery) + '::{}'
}

function getMangoQueryFromId (id) {
   let parts = id.split('::')
   assert(parts.length === 3, 'bad id ' + id)
   let collection = parts[0]
   assert(collection in LstCollectionEnum, 'bad collection ' + collection)
   let mangoQuery = JSON.parse(parts[1])
   return mangoQuery
}

// класс для запроса списков
class Lists {
   constructor (cache) {
      this.cache = cache
      Lists.cache = cache
   }

   // вернет  список (из кэша или с сервера)
   async find (mangoQuery) {
      const f = this.find
      // logD(f, 'start')
      let id = makeListCacheId(mangoQuery) // запишется в cache.props.oid
      let fetchFunc = async () => {
         let oid = mangoQuery && mangoQuery.selector.oidSphere ? mangoQuery.selector.oidSphere : null
         let { items, count, totalCount, nextPageToken } = await ListApi.getList(mangoQuery)
         // todo
         let itemFilter = () => {
            // фильтровать items по mangoQuery
            return true
         }
         items = items.filter(itemFilter)
         return {
            item: { items, count: items.length, totalCount, nextPageToken, oid },
            actualAge: 'day',
            mangoQuery
         }
      }
      let rxDoc = await this.cache.get(id, fetchFunc)
      if (!rxDoc) throw new Error('объект не найден')
      return rxDoc
   }

   // запросит с сервера новые данные и загрузит в rxDoc
   async paginate (rxDoc, token) {
      const f = this.paginate
      // logD(f, 'start')
      assert(rxDoc && token, '!rxdoc && token')
      return rxDoc
   }

   static async getBlackLists () {
      let blackLists = await rxdb.get(RxCollectionEnum.META, 'blackLists')
      if (blackLists) blackLists = JSON.parse(blackLists)
      else blackLists = { blackListObjectOids: [], blackListAuthorOids: [] }
      assert(blackLists && blackLists.blackListObjectOids && blackLists.blackListAuthorOids, 'bad blackLists')
      return blackLists
   }

   // список последних созданных/удаленных сущностей и сферы на которые они попали
   // (объект возвращается раньше, чем изментся сфера (меняются только после голосования))
   // то мы можем запросить сферу до того как объект будет на нее помещен
   static async getObjectsWithRelatedSpheres () {
      let objectsWithRelatedSpheres = await rxdb.get(RxCollectionEnum.META, 'objectsWithRelatedSpheres')
      if (objectsWithRelatedSpheres) objectsWithRelatedSpheres = JSON.parse(objectsWithRelatedSpheres)
      else objectsWithRelatedSpheres = []
      assert(objectsWithRelatedSpheres && Array.isArray(objectsWithRelatedSpheres), 'bad objectsWithRelatedSpheres')
      return objectsWithRelatedSpheres
   }

   static isElementBlacklisted (el, blackLists) {
      assert(blackLists && blackLists.blackListObjectOids && blackLists.blackListAuthorOids, 'bad blackLists')
      assert(el, 'bad el')
      if (el.oid && blackLists.blackListObjectOids.includes(el.oid)) return true
      if (el.author && blackLists.blackListAuthorOids.includes(el.author.oid)) return true
      return false
   }

   // фильтрация всех лент в соответствии с blackLists
   async hideObjectOrSource (oid, authorOid) {
      const f = this.hideObjectOrSource
      assert(oid || authorOid, 'bad oid')
      logD(f, 'start')
      let blackLists = await Lists.getBlackLists()
      if (oid && !blackLists.blackListObjectOids.includes(oid)) blackLists.blackListObjectOids.push(oid)
      else if (authorOid && !blackLists.blackListAuthorOids.includes(authorOid)) blackLists.blackListAuthorOids.push(authorOid)
      await rxdb.set(RxCollectionEnum.META, { id: 'blackLists', valueString: JSON.stringify(blackLists) })

      let rxDocs = await Lists.cache.find({
         selector: {
            'props.rxCollectionEnum': LstCollectionEnum.LST_SPHERE_ITEMS
         }
      })
      for (let rxDoc of rxDocs) {
         let findResult = await (new ReactiveListWithPaginationFactory()).create(rxDoc, null)
         await findResult.refresh()
         // let reactiveItem = getReactiveDoc(rxDoc).getPayload()
         // let newItems = reactiveItem.items.filter(el => !this.isElementBlacklisted(el, blackLists))
         // let countDiff = reactiveItem.items.length - newItems.length
         // assert(countDiff >= 0, 'countDiff >= 0')
         // if (countDiff) {
         //    reactiveItem.items.splice(0, reactiveItem.items.length, ...newItems)
         //    reactiveItem.count -= countDiff
         //    reactiveItem.totalCount -= countDiff
         // }
      }
   }

   async addRemoveObjectToLists (type, relatedSphereOids, object) {
      assert(type.in('OBJECT_DELETED', 'OBJECT_CREATED'), 'type in ???')
      assert(relatedSphereOids && Array.isArray(relatedSphereOids), 'bad array')
      assert(object && object.type && object.oid, 'bad obj')
      const f = this.addRemoveObjectToLists
      logD(f, 'start', relatedSphereOids, object)
      const t1 = performance.now()
      let objectsWithRelatedSpheres = await Lists.getObjectsWithRelatedSpheres()
      objectsWithRelatedSpheres.splice(10, objectsWithRelatedSpheres.length) // не более 10 последних
      objectsWithRelatedSpheres.push({type, relatedSphereOids, oidObject: object.oid})
      await rxdb.set(RxCollectionEnum.META, { id: 'objectsWithRelatedSpheres', valueString: JSON.stringify(objectsWithRelatedSpheres) })
      // добавим на все сферы (relatedSphereOids)
      let rxDocs = await Lists.cache.find({
         selector: {
            'props.rxCollectionEnum': LstCollectionEnum.LST_SPHERE_ITEMS,
            'props.oid': { $in: relatedSphereOids },
            'props.mangoQuery.selector.objectTypeEnum.$in': { $in: [object.type] }
         }
      })
      if (type === 'OBJECT_DELETED') { // удаленный объект может быть на домашней странице
         let rxDocsFeed = await Lists.cache.find({
            selector: {
               'props.rxCollectionEnum': LstCollectionEnum.LST_FEED
            }
         })
         rxDocs = [...rxDocs, ...rxDocsFeed]
      }
      logD(f, 'finded lists: ', rxDocs)
      for (let rxDoc of rxDocs) {
         logD('apply to rxdoc', rxDoc.toJSON())
         let reactiveItem = getReactiveDoc(rxDoc).getPayload()
         assert(reactiveItem.items, '!reactiveItem.items')
         let indx = reactiveItem.items.findIndex(el => el.oid === object.oid)
         if (type === 'OBJECT_CREATED') {
            if (indx === -1) {
               reactiveItem.items.splice(0, 0, {oid: object.oid})
               reactiveItem.count++
               reactiveItem.totalCount++
            }
         } else if (type === 'OBJECT_DELETED') {
            if (indx >= 0) {
               logD(f, 'delete object from list', indx)
               reactiveItem.items.splice(indx, 1)
               reactiveItem.count--
               reactiveItem.totalCount--
            }
         }
      }
   }

   // от сервера прилетел эвент (поправим данные в кэше)
   async processEvent (event) {
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
               let reactiveItem = getReactiveDoc(rxDoc).getPayload()
               assert(reactiveItem.items, '!reactiveItem.items')
               logD(f, 'add subscriber to list')
               reactiveItem.items.push(event.subject)
               reactiveItem.count++
               reactiveItem.totalCount++
            }
            for (let rxDoc of rxDocsSubscriptions) {
               let reactiveItem = getReactiveDoc(rxDoc).getPayload()
               assert(reactiveItem.items, '!reactiveItem.items')
               logD(f, 'add subscription to list')
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
               let reactiveItem = getReactiveDoc(rxDoc).getPayload()
               assert(reactiveItem.items, '!reactiveItem.items')
               let indx = reactiveItem.items.findIndex(s => s.oid === event.subject.oid)
               if (indx >= 0) {
                  logD(f, 'remove subscriber from list')
                  reactiveItem.items.splice(indx, 1)
                  reactiveItem.count--
                  reactiveItem.totalCount--
               }
            }
            for (let rxDoc of rxDocsSubscriptions) {
               let reactiveItem = getReactiveDoc(rxDoc).getPayload()
               assert(reactiveItem.items, '!reactiveItem.items')
               let indx = reactiveItem.items.findIndex(s => s.oid === event.object.oid)
               if (indx >= 0) {
                  logD(f, 'remove subscription from list')
                  reactiveItem.items.splice(indx, 1)
                  reactiveItem.count--
                  reactiveItem.totalCount--
               }
            }
            break
         }
         case 'OBJECT_CREATED':
         case 'OBJECT_DELETED': {
            assert(event.relatedSphereOids && Array.isArray(event.relatedSphereOids), 'event.relatedSphereOids')
            // добавим на все сферы (event.relatedSphereOids)
            await this.addRemoveObjectToLists(event.type, event.relatedSphereOids, event.object)
            //
            // let rxDocs = await this.cache.find({
            //   selector: {
            //     'props.rxCollectionEnum': LstCollectionEnum.LST_SPHERE_ITEMS,
            //     'props.oid': { $in: event.relatedSphereOids },
            //     'props.mangoQuery.selector.objectTypeEnum.$in': {$in: [event.object.type]}
            //   }
            // })
            // if (event.type === 'OBJECT_DELETED'){ // удаленный объект может быть на домашней странице
            //   let rxDocsFeed = await this.cache.find({
            //     selector: {
            //       'props.rxCollectionEnum': LstCollectionEnum.LST_FEED,
            //     }
            //   })
            //   rxDocs = [...rxDocs, ...rxDocsFeed]
            // }
            // logD(f, 'finded lists: ', rxDocs)
            // for (let rxDoc of rxDocs) {
            //   logD('apply event to rxdoc', rxDoc.toJSON())
            //   let reactiveItem = getReactiveDoc(rxDoc).getPayload()
            //   assert(reactiveItem.items, '!reactiveItem.items')
            //   assert(event.object, '!event.object')
            //   let indx = reactiveItem.items.findIndex(el => el.oid === event.object.oid)
            //   if (event.type === 'OBJECT_CREATED') {
            //     if (indx === -1) {
            //       logD(f, 'add created object to begin of list.', event.object)
            //       reactiveItem.items.splice(0, 0, event.object)
            //       reactiveItem.count++
            //       reactiveItem.totalCount++
            //     }
            //   } else if (event.type === 'OBJECT_DELETED') {
            //     if (indx >= 0) {
            //       logD(f, 'delete object from list', indx)
            //       reactiveItem.items.splice(indx, 1)
            //       reactiveItem.count--
            //       reactiveItem.totalCount--
            //     }
            //   }
            // }
            break
         }
         case 'VOTED': {
            if (event.subject.oid === rxdb.getCurrentUser().oid) {
               // если голосовал текущий юзер - положить в список "проголосованные ядра"
               logD(f, 'find voted nodes start')
               let rxDocs = await this.cache.find({
                  selector: {
                     'props.rxCollectionEnum': LstCollectionEnum.LST_SPHERE_ITEMS,
                     'props.oid': rxdb.getCurrentUser().oid,
                     'props.mangoQuery.selector.oidAuthor.$ne': rxdb.getCurrentUser().oid
                  }
               })
               logD(f, 'find voted nodes complete', rxDocs)
               for (let rxDoc of rxDocs) {
                  let reactiveItem = getReactiveDoc(rxDoc).getPayload()
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
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
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

      // todo metaStatic уже нет. (прилетают ленты где есть только oid)
      // if (filter.compositionOids) {
      //   for (let compositionOid of filter.compositionOids) {
      //     assert(objectShort.metaStatic, '!objectShort.metaStatic')
      //     if (!objectShort.metaStatic.items.map(composition => composition.oid).includes(compositionOid)) return false
      //   }
      // }
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
         assert(event.relatedSphereOids)
         if (!event.relatedSphereOids.includes(oid)) continue // relatedSphereOids - список сфер, на которые падает созданное ядро
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

export { Lists }
