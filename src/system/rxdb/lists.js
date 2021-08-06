import assert from 'assert'
import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/system/log'
import { rxdb } from 'src/system/rxdb/index_browser'
import {
   RxCollectionEnum,
   LstCollectionEnum,
   checkMangoCond,
   getChapterIdFromCfi,
   getTocIdFromCfi
} from 'src/system/rxdb/common'
import { ListsApi as ListApi, ListsApi } from 'src/api/lists'
import { getReactive, ReactiveListWithPaginationFactory, updateRxDocPayload } from 'src/system/rxdb/reactive'
import { EpubCFI } from 'epubjs'
import { makeId } from 'src/system/rxdb/index'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.RXDB_LST)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.RXDB_LST)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.RXDB_LST)
const logC = getLogFunc(LogLevelEnum.CRITICAL, LogSystemModulesEnum.RXDB_LST)

export function makeListCacheId (mangoQuery) {
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

   // вернет  список (из кэша или с сервера)
   async find (mangoQuery) {
      const f = this.find
      // logD(f, 'start')
      let id = makeListCacheId(mangoQuery) // запишется в cache.props.oid
      let fetchFunc = async () => {
         let oid = mangoQuery && mangoQuery.selector.oidSphere ? mangoQuery.selector.oidSphere : null
         let {
            items,
            totalCount,
            nextPageToken,
            prevPageToken,
            currentPageToken
         } = await ListApi.getList(mangoQuery)
         // todo
         let itemFilter = () => {
            // фильтровать items по mangoQuery
            return true
         }
         items = items.filter(itemFilter)
         return {
            item: { items, totalCount, nextPageToken, prevPageToken, currentPageToken, oid },
            actualAge: 'hour',
            mangoQuery
         }
      }
      let rxDoc = await this.cache.get(id, fetchFunc)
      if (!rxDoc) throw new Error('объект не найден')

      // на тот случай, что события о создании объекта пришли раньше того, как объект был помещен в ленты
      if (rxDoc.props.mangoQuery.selector.rxCollectionEnum === RxCollectionEnum.LST_SPHERE_ITEMS) {
         assert(rxDoc.props.mangoQuery.selector.oidSphere, '!oidSphere')
         let objectsWithRelatedSpheres = await Lists.getObjectsWithRelatedSpheres()
         let processedOids = []
         for (let { type, relatedSphereOids, oidObject } of objectsWithRelatedSpheres) {
            assert(oidObject && relatedSphereOids && type.in('OBJECT_DELETED', 'OBJECT_CREATED'), '!getObjectsWithRelatedSpheres')
            if (relatedSphereOids.includes(rxDoc.props.mangoQuery.selector.oidSphere)) { // созданный / удаленный объект на этой сфере
               await this.addRemoveObjectToRxDoc(type, rxDoc, { oid: oidObject })
               processedOids.push(oidObject)
            }
         }
         // удаляем из списка те, что добавились в ленты
         objectsWithRelatedSpheres = objectsWithRelatedSpheres.filter(item => !processedOids.includes(item.oidObject))
         await rxdb.set(RxCollectionEnum.META, {
            id: 'objectsWithRelatedSpheres',
            valueString: JSON.stringify(objectsWithRelatedSpheres)
         })
      }
      return rxDoc
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
         let findResult = await (new ReactiveListWithPaginationFactory()).create(rxDoc)
         await findResult.refresh()
         // let reactiveItem = getReactive(rxDoc).getPayload()
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

   async addRemoveCommentToObj (type, oid, comment) {
      assert(oid && comment && type && type.in('COMMENT_DELETED', 'COMMENT_CREATED'), 'bad addRemoveCommentToObj params' + JSON.stringify({
         type,
         oid,
         comment
      }))
      const f = this.addRemoveCommentToObj
      logD(f, 'start', oid, type, comment)
      const t1 = performance.now()
      let rxDocs = await Lists.cache.find({
         selector: {
            'props.rxCollectionEnum': LstCollectionEnum.LST_COMMENTS,
            'props.oid': oid
         }
      })
      for (let rxDoc of rxDocs) {
         let reactiveDoc = getReactive(rxDoc).getPayload()
         let indx = reactiveDoc.items.findIndex(el => el.id === comment.id)
         if (type === 'COMMENT_CREATED') {
            if (indx === -1) {
               reactiveDoc.items.splice(0, 0, comment)
               reactiveDoc.totalCount++
            }
         } else if (type === 'OBJECT_DELETED') {
            if (indx >= 0) {
               logD(f, 'delete object from list', indx)
               reactiveDoc.items.splice(indx, 1)
               reactiveDoc.totalCount--
            }
         }
      }
   }

   async addRemoveObjectToRxDoc (type, rxDoc, object) {
      const f = this.addRemoveObjectToRxDoc
      let mangoQuery = rxDoc.props.mangoQuery
      let contentOid = rxDoc.props.oid
      logD('apply to rxdoc', rxDoc.id, mangoQuery)
      let reactiveDoc = getReactive(rxDoc).getPayload()
      let foundGroup
      let objectFiguresAbsoluteList = []
      if (!mangoQuery.selector.groupByContentLocation) { // список без группировки
         foundGroup = reactiveDoc
      } else { // список c группировкой
         // для списка с группировкой нужен полный объект (нужны фигуры!) А через эвенты к нам прилетают неполные объекты object
         let objectFull = await rxdb.get(RxCollectionEnum.LOCAL, null, { id: makeId(RxCollectionEnum.OBJ, object.oid) })

         if (objectFull) {
            let intersects = (figuresAbsoluteLeft, figuresAbsoluteRight) => { // содержит ли диапазон фигуру
               assert(Array.isArray(figuresAbsoluteLeft) && Array.isArray(figuresAbsoluteRight), 'bad figuresAbsolute!')
               if (!figuresAbsoluteLeft.length || !figuresAbsoluteRight.length) return true // [] - это контент целиком
               let polygonInresects = (figureLeft, figureRight) => { // пересечение полигогнов
                  if (!figureLeft.points.length && !figureRight.points.length) return true
                  logE('TODO polygonInresects')
                  return false
               }
               let epubCfiIntersects = (figureLeft, figureRight) => { // пересечение куcков книги
                  if (!figureLeft.epubCfi && !figureRight.epubCfi) return true
                  if (figureLeft.epubChapterId && figureRight.epubCfi) {
                     let tocIdLeft = figureLeft.epubTocId || ''
                     let tocIdRight = getTocIdFromCfi(figureRight.epubCfi) || tocIdLeft // если в epubCfi не указана глава
                     // eslint-disable-next-line eqeqeq
                     return getChapterIdFromCfi(figureRight.epubCfi) === figureLeft.epubChapterId && tocIdRight === tocIdLeft
                  } else if (figureRight.epubChapterId && figureLeft.epubCfi) {
                     let tocIdRight = figureRight.epubTocId || ''
                     let tocIdLeft = getTocIdFromCfi(figureLeft.epubCfi) || tocIdRight // если в epubCfi не указана глава
                     // eslint-disable-next-line eqeqeq
                     return getChapterIdFromCfi(figureLeft.epubCfi) === figureRight.epubChapterId && tocIdRight === tocIdLeft
                  }
                  logE('TODO epubCfiInresects сделать реальную имплементацию пересечения epubCfi!!!')
                  return false
               }
               for (let i = 0; i < figuresAbsoluteLeft.length; i++) {
                  let figureLeftStart = figuresAbsoluteLeft[i]
                  let figureLeftEnd = figuresAbsoluteLeft[i + 1] || figureLeftStart // иногда в массиве только 1 элемент
                  for (let j = 0; j < figuresAbsoluteRight.length; j++) {
                     let figureRightStart = figuresAbsoluteRight[j]
                     let figureRightEnd = figuresAbsoluteRight[j + 1] || figureRightStart // иногда в массиве только 1 элемент
                     // a.start <= b.end AND a.end >= b.start
                     let leftStartT = figureLeftStart.t || -1
                     let leftEndT = figureLeftEnd.t || -1
                     let rightStartT = figureRightStart.t || -1
                     let rightEndT = figureRightEnd.t || -1
                     let tCheck = leftStartT <= rightEndT && leftEndT >= rightStartT
                     let polygonCheck =
                        polygonInresects(figureLeftStart, figureRightStart) ||
                        polygonInresects(figureLeftStart, figureRightEnd) ||
                        polygonInresects(figureLeftEnd, figureRightStart) ||
                        polygonInresects(figureLeftEnd, figureRightEnd)
                     let epubCfiCheck =
                        epubCfiIntersects(figureLeftStart, figureRightStart) ||
                        epubCfiIntersects(figureLeftStart, figureRightEnd) ||
                        epubCfiIntersects(figureLeftEnd, figureRightStart) ||
                        epubCfiIntersects(figureLeftEnd, figureRightEnd)
                     if (tCheck && polygonCheck && epubCfiCheck) return true
                  }
               }
               return false
            }
            // перебрать все группы из имеющихся и найти первую, подходящую под FiguresAbsolute
            if (reactiveDoc.items.length === 0) {
               // создадим первую группу руками
               let group = {
                  name: 'whole',
                  items: [],
                  totalCount: 0,
                  nextPageToken: null,
                  prevPageToken: null,
                  currentPageToken: null,
                  figuresAbsolute: [], // весь контент
                  thumbUrl: null,
                  __typename: 'Group' // чтобы реактивнй список мог понять что это группа
               }
               reactiveDoc.items.splice(0, 0, group)
            }
            for (let group of reactiveDoc.items) {
               let groupFiguresAbsolute = group.figuresAbsolute
               assert(groupFiguresAbsolute, '!group.figuresAbsolute')
               // вернет все области контента, задествованные на этом ядре
               let findObjectFigures = (objectFull, contentOid) => {
                  assert(objectFull.type.in('NODE', 'JOINT'), 'bad type essence')
                  assert(objectFull.items, '!essence items')
                  let res = []
                  for (let item of objectFull.items) {
                     if (item.type === 'COMPOSITION') {
                        assert(item.layers && item.layers.length, '!item.layers')
                        for (let layer of item.layers) {
                           if (layer.contentOid === contentOid) res.push(layer.figuresAbsolute)
                        }
                     } else if (item.type.in('NODE', 'JOINT')) {
                        res.push(...findObjectFigures(item, contentOid)) // рекурсивно идем внутрь
                     } else if (item.oid === contentOid) {
                        res.push([]) // весь контент
                     }
                  }
                  return res
               }
               objectFiguresAbsoluteList = findObjectFigures(objectFull, contentOid)
               for (let objectFiguresAbsolute of objectFiguresAbsoluteList) {
                  assert(objectFiguresAbsolute, '!objectFiguresAbsolute')
                  if (intersects(groupFiguresAbsolute, objectFiguresAbsolute)) {
                     foundGroup = group
                     break // берем первую подходящую
                  }
               }
               if (foundGroup) break
            }
         } else {
            // если объекта в кэше нет - ничего не поделать! мы не знаем в какю группу его включить!
            // todo поставить ttl = zero на этом списке
         }
      }
      if (foundGroup) {
         assert(foundGroup.items, '!foundGroup.items')
         assert(foundGroup.totalCount >= 0, 'foundGroup.totalCount >= 0')
         // { oid, name, vertexType, figuresAbsoluteList, internalItemOids, rate, weight, countVotes }
         let indx = foundGroup.items.findIndex(el => el.oid === object.oid)
         if (type === 'OBJECT_CREATED') {
            if (indx === -1) {
               foundGroup.items.splice(0, 0, {
                  oid: object.oid,
                  figuresAbsoluteList: objectFiguresAbsoluteList,
                  internalItemOids: []
               })
               foundGroup.totalCount++
            }
         } else if (type === 'OBJECT_DELETED') {
            if (indx >= 0) {
               logD(f, 'delete object from list', indx)
               foundGroup.items.splice(indx, 1)
               foundGroup.totalCount--
            }
         }
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
      objectsWithRelatedSpheres.push({ type, relatedSphereOids, oidObject: object.oid })
      await rxdb.set(RxCollectionEnum.META, {
         id: 'objectsWithRelatedSpheres',
         valueString: JSON.stringify(objectsWithRelatedSpheres)
      })
      // добавим на все сферы (relatedSphereOids)
      let rxDocs = await Lists.cache.find({
         selector: {
            'props.rxCollectionEnum': LstCollectionEnum.LST_SPHERE_ITEMS,
            'props.oid': { $in: relatedSphereOids }
            // 'props.mangoQuery.selector.objectTypeEnum.$in': { $in: [object.type] }
         }
      })
      rxDocs = rxDocs.filter(rxDoc => {
         assert(rxDoc.props.mangoQuery, '!mangoQuery')
         assert(object.type, '!event.object.type')
         if (rxDoc.props.mangoQuery.selector.objectTypeEnum && !checkMangoCond(rxDoc.props.mangoQuery.selector.objectTypeEnum, object.type)) return false
         return true
      })
      if (type === 'OBJECT_DELETED') { // удаленный объект может быть на домашней странице
         let rxDocsFeed = await Lists.cache.find({
            selector: {
               'props.rxCollectionEnum': LstCollectionEnum.LST_FEED
            }
         })
         rxDocs = [...rxDocs, ...rxDocsFeed]
      }
      logD(f, 'finded lists: ', rxDocs.map(rxDoc => rxDoc.id))
      for (let rxDoc of rxDocs) {
         await this.addRemoveObjectToRxDoc(type, rxDoc, object)
      }
      logD(f, 'complete')
   }

   async addCutToContent (contentOid, contentCut) {
      assert(contentOid && contentCut, 'contentOid && contentCut')
      const f = this.addRemoveCutToContent
      logD(f, 'start', contentCut)

      // добавим на все сферы (relatedSphereOids)
      let rxDocs = await Lists.cache.find({
         selector: {
            'props.rxCollectionEnum': LstCollectionEnum.LST_CONTENT_CUTS,
            'props.oid': { $in: [contentOid] }
         }
      })
      logD(f, 'finded rxDoc lists: ', rxDocs.map(rxDoc => rxDoc.id))
      for (let rxDoc of rxDocs) {
         let reactiveDoc = getReactive(rxDoc).getPayload()
         assert(reactiveDoc.items, '!reactiveDoc.items')
         assert(reactiveDoc.totalCount >= 0, 'reactiveDoc.totalCount >= 0')
         // { oid, name, vertexType, figuresAbsoluteList, internalItemOids, rate, weight, countVotes }
         let indx = reactiveDoc.items.findIndex(el => el.cutId === contentCut.cutId)
         if (indx === -1) {
            reactiveDoc.items.splice(0, 0, contentCut)
            reactiveDoc.totalCount++
         }
      }
   }

   // от сервера прилетел эвент (поправим данные в кэше)
   async processEvent (event) {
      const f = this.processEvent
      logD(f, 'start', event)
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
            rxDocsSubscriptions = rxDocsSubscriptions.filter(rxDoc => {
               assert(rxDoc.props.mangoQuery, '!mangoQuery')
               assert(event.object.type, '!event.object.type')
               if (rxDoc.props.mangoQuery.selector.objectTypeEnum && !checkMangoCond(rxDoc.props.mangoQuery.selector.objectTypeEnum, event.object.type)) return false
               return true
            })
            // меняем списки
            for (let rxDoc of rxDocsSubscribers) {
               let reactiveItem = getReactive(rxDoc).getPayload()
               assert(reactiveItem.items, '!reactiveItem.items')
               logD(f, 'add subscriber to list')
               reactiveItem.items.push(event.subject)
               reactiveItem.totalCount++
            }
            for (let rxDoc of rxDocsSubscriptions) {
               let reactiveItem = getReactive(rxDoc).getPayload()
               assert(reactiveItem.items, '!reactiveItem.items')
               logD(f, 'add subscription to list')
               reactiveItem.items.push(event.object)
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
            rxDocsSubscriptions = rxDocsSubscriptions.filter(rxDoc => {
               assert(rxDoc.props.mangoQuery, '!mangoQuery')
               assert(event.object.type, '!event.object.type')
               if (rxDoc.props.mangoQuery.selector.objectTypeEnum && !checkMangoCond(rxDoc.props.mangoQuery.selector.objectTypeEnum, event.object.type)) return false
               return true
            })
            // меняем списки
            for (let rxDoc of rxDocsSubscribers) {
               let reactiveItem = getReactive(rxDoc).getPayload()
               assert(reactiveItem.items, '!reactiveItem.items')
               let indx = reactiveItem.items.findIndex(s => s.oid === event.subject.oid)
               if (indx >= 0) {
                  logD(f, 'remove subscriber from list')
                  reactiveItem.items.splice(indx, 1)
                  reactiveItem.totalCount--
               }
            }
            for (let rxDoc of rxDocsSubscriptions) {
               let reactiveItem = getReactive(rxDoc).getPayload()
               assert(reactiveItem.items, '!reactiveItem.items')
               let indx = reactiveItem.items.findIndex(s => s.oid === event.object.oid)
               if (indx >= 0) {
                  logD(f, 'remove subscription from list')
                  reactiveItem.items.splice(indx, 1)
                  reactiveItem.totalCount--
               }
            }
            break
         }
         case 'COMMENT_CREATED':
         case 'COMMENT_DELETED':
            await this.addRemoveCommentToObj(event.type, event.object.oid, event.comment)
            break
         case 'OBJECT_CREATED':
         case 'OBJECT_DELETED': {
            assert(event.relatedSphereOids && Array.isArray(event.relatedSphereOids), 'event.relatedSphereOids')
            // добавим на все сферы (event.relatedSphereOids)
            await this.addRemoveObjectToLists(event.type, event.relatedSphereOids, event.object)
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
                  let reactiveItem = getReactive(rxDoc).getPayload()
                  assert(reactiveItem.items, '!reactiveItem.items')
                  assert(event.object, '!event.object')
                  let indx = reactiveItem.items.findIndex(el => el.oid === event.object.oid)
                  if (indx === -1) {
                     reactiveItem.items.splice(0, 0, event.object)
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
               // { items, count, totalCount, nextPageToken, currentPageToken, prevPageToken }
               logD('setter: ', value)
               assert(value.items && value.totalCount >= 0)
               let insertedIndx
               if (oid === context.rootState.auth.userOid) {
                  insertedIndx = 0
               } else {
                  insertedIndx = value.items.length
               }
               // вставляем в insertedIndx используем splice для реактивности
               value.items.splice(insertedIndx, 0, { ...objectShort })
               value.totalCount++
               return value
            }
         }, { root: true })
      }
      logD('addNode complete')
   }
}

export { Lists }
