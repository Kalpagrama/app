import { apollo } from 'src/boot/apollo'
import { fragments } from 'src/schema/index'
import assert from 'assert'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.VUEX_WS)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.VUEX_WS)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.VUEX_WS)

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// делает ключ для элемента мастерской в кэше (чтобы отличать от реальных элементов)
export function makeKey (wsItem) {
  assert(wsItem && wsItem.oid, `makeKey assert ${JSON.stringify(wsItem)}`)
  return 'wsItem: ' + wsItem.oid
}

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
    { key: 'listWS: ' + collection, fetchItemFunc }, { root: true })
  logD('wsItems complete')
  return wsFeedResult
}

// работа с мастерской идет через эвенты. Мутация на сервере вызывает эвент, котрый отлавливается в модуле events
export const wsItemCreate = async (context, item) => {
  logD('wsItemCreate start', item)
  let { data: { wsItemCreate: wsItem } } = await apollo.clients.api.mutate({
    mutation: gql`
      ${fragments.objectFullFragment}
      mutation wsItemCreate ($item: WSItemInput!) {
        wsItemCreate (item: $item) {
          ...objectFullFragment
        }
      }
    `,
    variables: { item }
  })
  context.dispatch('cache/update', { key: wsItem.oid, newValue: wsItem, actualAge: 'hour' }, { root: true })
  logD('wsItemCreate done', wsItem)
  return wsItem
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
    rawData: item.rawData
  }
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
  context.dispatch('cache/update', { key: wsItem.oid, newValue: wsItem, actualAge: 'hour' }, { root: true })
  logD('wsItemUpdate done', wsItem)
  return wsItem
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
