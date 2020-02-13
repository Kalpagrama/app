import { apollo } from 'src/boot/apollo'
import assert from 'assert'
import { fragments } from 'src/schema/fragments'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
import { mdiGestureSwipeRight } from '@quasar/extras/mdi-v4'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.VUEX_WS)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.VUEX_WS)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.VUEX_WS)

export const init = async (context) => {
  if (context.state.initialized) return
  context.commit('init')
}

export const sphereSpheres = async (context, { oid, pagination, filter, sortStrategy }) => {
  logD('sphereSpheres start')
  assert.ok(oid)
  const fetchItemFunc = async () => {
    let { data: { sphereSpheres: { items, count, totalCount, nextPageToken } } } = await apollo.clients.api.query({
      query: gql`
        query sphereSpheres ($oid: OID!, $pagination: PaginationInput!, $filter: Filter, $sortStrategy: SortStrategyEnum){
          sphereSpheres (sphereOid: $oid, pagination: $pagination, filter: $filter, sortStrategy: $sortStrategy) {
            items {
              oid
              name
            }
          }
        }
      `,
      variables: { oid, pagination, filter, sortStrategy }
    })
    return {
      item: { items, count, totalCount, nextPageToken },
      actualAge: 'hour'
    }
  }
  // { items, count, totalCount, nextPageToken }
  let listResult = await context.dispatch('cache/get',
    {
      key: 'list: ' + JSON.stringify({ oid, pagination, filter, sortStrategy }),
      fetchItemFunc
    }, { root: true })
  logD('sphereSpheres complete')
  return listResult
}

export const events = async (context, { pagination }) => {
  logD('events start')
  assert.ok(pagination)
  const fetchItemFunc = async () => {
    let { data: { events: { items, count, totalCount, nextPageToken } } } = await apollo.clients.api.query({
      query: gql`
        ${fragments.eventFragment}
        query events ( $pagination: PaginationInput!){
          events (pagination: $pagination) {
            totalCount
            count
            nextPageToken
            items {...eventFragment}
          }
        }
      `,
      variables: { pagination }
    })
    return {
      item: { items, count, totalCount, nextPageToken },
      actualAge: 'hour'
    }
  }
  // { items, count, totalCount, nextPageToken }
  let eventFeedResult = await context.dispatch('cache/get',
    {
      key: 'feedEvent: ' + JSON.stringify({ pagination }),
      fetchItemFunc
    }, { root: true })
  logD('events complete')
  return eventFeedResult
}

export const sphereNodes = async (context, { oid, pagination, filter, sortStrategy }) => {
  logD('sphereNodes start')
  const fetchItemFunc = async () => {
    let { data: { sphereNodes: { items, count, totalCount, nextPageToken } } } = await apollo.clients.api.query({
      query: gql`
        ${fragments.objectShortWithMetaFragment}
        query sphereNodes ($oid: OID!, $pagination: PaginationInput!, $filter: Filter, $sortStrategy: SortStrategyEnum) {
          sphereNodes (sphereOid: $oid, pagination: $pagination, filter: $filter, sortStrategy: $sortStrategy) {
            count
            totalCount
            nextPageToken
            items {... objectShortWithMetaFragment}
          }
        }
      `,
      variables: { oid, pagination, filter, sortStrategy }
    })
    return {
      item: { items, count, totalCount, nextPageToken },
      actualAge: 'hour'
    }
  }
  // { items, count, totalCount, nextPageToken }
  let feedResult = await context.dispatch('cache/get',
    { key: 'list: ' + JSON.stringify({ oid, pagination, filter, sortStrategy }), fetchItemFunc }, { root: true })
  logD('sphereNodes complete')
  return feedResult
}

export const nodeNodes = async (context, { node, position, pagination, sortStrategy }) => {
  logD('nodeNodes start')
  assert(position >= 1 && position <= 5)
  assert(node.compositions && node.compositions.length === 2)
  assert(node.oid && node.sphereFromName && node.sphereFromName.oid)
  let filter = { types: ['NODE'] }
  let oid
  if (position === 1) { // список для верхней части кубика-рубика (первая композици)
    oid = node.sphereFromName.oid // запрашиваем ядра на суть (из них берем те, у которых совпадает суть и нижний контент)
    filter.name = node.name
    filter.compositionOids = [node.compositions[1].oid]
  } else if (position === 2) { // список для средней части кубика-рубика (суть)
    oid = node.compositions[0].oid // запрашиваем ядра первой композиции (можно и второй - это неважно)
    filter.compositionOids = [node.compositions[0].oid, node.compositions[1].oid]
  } else if (position === 3) { // список для нижней части кубика-рубика (вторая композиция)
    oid = node.sphereFromName.oid // запрашиваем ядра на суть (из них берем те, у которых совпадает суть и верхний контент)
    filter.name = node.name
    filter.compositionOids = [node.compositions[0].oid]
  } else if (position === 4) {
    oid = node.compositions[1].oid
    filter.compositionOids = [node.compositions[1].oid]
  } else if (position === 5) {
    oid = node.compositions[0].oid
    filter.compositionOids = [node.compositions[0].oid]
  }
  const fetchItemFunc = async () => {
    let { data: { sphereNodes: { items, count, totalCount, nextPageToken } } } = await apollo.clients.api.query({
      query: gql`
        ${fragments.objectShortWithMetaFragment}
        query nodeNodes ($oid: OID!, $pagination: PaginationInput!, $filter: Filter, $sortStrategy: SortStrategyEnum) {
          sphereNodes (sphereOid: $oid, pagination: $pagination, filter: $filter, sortStrategy: $sortStrategy) {
            count
            totalCount
            nextPageToken
            items {... objectShortWithMetaFragment}
          }
        }
      `,
      variables: { oid, pagination, filter, sortStrategy }
    })
    return {
      item: { items, count, totalCount, nextPageToken },
      actualAge: 'hour'
    }
  }
  // { items, count, totalCount, nextPageToken }
  let feedResult = await context.dispatch('cache/get',
    {
      key: 'list: ' + JSON.stringify({ oid: node.oid, pagination, filter, sortStrategy }),
      fetchItemFunc
    }, { root: true })
  logD('nodeNodes complete')
  return feedResult
}

export const feed = async (context, { pagination }) => {
  logD('feed start')
  assert.ok(pagination)
  const fetchItemFunc = async () => {
    let { data: { feed: { items, count, totalCount, nextPageToken } } } = await apollo.clients.api.query({
      query: gql`
        ${fragments.objectShortWithMetaFragment}
        query feed ($pagination: PaginationInput!) {
          feed (pagination: $pagination) {
            count
            totalCount
            nextPageToken
            items {... objectShortWithMetaFragment}
          }
        }
      `,
      variables: { pagination }
    })
    return {
      item: { items, count, totalCount, nextPageToken },
      actualAge: 'hour'
    }
  }
  // { items, count, totalCount, nextPageToken }
  let feedResult = await context.dispatch('cache/get',
    { key: 'feed: ' + JSON.stringify({ pagination }), fetchItemFunc }, { root: true })
  logD('feed complete')
  return feedResult
}

// wsItemsType 'CONTENTS' 'SPHERES' 'NODES' 'COMPOSITIONS' 'NOTES' 'ALL'
// Все сущности в мастерской лежат в ядрах. Ядро - как контейнер
// При этом если мы хотим хранить контент. то мы создаем ядро с именем CONTENT-...........= (oid контента)и на этом ядре хранится контент и все лэеры этого контента
// это же справедливо и для композиций (COMPOSITION-...........=) (oid композиции)
// для сфер создается одно ядро со всеми сферами сразу с именем (SPHERES-...........=) (oid юзера)
export const wsItems = async (context, { wsItemsType, pagination, filter }) => {
  return context.dispatch('workspace/wsItems', { wsItemsType, pagination, filter }, { root: true })
}

// подходит ли object под этот фильтр
function isRestricted (context, filter, objectShort) {
  assert(objectShort.oid && objectShort.type && objectShort.name)
  let result = true
  if (filter.types && !filter.types.includes(objectShort.type)) return false
  if (filter.oids && !filter.oids.includes(objectShort.oid)) return false
  if (filter.name && filter.name !== objectShort.name) return false
  if (filter.nameRegExp && objectShort.name.search(new RegExp(filter.nameRegExp)) === -1) return false
  if (filter.compositionOids) {
    let objectFull = context.rootState.cache.cachedItems[objectShort.oid]
    if (!objectFull || objectFull.compositions) return false
    for (let compositionOid of filter.compositionOids) {
      if (!objectFull.compositions.map(composition => composition.oid).includes(compositionOid)) return false
    }
  }
  return true
}

export const processEvent = async (context, event) => {
  switch (event.type) {
    case 'WS_ITEM_CREATED':
    case 'WS_ITEM_DELETED':
    case 'WS_ITEM_UPDATED':
      return await updateWsLists(context, event)
    case 'NODE_CREATED':
    case 'NODE_VOTED':
      return await updateLists(context, event)
    default:
      throw new Error(`bad event type ${event.type}`)
  }
}

// прелетел эвент - создано ядро. Добавить ядро во все ленты и на личную сферу
async function updateLists (context, event) {
  logD('addNode start')
  let objectShort = event.object
  assert(objectShort.oid && objectShort.name != null)
  for (let key in context.rootState.cache.cachedItems) {
    let keyPattern = 'list: '
    if (!key.startsWith(keyPattern)) continue
    let { oid, pagination, filter, sortStrategy } = JSON.parse(key.slice(keyPattern.length))
    assert(oid && filter, 'oid && filter')
    if (event.type === 'NODE_CREATED' || event.type === 'NODE_VOTED') {
      if (!filter || !filter.fastFilters) continue
      if (oid !== context.rootState.auth.userOid) continue
      let fastFilter = event.type === 'NODE_CREATED' ? 'CREATED_BY_USER' : 'VOTED_BY_USER'
      if (!filter.fastFilters.includes(fastFilter)) continue
    }
    if (!isRestricted(context, filter, objectShort)) continue // элемент не подходит под этот фильр

    logD('try add node to user sphere... ')
    await context.dispatch('cache/update', {
      key: key,
      path: '',
      setter: (value) => {
        // { items, count, totalCount, nextPageToken }
        logD('setter: ', value)
        assert(value.items && value.count >= 0 && value.totalCount >= 0)
        // элемент в самом списке - objectShort
        // удалить старый объект (возможно при переголосовании)
        let indx = value.items.findIndex(item => item.oid === objectShort.oid)
        if (indx >= 0) value.items.splice(indx, 1)

        // вставляем в начало используем splice для реактивности
        value.items.splice(0, 0, { oid: objectShort.oid, name: objectShort.name })
        value.count++
        value.totalCount++
        return value
      }
    }, { root: true })
  }
  logD('addNode complete')
}

// обновим кэш мастерской (прилетел эвент WS_XXXXXXXX)
async function updateWsLists (context, event) {
  logD('updateWsItems start')
  let { type, object } = event
  assert(object.oid && object.name != null)
  if (type === 'WS_ITEM_CREATED' || type === 'WS_ITEM_DELETED') {
    for (let key in context.rootState.cache.cachedItems) {
      let keyPattern = 'listWS: '
      if (key.startsWith(keyPattern)) {
        let { pagination, filter, sortStrategy } = JSON.parse(key.slice(keyPattern.length))
        assert(pagination)
        if (type === 'WS_ITEM_CREATED') {
          // добавляем object в начальные запросы (если фильтр запроса позволяет)
          if (!pagination.pageToken) { // pageToken === null при начальном запросе.
            if (!isRestricted(context, filter, object)) continue // элемент не подходит под этот фильр
            await context.dispatch('cache/update', {
              key: key,
              path: '',
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
  logD('updateWsItems complete')
}
