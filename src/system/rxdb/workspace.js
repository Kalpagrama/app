import { addRxPlugin, createRxDatabase, removeRxDatabase } from 'rxdb'

import assert from 'assert'
import { wsSchemaChain, wsSchemaContent, wsSchemaMeta, wsSchemaNode, wsSchemaSphere } from 'src/system/rxdb/schemas'
import { apollo } from 'src/boot/apollo'
import {RxCollectionEnum} from 'src/boot/rxdb'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.RXDB)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.RXDB)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.RXDB)

const WsItemTypeEnum = Object.freeze({
  NODE: 'NODE',
  CONTENT_WITH_NOTES: 'CONTENT_WITH_NOTES',
  CHAIN: 'CHAIN',
  SPHERE: 'SPHERE'
})
const WsCollectionEnum = Object.freeze({
  NODE_LIST: 'NODE_LIST',
  CONTENT_LIST: 'CONTENT_LIST',
  CHAIN_LIST: 'CHAIN_LIST',
  SPHERE_LIST: 'SPHERE_LIST'
})
const WsOperationEnum = Object.freeze({ UPSERT: 'UPSERT', DELETE: 'DELETE' })

function getItemWsCollection (item) {
  switch (item.wsItemType) {
    case WsItemTypeEnum.NODE:
      return WsCollectionEnum.NODE_LIST
    case WsItemTypeEnum.CONTENT_WITH_NOTES:
      return WsCollectionEnum.CONTENT_LIST
    case WsItemTypeEnum.SPHERE:
      return WsCollectionEnum.SPHERE_LIST
    case WsItemTypeEnum.CHAIN:
      return WsCollectionEnum.CHAIN_LIST
    default:
      assert(false, 'bad wsItemType:' + item.wsItemType)
  }
}
function getRxCollectionEnum(wsCollectionEnum){
  switch (wsCollectionEnum) {
    case WsCollectionEnum.NODE_LIST: return RxCollectionEnum.WS_NODE
    case WsCollectionEnum.CONTENT_LIST: return RxCollectionEnum.WS_CONTENT
    case WsCollectionEnum.CHAIN_LIST: return RxCollectionEnum.WS_CHAIN
    case WsCollectionEnum.SPHERE_LIST: return RxCollectionEnum.WS_SPHERE
    default: throw new Error('bad wsCollectionEnum:' + wsCollectionEnum)
  }
}

class Workspace {
  constructor (rxdb) {
    assert(rxdb, '!rxdb')
    this.rxdb = rxdb
    this.processEventInProgress = false
  }

  async init () {
    logD('RXDB::WS::init')
    this.rxdb.waitForLeadership()
      .then(() => {
        logD('RXDB::LEADER!!!!', this.rxdb.isLeader())
        this.isLeader = true
      })
    await this.rxdb.collection({ name: 'node', schema: wsSchemaNode })
    await this.rxdb.collection({ name: 'content', schema: wsSchemaContent })
    await this.rxdb.collection({ name: 'chain', schema: wsSchemaChain })
    await this.rxdb.collection({ name: 'sphere', schema: wsSchemaSphere })
    await this.rxdb.collection({ name: 'meta', schema: wsSchemaMeta })
    let normalizeWsItem = (item) => {
      // assert(item.revision, '!revision')
      assert(item.wsItemType in WsItemTypeEnum, 'bad wsItemType:' + item.wsItemType)
      item.revisionServer = item.revisionServer || item.revision // revision - зарезервировано в rxdb
      delete item.revision
      if (!item.id) item.id = `${Date.now()}` // генерируем id для нового элемента
      item.revisionServer = item.revisionServer || 1
      item.revisionClient = item.revisionClient || 1
      // logD('normalizeWsItem::' + JSON.stringify(item))
    }
    this.rxdb.node.preInsert(normalizeWsItem, false)
    this.rxdb.node.preSave(normalizeWsItem, false)
    this.rxdb.content.preInsert(normalizeWsItem, false)
    this.rxdb.content.preSave(normalizeWsItem, false)
    this.rxdb.$.subscribe(async changeEvent => {
      let { operation, documentId, documentData } = changeEvent
      logD('rxDB::changeEvent = ', changeEvent)
      assert(['INSERT', 'UPDATE', 'REMOVE'].includes(operation), 'bad operation' + operation)
      let wsOperationEnum = operation === 'REMOVE' ? WsOperationEnum.DELETE : WsOperationEnum.UPSERT
      // await this.saveToServer(wsOperationEnum, JSON.parse(JSON.stringify(documentData)))// изменение documentData приводит к изменению документа!!!
    })
    for (let wsCollection in WsCollectionEnum) await this.refreshWsCollection(wsCollection)
  }

  getRxCollection (rxCollectionEnum) {
    assert(rxCollectionEnum in RxCollectionEnum, 'bad rxCollection' + rxCollectionEnum)
    switch (rxCollectionEnum) {
      case RxCollectionEnum.WS_NODE:
        return this.rxdb.node
      case RxCollectionEnum.WS_CONTENT:
        return this.rxdb.content
      case RxCollectionEnum.WS_CHAIN:
        return this.rxdb.chain
      case RxCollectionEnum.WS_SPHERE:
        return this.rxdb.sphere
      default:
        throw new Error('bad collection' + rxCollectionEnum)
    }
  }

  // обновит при необходимости данные (запросит с сервера)
  async refreshWsCollection (wsCollectionEnum) {
    // alert(wsCollectionEnum)
    let actual = false
    // todo use Local Documents https://rxdb.info/rx-local-document.html#
    let rxCollectionEnum = getRxCollectionEnum(wsCollectionEnum)
    let collectionMetaInfo = await this.rxdb.meta.findOne().where('rxCollection').eq(rxCollectionEnum).exec()
    if (collectionMetaInfo) {
      let lastFetchDate = collectionMetaInfo.fetchedAt
      // проверить - не устарела ли....
      let diffMsec = Date.now() - lastFetchDate
      if (diffMsec > 0 && diffMsec < 1000 * 60 * 60 * 24) actual = true
    }
    if (!actual) {
      logD('refreshWsCollection', wsCollectionEnum)
      let { data: { wsItems: { items, count, totalCount, nextPageToken } } } = await apollo.clients.api.query({
        query: gql`
          query wsItems ( $collection: WsCollectionEnum!){
            wsItems (collection: $collection) {
              totalCount
              count
              nextPageToken
              items
            }
          }
        `,
        variables: { collection: wsCollectionEnum }
      })
      let rxCollection = this.getRxCollection(rxCollectionEnum)
      const result = await rxCollection.bulkInsert(items)
      await this.rxdb.meta.atomicUpsert({
        rxCollection: rxCollectionEnum,
        fetchedAt: Date.now()
      })
    }
  }

  async clear () {
    logD('workspace::clear')
    await removeRxDatabase('ws', 'idb')
  }

  // от сервера прилетел эвент об изменении в мастерской (скорей всего - ответ на наши действия)
  async processEvent (event) {
    logD('Получили WsEvent')
    if (!this.isLeader) return
    let { type, wsItem: itemServer, wsRevision } = event
    assert(itemServer.oid && itemServer.name != null && itemServer.id, 'assert itemServer !check')
    assert(type === 'WS_ITEM_CREATED' || type === 'WS_ITEM_DELETED' || type === 'WS_ITEM_UPDATED', 'bad ev type')
    assert(itemServer.revision, '!itemServer.revision')
    assert(itemServer.revisionClient, '!itemServer.revisionClient')

    logD('меняем item в rxdb. item=', itemServer)
    let rxCollectionEnum = getRxCollectionEnum(getItemWsCollection(itemServer))
    try {
      this.processEventInProgress = true // не реагировать на эти изменения в saveToServer
      if (type !== 'WS_ITEM_DELETED') {
        const doc = await this.getRxCollection(rxCollectionEnum).atomicUpsert(itemServer)
        logD('изменили. doc=', doc)
        // await doc.save()
      } else {
        await this.getRxCollection(rxCollectionEnum).find().where('id').eq(itemServer.id).remove()
      }
    } finally {
      this.processEventInProgress = false
    }
  }

  // отправить изменения на сервер
  async saveToServer (wsOperationEnum, item) {
    logD(`saveToServer processEventInProgress:${this.processEventInProgress} isLeader: ${this.isLeader}`)
    if (this.processEventInProgress) return
    if (!this.isLeader) return
    assert(item && item.id, '!item')
    assert(wsOperationEnum in WsOperationEnum, 'bad operation' + wsOperationEnum)
    item.revision = item.revisionServer
    delete item.revisionServer
    delete item.changesFromClient // см setReactiveItem (флаг того, что изменения от клиента)
    item.revisionClient++
    logD('отправим изменения на сервер', item)
    let { data: { wsItemUpsert, wsItemDelete } } = await apollo.clients.api.mutate({
      mutation: wsOperationEnum === WsOperationEnum.UPSERT
        ? gql`mutation wsItemUpsert($item: RawJSON!) {
                wsItemUpsert (item: $item)
              }`
        : gql`
                mutation wsItemDelete($item: RawJSON!) {
                  wsItemDelete (item: $item)
                }`,
      variables: { item }
    })
    logD('изменения отправлены', item)
  }
}

export { Workspace, WsItemTypeEnum}
