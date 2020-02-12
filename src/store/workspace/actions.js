import { apollo } from 'src/boot/apollo'
import { fragments } from 'src/schema/index'
import assert from 'assert'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.VUEX_WS)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.VUEX_WS)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.VUEX_WS)

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// делает ключ для элемента мастерской в кэше (чтобы отличать от реальных элементов)
function makeKey (wsItem) {
  assert(wsItem && (wsItem.oid || wsItem.name))
  return 'wsItem:' + (wsItem.oid || wsItem.name)
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
      mutation sw_network_only_wsClear {
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
      mutation sw_network_only_wsItemAdd ($oid: OID!, $wsRevision: Int!) {
        wsItemAdd (oid: $oid, wsRevision: $wsRevision) {
          ...objectFullFragment
        }
      }
    `,
    variables: {
      oid, wsRevision: context.rootState.workspace.revision
    }
  })
  context.dispatch('cache/update', { key: makeKey(wsItem), newValue: wsItem, actualAge: 'zero' }, { root: true }) // кладем в кэш на всяк случай
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
    nodeInput.compositions = []
    node.compositions.map(c => {
      if (c !== null) {
        nodeInput.compositions.push({
          spheres: [],
          operation: {
            operations: c.operation.operations,
            items: c.operation.items,
            type: c.operation.type
          },
          layers: c.layers.map(l => {
            return {
              contentOid: l.content.oid,
              spheres: [],
              figuresAbsolute: l.figuresAbsolute.map(f => {
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
        })
      }
    })
    return nodeInput
  }

  let wsItem
  if (node.oid) { // обновить
    let updateItemFunc = async (updatedItem) => {
      // logD('updatedItem', updatedItem)
      assert(updatedItem.revision)
      let nodeInput = makeNodeInput(updatedItem)
      let xxx = await apollo.clients.api.mutate({
        mutation: gql`
          ${fragments.objectFullFragment}
          mutation sw_network_only_wsNodeUpdate ($oid: OID!, $node: NodeInput!, $wsRevision: Int!) {
            wsNodeUpdate (oid: $oid, node: $node, wsRevision: $wsRevision) {
              ...objectFullFragment
            }
          }
        `,
        variables: {
          oid: node.oid, node: nodeInput, wsRevision: context.rootState.workspace.revision
        }
      })
      logD('xxx=', xxx)
      let { data: { wsNodeUpdate } } = xxx
      return {item: wsNodeUpdate, actualAge: 'hour'}
    }
    let fetchItemFunc = async () => {
      let item = await context.dispatch('workspace/get', { oid: node.oid, force: true }, { root: true })
      return {item, actualAge: 'hour'}
    }
    let mergeItemFunc = (path, serverItem, cacheItem) => {
      assert(serverItem && cacheItem)
      let mergedItem
      if (path) {
        // todo merge or throw error
      } else {
        // todo merge or throw error
      }
      // TODO merge!
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
        mutation sw_network_only_wsNodeCreate ($node: NodeInput!, $wsRevision: Int!) {
          wsNodeCreate (node: $node, wsRevision: $wsRevision) {
            ...objectFullFragment
          }
        }
      `,
      variables: {
        node: nodeInput, wsRevision: context.rootState.workspace.revision
      }
    })
    wsItem = wsNodeCreate
    context.dispatch('cache/update', { key: makeKey(wsItem), newValue: wsItem, actualAge: 'zero' }, { root: true }) // кладем в кэш на всяк случай
  }
  logD('wsNodeSave done', wsItem)
  return wsItem
}
export const wsItemDelete = async (context, oid) => {
  logD('wsItemDelete start', oid)
  assert.ok(oid)
  let { data: { wsItemDelete } } = await apollo.clients.api.mutate({
    mutation: gql`
      mutation sw_network_only_wsItemDelete ($oid: OID!, $wsRevision: Int!) {
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
      filter.nameRegExp = '^SPHERES-.{11}$'
      break
    case 'NODES':
      filter.nameRegExp = '^(?!^CONTENT-.{11}=$|^COMPOSITION-.{11}=$|^NOTE-.{11}=$|^SPHERES-.{11}$)'
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
      items[i] = { oid: item.oid, name: 'item.name' } // в самом списке - просто ссылка
    }
    return {
      item: { items, count, totalCount, nextPageToken },
      actualAge: 'hour'
    }
  }
  // { items, count, totalCount, nextPageToken }
  let listResult = await context.dispatch('cache/get',
    { key: 'wsItems: ' + JSON.stringify({ pagination, filter, sortStrategy }), fetchItemFunc, force }, { root: true })
  logD('wsItems complete short', listResult)
  return listResult
}

// подходит ли object под этот фильтр
function isRestricted (filter, object) {
  assert(object.oid && object.type && object.name)
  let result = true
  if (filter.types) result = result && filter.types.includes(object.type)
  if (filter.oids) result = result && filter.oids.includes(object.oid)
  if (filter.name) result = result && filter.name === object.name
  if (filter.nameRegExp) result = result && (object.name.search(new RegExp(filter.nameRegExp)) >= 0)
  return result
}

// пометить элементы мастерской как outOfDate (запросятся при первой возможности)
export const expireWsCache = async (context) => {
  logD('expireWsCache start')
  for (let key in context.rootState.cache.cachedItems) {
    let keyPattern = 'wsItems: '
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
// обновим кэш мастерской (прилетел эвент)
export const updateWsCache = async (context, { type, object }) => {
  logD('updateWsCache start')
  assert(object.oid && object.name != null)
  // обновим в кэше значение итема
  await context.dispatch('cache/update', {
    key: makeKey(object),
    newValue: object
  }, { root: true })
  if (type === 'WS_ITEM_CREATED' || type === 'WS_ITEM_DELETED') {
    for (let key in context.rootState.cache.cachedItems) {
      let keyPattern = 'wsItems: '
      if (key.startsWith(keyPattern)) {
        let { pagination, filter, sortStrategy } = JSON.parse(key.slice(keyPattern.length))
        assert(pagination)
        if (type === 'WS_ITEM_CREATED') {
          // добавляем object в начальные запросы (если фильтр запроса позволяет)
          if (!pagination.pageToken) { // pageToken === null при начальном запросе.
            if (!isRestricted(filter, object)) continue // элемент не подходит под этот фильр
            await context.dispatch('cache/update', {
              key: key,
              path: '',
              actualAge: 'zero', // обновить при следующем запросе
              setter: (value) => {
                // { items, count, totalCount, nextPageToken }
                logD('setter: ', value)
                assert(value.items && value.count >= 0 && value.totalCount >= 0)
                // элемент в самом списке - objectShort
                // вставляем в начало используем splice для реактивности
                value.items.splice(0, 0, { oid: object.oid, name: object.name })
                value.count++
                value.totalCount++
                return value
              }
            }, { root: true })
          }
        } else if (type === 'WS_ITEM_DELETED') {
          // удаляем object из всех лент
          await context.dispatch('cache/update', {
            key: key,
            path: '',
            actualAge: 'zero', // обновить при следующем запросе
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
        }
      }
    }
  }
  logD('updateWsCache complete')
}

// можно запрашивать по oid, либо имени (если оно уникально)
export const get = async (context, { oid, name, force }) => {
  // logD('workspace/get start', { oid, name, force })
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
  let item = await context.dispatch('cache/get',
    { key: makeKey({ oid, name }), fetchItemFunc, force }, { root: true })
  // logD('ws get Item complete', item)
  return item
  // let fullItem = context.rootState.cache.cachedItems[makeKey({oid})]
  // if (fullItem) return fullItem
  //
  // let { items, count, totalCount, nextPageToken } = await context.dispatch('workspace/wsItems', {
  //   wsItemsType: 'ALL',
  //   filter: oid ? { oids: [oid] } : { name },
  //   force
  // }, { root: true })
  // assert(count === 0 || count === 1)
  // return items[0]
}
