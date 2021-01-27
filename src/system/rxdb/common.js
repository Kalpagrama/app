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
   WS_COLLECTION: 'WS_COLLECTION'
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
   LST_SEARCH: 'LST_SEARCH'
})

const RxCollectionEnum = Object.freeze({
   ...WsCollectionEnum, // списки мастерской
   ...LstCollectionEnum, // списки из objectShort
   OBJ: 'OBJ', // список закэшированных объектов
   GQL_QUERY: 'GQL_QUERY', // произвольный(из конечного списка) запрос к серверу
   LOCAL: 'LOCAL', // иное (любые данные, хранимые тоько на клиенте) (удаялется по мере заполнения кэша)
   META: 'META'
})

// return promise
function rxdbOperationProxy (collection, operation, ...params) {
   assert(collection && isRxCollection(collection) && operation, 'bad rxdbOperationProxy params')
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
   assert(collection && isRxCollection(collection) && operation, 'bad rxdbOperationProxy params')
   const f = rxdbOperationProxyExec
   // logDT(f, collection.name, operation)
   const t1 = performance.now()
   try {
      switch (operation) {
         case 'remove':
            return await collection.remove(...params)
         case 'destroy':
            return await collection.destroy(...params)
         case 'findOne': {
            let res = await collection.findOne(...params).exec()
            return res
         }
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
   rxdbOperationProxy,
   rxdbOperationProxyExec
}
