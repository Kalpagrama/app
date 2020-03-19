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

// работа с мастерской идет через эвенты. Мутация на сервере вызывает эвент, котрый отлавливается в модуле events
export const wsItemAdd = async (context, oid) => {
  logD('wsItemAdd start', oid)
  let { data: { wsItemAdd: wsItem } } = await apollo.clients.api.mutate({
    mutation: gql`
      ${fragments.objectFullFragment}
      mutation wsItemAdd ($oid: OID!, $wsRevision: Int!) {
        wsItemAdd (oid: $oid, wsRevision: $wsRevision) {
          ...objectFullFragment
        }
      }
    `,
    variables: {
      oid, wsRevision: context.rootState.workspace.revision
    }
  })
  context.dispatch('cache/update', { key: makeKey(wsItem), newValue: wsItem, actualAge: 'hour' }, { root: true })
  logD('wsItemAdd done', wsItem)
  return wsItem
}
export const wsNodeSave = async (context, node) => {
  logD('wsNodeSave start', node)

  // checks
  {
    assert.ok(node.spheres.length >= 0)
    assert.ok(node.compositions.length >= 0)
    assert.ok(['PIP', 'SLIDER', 'VERTICAL', 'HORIZONTAL'].includes(node.layout))
  }

  const makeNodeInput = (node) => {
    let nodeInput = {}
    nodeInput.revision = node.revision || 1
    nodeInput.layout = node.layout
    nodeInput.name = node.name
    nodeInput.category = node.category || 'FUN'
    nodeInput.spheres = node.spheres.map(s => {
      return { name: s.name }
    })
    nodeInput.compositions = node.compositions.map(c => {
      if (c) {
        return {
          spheres: [],
          operation: {
            operations: c.operation.operations,
            items: c.operation.items,
            type: c.operation.type
          },
          layers: c.layers.map(l => {
            return {
              contentOid: l.content.oid,
              spheres: l.spheres.map(s => {
                return {
                  name: s.name
                }
              }),
              figuresAbsolute: l.figuresAbsolute.map(f => {
                assert(f.t >= 0, 'f.t >= 0')
                return {
                  t: f.t,
                  points: f.points.map(p => {
                    return {
                      x: p.x,
                      y: p.y,
                      z: p.z
                    }
                  })
                }
              })
            }
          })
        }
      } else {
        return null
      }
    })
    logD('wsNodeSave start. nodeInput=', nodeInput)
    return nodeInput
  }

  let wsItem
  if (node.oid) { // обновить
    let updateItemFunc = async (updatedItem) => {
      // logD('updatedItem', updatedItem)
      assert(updatedItem.revision, '!updatedItem.revision')
      let nodeInput = makeNodeInput(updatedItem)
      let { data: { wsNodeUpdate } } = await apollo.clients.api.mutate({
        mutation: gql`
          ${fragments.objectFullFragment}
          mutation wsNodeUpdate ($oid: OID!, $node: NodeInput!, $wsRevision: Int!) {
            wsNodeUpdate (oid: $oid, node: $node, wsRevision: $wsRevision) {
              ...objectFullFragment
            }
          }
        `,
        variables: {
          oid: node.oid, node: nodeInput, wsRevision: context.rootState.workspace.revision
        }
      })
      logD('wsNodeUpdate = ', wsNodeUpdate)
      return { item: wsNodeUpdate, actualAge: 'hour' }
    }
    let fetchItemFunc = async () => {
      let item = await context.dispatch('workspace/get', { oid: node.oid, force: true }, { root: true })
      return { item, actualAge: 'hour' }
    }
    let mergeItemFunc = (path, serverItem, cacheItem) => {
      assert(serverItem && cacheItem)
      let mergedItem
      // берем значение с сервера
      mergedItem = serverItem
      // assert(mergedItem, 'надо вернуть либо смердженный объект, либо исключение')
      return mergedItem
    }
    wsItem = await context.dispatch('cache/update', {
      key: makeKey(node),
      newValue: node,
      updateItemFunc,
      fetchItemFunc,
      mergeItemFunc
    }, { root: true })
  } else { // создать
    let nodeInput = makeNodeInput(node)
    let { data: { wsNodeCreate } } = await apollo.clients.api.mutate({
      mutation: gql`
        ${fragments.objectFullFragment}
        mutation wsNodeCreate ($node: NodeInput!, $wsRevision: Int!) {
          wsNodeCreate (node: $node, wsRevision: $wsRevision) {
            ...objectFullFragment
          }
        }
      `,
      variables: {
        node: nodeInput, wsRevision: context.rootState.workspace.revision
      }
    })
    wsItem = await context.dispatch('cache/update', {
      key: makeKey(wsNodeCreate),
      newValue: wsNodeCreate,
      actualAge: 'hour'
    }, { root: true })
  }
  logD('wsNodeSave done', wsItem.revision)
  return wsItem
}
export const wsItemDelete = async (context, oid) => {
  logD('wsItemDelete start', oid)
  assert.ok(oid)
  let { data: { wsItemDelete } } = await apollo.clients.api.mutate({
    mutation: gql`
      mutation wsItemDelete ($oid: OID!, $wsRevision: Int!) {
        wsItemDelete (oid: $oid, wsRevision: $wsRevision)
      }
    `,
    variables: {
      oid, wsRevision: context.rootState.workspace.revision
    }
  })
  logD('wsItemDelete done', wsItemDelete)
  return wsItemDelete
}

// wsItemsType 'CONTENTS' 'SPHERES' 'NODES' 'COMPOSITIONS' 'NOTES' 'ALL'
// Все сущности в мастерской лежат в ядрах. Ядро - как контейнер
// При этом если мы хотим хранить контент. то мы создаем ядро с именем CONTENT-...........= (oid контента)и на этом ядре хранится контент и все лэеры этого контента
// это же справедливо и для композиций (COMPOSITION-...........=) (oid композиции)
// для сфер создается одно ядро со всеми сферами сразу с именем (SPHERES-...........=) (oid юзера)
export const wsItems = async (context, { wsItemsType, pagination, filter, force }) => {
  logD('wsItems start')
  pagination = pagination || { pageSize: 30, pageToken: null }
  filter = filter || {}
  let sortStrategy = 'HOT'
  filter.types = ['NODE']
  switch (wsItemsType) {
    case 'CONTENTS':
      filter.nameRegExp = '^CONTENT-.{11}=$'
      break
    case 'COMPOSITIONS':
      filter.nameRegExp = '^COMPOSITION-.{11}=$'
      break
    case 'NOTES':
      filter.nameRegExp = '^NOTE-.{11}=$'
      break
    case 'SPHERES':
      filter.nameRegExp = '^SPHERES-.{11}=$'
      break
    case 'NODES':
      filter.nameRegExp = '^(?!^CONTENT-.{11}=$|^COMPOSITION-.{11}=$|^NOTE-.{11}=$|^SPHERES-.{11}=$)'
      break
    case 'ALL':
      break
    default:
      throw new Error(`bad wsItemsType ${wsItemsType}`)
  }
  const fetchItemFunc = async () => {
    let { data: { wsItems: { items, count, totalCount, nextPageToken } } } = await apollo.clients.api.query({
      query: gql`
        ${fragments.objectFullFragment}
        query wsItems ( $pagination: PaginationInput!, $filter: Filter!, $sortStrategy: SortStrategyEnum){
          wsItems (pagination: $pagination, filter: $filter, sortStrategy: $sortStrategy) {
            totalCount
            count
            nextPageToken
            items {... objectFullFragment}
          }
        }
      `,
      variables: { pagination, filter, sortStrategy }
    })
    for (let i = 0; i < items.length; i++) {
      let item = items[i]
      // храним списки отдельно от элементов
      context.dispatch('cache/update', { key: makeKey(item), newValue: item, actualAge: 'hour' }, { root: true })
      items[i] = { oid: item.oid } // в самом списке - просто ссылка
    }
    return {
      item: { items, count, totalCount, nextPageToken },
      actualAge: 'hour'
    }
  }
  // { items, count, totalCount, nextPageToken }
  let wsFeedResult = await context.dispatch('cache/get',
    { key: 'listWS: ' + JSON.stringify({ pagination, filter, sortStrategy }), fetchItemFunc, force }, { root: true })
  logD('wsItems complete')
  return wsFeedResult
}

// пометить элементы мастерской как outOfDate (запросятся при первой возможности)
export const expireWsCache = async (context) => {
  logD('expireWsCache start')
  for (let key in context.rootState.cache.cachedItems) {
    let keyPattern = 'listWS: '
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

// можно запрашивать по oid, либо имени (если оно уникально)
export const get = async (context, { oid, name, force }) => {
  if (name) {
    // получаем список
    let { items, count, totalCount, nextPageToken } = await context.dispatch('workspace/wsItems',
      { wsItemsType: 'ALL', pagination: { pageSize: 1 }, filter: { name } },
      { root: true })
    // assert(items.length === 1, 'items.length === 1')
    if (items.length === 0) return null
    if (items.length === 0) return null
    let itemFull = await context.dispatch('workspace/get', { oid: items[0].oid }, { root: true }) // рекурсия
    return itemFull
  } else {
    const fetchItemFunc = async () => {
      let { data: { wsItems: { items, count, totalCount, nextPageToken } } } = await apollo.clients.api.query({
        query: gql`
          ${fragments.objectFullFragment}
          query wsItems_get ( $pagination: PaginationInput!, $filter: Filter!, $sortStrategy: SortStrategyEnum){
            wsItems (pagination: $pagination, filter: $filter, sortStrategy: $sortStrategy) {
              totalCount
              count
              nextPageToken
              items {... objectFullFragment}
            }
          }
        `,
        variables: {
          pagination: { pageSize: 2, pageToken: null },
          filter: oid ? { types: ['NODE'], oids: [oid] } : { types: ['NODE'], name },
          sortStrategy: 'HOT'
        }
      })
      assert(items.length === 0 || items.length === 1)
      logD('данные извлечены', items)
      return {
        item: items[0],
        actualAge: 'hour'
      }
    }
    let itemFull = await context.dispatch('cache/get',
      { key: makeKey({ oid }), fetchItemFunc, force }, { root: true })
    assert(itemFull, '!itemFull')
    assert(itemFull.revision, '!itemFull.revision')
    return itemFull
  }
}

// сохранить слои из созданного ядра в мастерской (если их там еще нет)
export const exportLayersFromNode = async (context, node) => {
  logD('try to save node layers in ws')
  assert(node && node.compositions, 'node && node.compositions')
  for (let composition of node.compositions) {
    if (!composition) continue
    assert(composition.layers, 'composition.layers')
    for (let layer of composition.layers) { // пробуем сохранить в мастерской каждый слой из созданного ядра
      assert(layer.spheres)
      assert(layer.figuresAbsolute)
      if (!layer.spheres.length) continue // сохраняем только слои с именем
      let contentContainer = await context.dispatch('workspace/get', { name: 'CONTENT-' + layer.contentOid }, { root: true })
      assert(contentContainer, '!contentContainer')
      assert(contentContainer.compositions && contentContainer.compositions.length === 1, 'contentContainer.compositions && contentContainer.compositions.length === 1')
      assert(contentContainer.compositions[0].layers, 'contentContainer.compositions.layers')
      let existing = contentContainer.compositions[0].layers.find(existingLayer => {
        logD('existingLayer=', existingLayer)
        assert(existingLayer.figuresAbsolute)
        if (JSON.stringify(existingLayer.figuresAbsolute) === JSON.stringify(layer.figuresAbsolute)) {
          return true
        } else {
          return false
        }
      })
      if (!existing) { // сохраняем только если такого еще нет
        logD('!exist')
        contentContainer = JSON.parse(JSON.stringify(contentContainer))
        contentContainer.compositions[0].layers.push(layer)
        if (contentContainer.compositions[0].layers[0].figuresAbsolute.length === 0) { // удаляем слой-болванку
          contentContainer.compositions[0].layers.splice(0, 1)
        }
        await context.dispatch('workspace/wsNodeSave', contentContainer, { root: true })
      }
    }
  }
  logD('save node layers in ws complete')
}
