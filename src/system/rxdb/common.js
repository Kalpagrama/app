
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
   LST_SEARCH: 'LST_SEARCH' // подписки пользователя
})

const RxCollectionEnum = Object.freeze({
   ...WsCollectionEnum, // списки мастерской
   ...LstCollectionEnum, // списки из objectShort
   OBJ: 'OBJ', // список закэшированных объектов
   GQL_QUERY: 'GQL_QUERY', // произвольный(из конечного списка) запрос к серверу
   LOCAL: 'LOCAL', // иное (любые данные, хранимые тоько на клиенте) (удаялется по мере заполнения кэша)
   META: 'META'
})

export {
   RxModuleEnum,
   WsItemTypeEnum,
   WsCollectionEnum,
   LstCollectionEnum,
   RxCollectionEnum
}
