import { isRxCollection } from 'rxdb'
import assert from 'assert'
import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/system/log'

const logDT = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.TEST)

const RxModuleEnum = Object.freeze({
   WS: 'WS',
   CACHE: 'CACHE'
})

const WsItemTypeEnum = Object.freeze({
   WS_ANY: 'WS_ANY', // нужно только для запросов (рельных объектов с таким типом нет)
   WS_NODE: 'WS_NODE',
   WS_CONTENT: 'WS_CONTENT',
   WS_SPHERE: 'WS_SPHERE',
   WS_BOOKMARK: 'WS_BOOKMARK',
   WS_JOINT: 'WS_JOINT',
   WS_COLLECTION: 'WS_COLLECTION',
   WS_BOARD: 'WS_BOARD',
   WS_COURSE: 'WS_COURSE',

})
const WsCollectionEnum = Object.freeze({
   ...WsItemTypeEnum,
   WS_CHANGES: 'WS_CHANGES'
})

const LstCollectionEnum = Object.freeze({
   LST_SPHERE_ITEMS: 'LST_SPHERE_ITEMS', // элементы на сфере
   LST_FEED: 'LST_FEED',
   LST_SUBSCRIBERS: 'LST_SUBSCRIBERS', // подписчики на какой-либо объект
   LST_SUBSCRIPTIONS: 'LST_SUBSCRIPTIONS', // подписки пользователя
   LST_COMMENTS: 'LST_COMMENTS', // комменты под ядром / сферой
   LST_SEARCH: 'LST_SEARCH',
   LST_CONTENT_CUTS: 'LST_CONTENT_CUTS'
})

const RxCollectionEnum = Object.freeze({
   ...WsCollectionEnum, // списки мастерской
   ...LstCollectionEnum, // списки из objectShort
   OBJ: 'OBJ', // список закэшированных объектов
   GQL_QUERY: 'GQL_QUERY', // произвольный(из конечного списка) запрос к серверу
   LOCAL: 'LOCAL', // иное (любые данные, хранимые тоько на клиенте) (удаялется по мере заполнения кэша)
   META: 'META'
})

// для работы вне rxdb (такая же ф-я не сервере - синхронить!)
function checkMangoCond (mangoCond, value) {
   if (typeof mangoCond === 'string' || typeof mangoCond === 'boolean') return mangoCond === value
   assert(typeof mangoCond === 'object')
   if (mangoCond.$eq) return mangoCond.$eq === value
   else if (mangoCond.$ne) return mangoCond.$ne !== value
   else if (mangoCond._dollar_ne) return mangoCond._dollar_ne !== value
   else if (mangoCond.$gt) return value > mangoCond.$gt
   else if (mangoCond.$gte) return value >= mangoCond.$gte
   else if (mangoCond.$lt) return value < mangoCond.$lt
   else if (mangoCond.$lte) return value <= mangoCond.$lte
   else if (mangoCond.$in) return mangoCond.$in.includes(value)
   else if (mangoCond._dollar_in) return mangoCond._dollar_in.includes(value)
   else if (mangoCond.$nin) return !mangoCond.$nin.includes(value)
   else if (mangoCond._dollar_nin) return !mangoCond._dollar_nin.includes(value)
   else if (mangoCond.$and) return mangoCond.$and.reduce((accumulator, nestedMangoCond) => accumulator && checkMangoCond(nestedMangoCond, value), true)
   else throw new Error(`bad mangoCond ${mangoCond}`)
}

function getChapterIdFromCfi (epubCfi) {
   // safari не поддерживает Lookbehind!!!
   // let match // = epubCfi.match(/(?<=epubcfi\(.*\[).*(?=\]!)/)
   // let chapterId = match ? match[0] : null
   // return chapterId
   // 'epubcfi(/6/14[chap05ref]!/4[body01]/10/2/1:3)'
   let start = -1
   let values = []
   while (++start < epubCfi.length) {
      start = epubCfi.indexOf('[', start)
      let end = epubCfi.indexOf(']', start)
      if (start >= 0 && end >= 0) {
         values.push(epubCfi.substring(start + 1, end))
      } else break
   }
   return values[0]
}

function getTocIdFromCfi (epubCfi) {
   // safari не поддерживает Lookbehind!!!
   // let match // = epubCfi.match(/(?<=epubcfi\(.*!.*\[).*(?=\])/)
   // let tocId = match ? match[0] : null
   // return tocId
   // 'epubcfi(/6/14[chap05ref]!/4[body01]/10/2/1:3)'
   let start = -1
   let values = []
   while (++start < epubCfi.length) {
      start = epubCfi.indexOf('[', start)
      let end = epubCfi.indexOf(']', start)
      if (start >= 0 && end >= 0) {
         values.push(epubCfi.substring(start + 1, end))
      } else break
   }
   return values[1]
}

function rxdbOperationProxy (collection, operation, ...params) {
   assert(collection && isRxCollection(collection) && operation, 'bad rxdbOperationProxy params1 : ' + JSON.stringify({isRxCollection: isRxCollection(collection), operation}))
   const f = rxdbOperationProxy
   logDT(f, collection.name, operation)
   const t1 = performance.now()
   switch (operation) {
      case 'remove':
         return collection.remove(...params)
      case 'destroy':
         return collection.destroy(...params)
      case 'findOne':
         return collection.findOne(...params)
      case 'find':
         return collection.find(...params)
      case 'atomicUpsert':
         return collection.atomicUpsert(...params)
      case 'findByIds':
         return collection.findByIds(...params)
      case 'bulkInsert':
         return collection.bulkInsert(...params)
      default:
         throw operation + ' not impl'
   }
}

async function rxdbOperationProxyExec (collection, operation, ...params) {
   assert(collection && isRxCollection(collection) && operation, 'bad rxdbOperationProxy params2 : ' + JSON.stringify({isRxCollection: isRxCollection(collection), operation}))
   const f = rxdbOperationProxyExec
   // logDT(f, collection.name, operation)
   const t1 = performance.now()
   try {
      switch (operation) {
         case 'remove':
            return await collection.remove(...params)
         case 'destroy':
            return await collection.destroy(...params)
         case 'findOne':
            return await collection.findOne(...params).exec()
         case 'find':
            return await collection.find(...params).exec()
         case 'atomicUpsert':
            return await collection.atomicUpsert(...params)
         case 'findByIds':
            return await collection.findByIds(...params)
         case 'bulkInsert':
            return await collection.bulkInsert(...params)
         default:
            throw operation + ' not impl'
      }
   } finally {
      logDT(f, `${collection.name} ${operation} ${params} complete: ${Math.floor(performance.now() - t1)} msec)`)
   }
}

export {
   RxModuleEnum,
   WsItemTypeEnum,
   WsCollectionEnum,
   LstCollectionEnum,
   RxCollectionEnum,
   checkMangoCond,
   rxdbOperationProxy,
   rxdbOperationProxyExec,
   getChapterIdFromCfi,
   getTocIdFromCfi
}
