import { addRxPlugin, createRxDatabase, removeRxDatabase } from 'rxdb'

import assert from 'assert'
import {
  wsSchemaChain,
  wsSchemaContent,
  wsSchemaMeta,
  wsSchemaMetaCollections, wsSchemaMetaUnsaved,
  wsSchemaNode,
  wsSchemaSphere
} from 'src/system/rxdb/schemas'
import { apollo } from 'src/boot/apollo'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.RXDB)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.RXDB)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.RXDB)

const WsItemTypeEnum = Object.freeze({
  WS_NODE: 'WS_NODE',
  WS_CONTENT: 'WS_CONTENT',
  WS_CHAIN: 'WS_CHAIN',
  WS_SPHERE: 'WS_SPHERE'
})
const WsCollectionEnum = Object.freeze({ ...WsItemTypeEnum })
const WsOperationEnum = Object.freeze({ UPSERT: 'UPSERT', DELETE: 'DELETE' })

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
    await this.rxdb.collection({ name: 'meta_collections', schema: wsSchemaMetaCollections })
    await this.rxdb.collection({ name: 'meta_unsaved', schema: wsSchemaMetaUnsaved })
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
    this.rxdb.sphere.preInsert(normalizeWsItem, false)
    this.rxdb.sphere.preSave(normalizeWsItem, false)
    this.rxdb.$.subscribe(async changeEvent => {
      let { operation, documentId, documentData } = changeEvent
      logD('rxDB::changeEvent = ', changeEvent)
      assert(['INSERT', 'UPDATE', 'REMOVE'].includes(operation), 'bad operation' + operation)
      let wsOperationEnum = operation === 'REMOVE' ? WsOperationEnum.DELETE : WsOperationEnum.UPSERT
      // await this.saveToServer(wsOperationEnum, JSON.parse(JSON.stringify(documentData)))// изменение documentData приводит к изменению документа!!!
    })
    for (let wsCollection in WsCollectionEnum) await this.refreshWsCollection(wsCollection)
  }

  getRxCollection (wsCollectionEnum) {
    assert(wsCollectionEnum in WsCollectionEnum, 'bad wsCollection' + wsCollectionEnum)
    switch (wsCollectionEnum) {
      case WsCollectionEnum.WS_NODE:
        return this.rxdb.node
      case WsCollectionEnum.WS_CONTENT:
        return this.rxdb.content
      case WsCollectionEnum.WS_CHAIN:
        return this.rxdb.chain
      case WsCollectionEnum.WS_SPHERE:
        return this.rxdb.sphere
      default:
        throw new Error('bad collection' + wsCollectionEnum)
    }
  }

  // обновит при необходимости данные (запросит с сервера)
  async refreshWsCollection (wsCollectionEnum) {
    // alert(wsCollectionEnum)
    let actual = false
    // todo use Local Documents https://rxdb.info/rx-local-document.html#
    let collectionMeta = await this.rxdb.meta_collections.findOne(wsCollectionEnum).exec()
    if (collectionMeta) {
      // проверить - не устарела ли....
      let diffMsec = Date.now() - collectionMeta.fetchedAt
      if (diffMsec > 0 && diffMsec < 1000 * 60 * 60 * 24) actual = true
    }
    if (!actual) {
      logD('refreshWsCollection', wsCollectionEnum)
      let { data: { wsItems: { items, count, totalCount, nextPageToken } } } = await apollo.clients.api.query({
        query: gql`
          query wsItems ( $collection: WsItemTypeEnum!){
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
      let rxCollection = this.getRxCollection(wsCollectionEnum)
      const result = await rxCollection.bulkInsert(items)
      await this.rxdb.meta_collections.atomicUpsert({
        rxCollectionEnum: wsCollectionEnum,
        fetchedAt: Date.now()
      })
    }
  }

  async clear () {
    logD('workspace::clear')
    for (let wsCollection in WsCollectionEnum) {
      let collection = this.getRxCollection(wsCollection)
      // logD('clear ', wsCollection, collection)
      if (collection) await collection.remove()
    }
    if (this.rxdb.meta_collections) await this.rxdb.meta_collections.remove()
    if (this.rxdb.meta_unsaved) await this.rxdb.meta_unsaved.remove()
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
    assert(itemServer.wsItemType in WsItemTypeEnum)
    try {
      this.processEventInProgress = true // не реагировать на эти изменения в saveToServer
      if (type !== 'WS_ITEM_DELETED') {
        const doc = await this.getRxCollection(itemServer.wsItemType).atomicUpsert(itemServer)
        logD('изменили. doc=', doc)
        // await doc.save()
      } else {
        await this.getRxCollection(itemServer.wsItemType).find().where('id').eq(itemServer.id).remove()
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

export { Workspace, WsItemTypeEnum, WsCollectionEnum }
