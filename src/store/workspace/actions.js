import { apollo } from 'src/boot/apollo'
import { fragments } from 'src/schema/index'
import assert from 'assert'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.VUEX_WS)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.VUEX_WS)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.VUEX_WS)

const listKeyPattern = 'listWS: '
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const init = async (context, wsRevision) => {
  assert(wsRevision)
  // if (context.state.initialized) throw new Error('events state initialized already')
  if (context.state.initialized) return
  logD('userWorkspace init')
  context.commit('init', wsRevision)
  return true
}
export const wsClear = async (context) => {
  logD('wsClear start')
  let { data: { wsClear } } = await apollo.clients.api.mutate({
    mutation: gql`
      mutation wsClear {
        wsClear
      }
    `
  })
  logD('wsClear done', wsClear)
  return wsClear
}

export const wsItems = async (context, collection) => {
  logD('wsItems start')
  const fetchItemFunc = async () => {
    let { data: { wsItems: { items, count, totalCount, nextPageToken } } } = await apollo.clients.api.query({
      query: gql`
        ${fragments.wsObjectShortFragment}
        query wsItems ( $collection: WsCollectionEnum!){
          wsItems (collection: $collection) {
            totalCount
            count
            nextPageToken
            items {...wsObjectShortFragment}
          }
        }
      `,
      variables: { collection }
    })
    return {
      item: { items, count, totalCount, nextPageToken },
      actualAge: 'hour'
    }
  }
  // { items, count, totalCount, nextPageToken }
  let wsFeedResult = await context.dispatch('cache/get',
    { key: listKeyPattern + collection, fetchItemFunc }, { root: true })
  logD('wsItems complete')
  return wsFeedResult
}

// работа с мастерской идет через эвенты. Мутация на сервере вызывает эвент, котрый отлавливается в модуле events
export const wsItemCreate = async (context, item) => {
  logD('wsItemCreate start', item)
  let itemInput = {
    oid: item.oid,
    unique: item.unique,
    thumbOid: item.thumbOid,
    name: item.name,
    wsItemType: item.wsItemType,
    revision: item.revision,
    rawData: JSON.parse(JSON.stringify(item))
  }
  delete itemInput.rawData.oid
  delete itemInput.rawData.unique
  delete itemInput.rawData.thumbOid
  delete itemInput.rawData.name
  delete itemInput.rawData.wsItemType
  delete itemInput.rawData.revision
  let { data: { wsItemCreate: wsItem } } = await apollo.clients.api.mutate({
    mutation: gql`
      ${fragments.objectFullFragment}
      mutation wsItemCreate ($item: WSItemInput!) {
        wsItemCreate (item: $item) {
          ...objectFullFragment
        }
      }
    `,
    variables: { item: itemInput }
  })
  let updatedItem = await context.dispatch('cache/update', { key: wsItem.oid, newValue: wsItem, actualAge: 'hour' }, { root: true })
  logD('wsItemCreate done', updatedItem)
  return updatedItem
}
// работа с мастерской идет через эвенты. Мутация на сервере вызывает эвент, котрый отлавливается в модуле events
export const wsItemUpdate = async (context, item) => {
  logD('wsItemUpdate start', item)
  let itemInput = {
    oid: item.oid,
    unique: item.unique,
    thumbOid: item.thumbOid,
    name: item.name,
    wsItemType: item.wsItemType,
    revision: item.revision,
    rawData: JSON.parse(JSON.stringify(item))
  }
  delete itemInput.rawData.oid
  delete itemInput.rawData.unique
  delete itemInput.rawData.thumbOid
  delete itemInput.rawData.name
  delete itemInput.rawData.wsItemType
  delete itemInput.rawData.revision
  let { data: { wsItemUpdate: wsItem } } = await apollo.clients.api.mutate({
    mutation: gql`
      ${fragments.objectFullFragment}
      mutation wsItemUpdate ($item: WSItemInput!) {
        wsItemUpdate (item: $item) {
          ...objectFullFragment
        }
      }
    `,
    variables: { item: itemInput }
  })
  let updatedItem = context.dispatch('cache/update', { key: wsItem.oid, newValue: wsItem, actualAge: 'hour' }, { root: true })
  logD('wsItemUpdate done', updatedItem)
  return updatedItem
}
// работа с мастерской идет через эвенты. Мутация на сервере вызывает эвент, котрый отлавливается в модуле events
export const wsItemDelete = async (context, oid) => {
  logD('wsItemDelete start')
  let { data: { wsItemDelete: result } } = await apollo.clients.api.mutate({
    mutation: gql`
      ${fragments.objectFullFragment}
      mutation wsItemDelete ($oid: OID!) {
        wsItemDelete (oid: $oid)
      }
    `,
    variables: { oid }
  })
  // todo выкинуть из кэша
  logD('wsItemDelete done')
  return result
}

// пометить элементы мастерской как outOfDate (запросятся при первой возможности)
export const expireWsCache = async (context) => {
  logD('expireWsCache start')
  for (let key in context.rootState.cache.cachedItems) {
    let keyPattern = 'listWS:'
    if (key.startsWith(keyPattern)) {
      context.dispatch('cache/expire', { key: key }, { root: true })
      let { items, count, totalCount, nextPageToken } = context.rootState.cache.cachedItems[key]
      assert(items && Array.isArray(items))
      for (let item of items) {
        assert(item.oid)
        context.dispatch('cache/expire', { key: item.oid }, { root: true })
      }
    }
  }
  logD('expireWsCache complete')
}

export const updateRevision = async (context, revision) => {
  // logD('updateRevision start')
  context.commit('workspace/stateSet', ['revision', revision], { root: true })
  await context.dispatch('cache/update', {
    key: context.rootState.auth.userOid,
    path: 'wsRevision',
    newValue: revision
  }, { root: true })
  // logD('updateVersion complete')
}

function getCollection (wsItemType) {
  return wsItemType + '_LIST'
}

function makeWsObjectShort (wsItem) {
  assert(wsItem.oid && wsItem.type && wsItem.wsItemType, '!(wsItem.oid && wsItem.type, wsItem.wsItemType)')
  return {
    oid: wsItem.oid,
    type: wsItem.type,
    name: wsItem.name,
    wsItemType: wsItem.wsItemType,
    unique: wsItem.unique,
    thumbUrl: wsItem.thumbUrl
  }
}

// обновим кэш мастерской (прилетел эвент WS_ITEM_CREATED/WS_ITEM_DELETED/WS_ITEM_UPDATED)
export const updateWsLists = async (context, event) => {
  logD('updateWsItems start')
  let { type, object } = event
  assert(object.oid && object.name != null)
  assert(type === 'WS_ITEM_CREATED' || type === 'WS_ITEM_DELETED' || type === 'WS_ITEM_UPDATED', 'bad ev type')
  for (let key in context.rootState.cache.cachedItems) {
    if (!key.startsWith(listKeyPattern)) continue
    let collection = key.slice(listKeyPattern.length)
    logD('updateWsItems collection', collection)
    assert(object.wsItemType, '!object.wsItemType')
    if (getCollection(object.wsItemType) !== collection) continue
    logD('updateWsItems after CONTINUE', key)
    if (type === 'WS_ITEM_CREATED') {
      await context.dispatch('cache/update', {
        key: key,
        path: '',
        setter: (value) => {
          // { items, count, totalCount, nextPageToken }
          // logD('setter: ', value)
          assert(value.items && value.count >= 0 && value.totalCount >= 0)
          let indx = value.items.findIndex(item => item.oid === object.oid)
          if (indx === -1) {
            // элемент в самом списке - objectShort
            // вставляем в начало используем splice для реактивности
            value.items.splice(0, 0, makeWsObjectShort(object))
            value.count++
            value.totalCount++
          }
          return value
        }
      }, { root: true })
    } else if (type === 'WS_ITEM_DELETED') {
      await context.dispatch('cache/update', {
        key: key,
        path: '',
        setter: (value) => {
          // { items, count, totalCount, nextPageToken }
          assert(value.items && value.count >= 0 && value.totalCount >= 0)
          let indx = value.items.findIndex(item => item.oid === object.oid)
          if (indx >= 0) {
            // splice для реактивности
            value.items.splice(indx, 1)
            value.count--
            value.totalCount--
          }
          return value
        }
      }, { root: true })
    } else if (type === 'WS_ITEM_UPDATED') {
      await context.dispatch('cache/update', {
        key: key,
        path: '',
        setter: (value) => {
          // { items, count, totalCount, nextPageToken }
          // logD('setter: ', value)
          assert(value.items && value.count >= 0 && value.totalCount >= 0)
          let indx = value.items.findIndex(item => item.oid === object.oid)
          if (indx >= 0) {
            // элемент в самом списке - objectShort. удаляем элемент и на его место вставляем новый используем splice для реактивности
            value.items.splice(indx, 1, makeWsObjectShort(object))
            value.count++
            value.totalCount++
          }
          return value
        }
      }, { root: true })
    }
  }
  logD('updateWsItems complete')
}
