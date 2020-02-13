import assert from 'assert'

import { apollo } from 'src/boot/apollo'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
import { fragments } from 'src/schema'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.VUEX)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.VUEX)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.VUEX)

export const init = async (context) => {
  if (context.state.initialized) return
  // Запрашиваем юзера (после этого он будет в кэше лежать)
  let user = await context.dispatch('objects/get', { oid: context.rootState.auth.userOid, priority: 0 }, { root: true })
  assert(user)
  context.commit('init')
  return user
}

export const setFavouriteCategories = async (context, categoryTypes) => {
  logD('setFavouriteCategories start')
  let { data: { setFavouriteCategories } } = await apollo.clients.api.mutate({
    mutation: gql`
      mutation sw_network_only_setFavouriteCategories ($categories: [CategoryEnum!]!){
        setFavouriteCategories(categories: $categories)
      }
    `,
    variables: {
      categories: categoryTypes
    }
  })
  logD('setFavouriteCategories complete')
  return setFavouriteCategories
}
// Подписаться на сущность. Мутация будет вызвана по приходу эвента
export const subscribe = async (context, oid) => {
  logD('subscriptions', 'subscribe', oid)
  let { data: { subscribe } } = await apollo.clients.api.mutate({
    mutation: gql`
      ${fragments.objectShortFragment}
      mutation sw_network_only_subscribe ($oid: OID!) {
        subscribe (oid: $oid){
          ...objectShortFragment
        }
      }
    `,
    variables: {
      oid
    }
  })
  logD('subscriptions', 'subscribe OK', oid)
  return subscribe
}
// Отписаться от сущности. Мутация будет вызвана по приходу эвента
export const unSubscribe = async (context, oid) => {
  logD('subscriptions', 'unSubscribe', oid)
  let { data: { unSubscribe } } = await apollo.clients.api.mutate({
    mutation: gql`
      ${fragments.objectShortFragment}
      mutation sw_network_only_unSubscribe ($oid: OID!) {
        unSubscribe (oid: $oid){
          ...objectShortFragment
        }
      }
    `,
    variables: {
      oid
    }
  })
  logD('subscriptions', 'unSubscribe OK', oid)
  return unSubscribe
}

// прелетел эвент - создано ядро. Добавить ядро на личную сферу
export const addNode = async (context, event) => {
  logD('addNode start')
  let objectShort = event.object
  assert(objectShort.oid && objectShort.name != null)
  for (let key in context.rootState.cache.cachedItems) {
    let keyPattern = 'sphereNodes: '
    if (!key.startsWith(keyPattern)) continue
    let { oid, pagination, filter, sortStrategy } = JSON.parse(key.slice(keyPattern.length))
    assert(oid && filter, 'oid && filter')
    if (!filter || !filter.fastFilters) continue
    if (oid !== context.rootState.auth.userOid) continue
    let fastFilter = event.type === 'NODE_CREATED' ? 'CREATED_BY_USER' : 'VOTED_BY_USER'
    if (!filter.fastFilters.includes(fastFilter)) continue
    await context.dispatch('cache/update', {
      key: key,
      path: '',
      setter: (value) => {
        // { items, count, totalCount, nextPageToken }
        logD('setter: ', value)
        assert(value.items && value.count >= 0 && value.totalCount >= 0)
        // элемент в самом списке - objectShort
        // todo удалить старый объект (возможно при переголосовании)
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
