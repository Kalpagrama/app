import { apollo } from 'src/boot/apollo'
import { fragments } from 'src/schema/index'
import { Notify } from 'quasar'
import { notify } from 'src/boot/notify'
import { router } from 'boot/main'
import assert from 'assert'
import { i18n } from 'boot/i18n'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.VUEX)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.VUEX)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.VUEX)

export const init = async (context) => {
  if (context.state.initialized) return
  logD('init events')
  const observerEvent = apollo.clients.ws.subscribe({
    client: 'wsApollo',
    query: gql`
      ${fragments.eventFragment}
      subscription event {
        event {...eventFragment}
      }
    `
  })

  observerEvent.subscribe({
    next: async ({ data: { event } }) => {
      logD(`EVENT received ${event.type}`, event)
      await processEvent(context, event)
    },
    error: (error) => {
      logE('EVENT error', error)
    }
  })

  context.commit('init')
  return true
}

export const testWebPush = async (context) => {
  logD('testWebPush...')
  let { data: { testWebPush } } = await apollo.clients.api.query({
    query: gql`
      query testWebPush {
        testWebPush
      }`
  })
  logD('testWebPush result = ', testWebPush)
  return testWebPush
}

async function processEvent (context, event) {
  logD('processEvent start', event)
  switch (event.type) {
    case 'ERROR':
      context.commit('stateSet', ['error', event])
      notifyError(event)
      break
    case 'PROGRESS':
      context.commit('stateSet', ['progress', event])
      if (event.action === 'UPLOAD') context.commit('stateSet', ['progressUpload', event])
      if (event.action === 'CREATE_NODE') context.commit('stateSet', ['progressCreateNode', event])
      break
    case 'NOTICE':
      context.commit('stateSet', ['notice', event])
      break
    case 'OBJECT_CHANGED':
      await context.dispatch('cache/update', {
        key: event.object.oid,
        path: event.path,
        newValue: event.value
      }, { root: true })
      context.commit('addEvent', { event, context })
      break
    case 'NODE_CREATED':
      if (event.subject.oid === context.rootState.auth.userOid) {
        notifyUserActionComplete(event.type, event.object)
      }
      context.commit('stateSet', ['nodeCreated', event])
      context.commit('addEvent', { event, context })
      break
    case 'NODE_RATED':
      if (event.subject.oid === context.rootState.auth.userOid) {
        notifyUserActionComplete(event.type, event.object)
      }
      context.commit('stateSet', ['nodeRated', event])
      await context.dispatch('cache/update', {
        key: event.object.oid,
        path: 'rate',
        newValue: event.rate
      }, { root: true })
      context.commit('addEvent', { event, context })
      break
    case 'NODE_DELETED':
      notifyUserActionComplete(event.type, event.object)
      context.commit('stateSet', ['nodeDeleted', event])
      context.commit('addEvent', { event, context })
      break
    case 'USER_SUBSCRIBED':
      notifyUserActionComplete(event.type, event.object)
      context.commit('stateSet', ['userSubscribed', event])
      if (event.subject.oid === context.rootState.auth.userOid) { // если это мы подписались
        await context.dispatch('cache/update', {
          key: event.subject.oid,
          path: 'subscriptions',
          setter: (oldValue) => {
            let subscriptions = oldValue
            let index = subscriptions.findIndex(s => s.oid === event.object.oid)
            assert.ok(index === -1)
            subscriptions.push(event.object)
            return subscriptions
          }
        }, { root: true })
        // на кого я подписан...
        await context.dispatch('cache/update', {
          key: event.object.oid,
          path: 'subscribers',
          setter: (oldValue) => {
            let subscribers = oldValue
            let index = subscribers.findIndex(s => s.oid === event.subject.oid)
            assert.ok(index === -1)
            subscribers.push(event.subject)
            return subscribers
          }
        }, { root: true })
      }
      context.commit('addEvent', { event, context })
      break
    case 'USER_UNSUBSCRIBED':
      notifyUserActionComplete(event.type, event.object)
      context.commit('stateSet', ['userUnSubscribed', event])
      if (event.subject.oid === context.rootState.auth.userOid) {
        await context.dispatch('cache/update', {
          key: event.subject.oid,
          path: 'subscriptions',
          setter: (oldValue) => {
            let subscriptions = oldValue
            let index = subscriptions.findIndex(s => s.oid === event.object.oid)
            assert.ok(index >= 0)
            subscriptions.splice(index, 1)
            return subscriptions
          }
        }, { root: true })
        // на кого я подписан...
        await context.dispatch('cache/update', {
          key: event.object.oid,
          path: 'subscribers',
          setter: (oldValue) => {
            let subscribers = oldValue
            let index = subscribers.findIndex(s => s.oid === event.subject.oid)
            assert.ok(index >= 0)
            subscribers.splice(index, 1)
            return subscribers
          }
        }, { root: true })
      }
      context.commit('addEvent', { event, context })
      break
    case 'WS_ITEM_CREATED':
    case 'WS_ITEM_UPDATED':
    case 'WS_ITEM_DELETED':
      logD('try notifyUserActionComplete', event)
      event.object = event.objectFull
      notifyUserActionComplete(event.type, event.object)
      logD('try processEventWs')
      await processEventWs(context, event)
      break
    default:
      throw new Error(`unsupported Event ${event.type}`)
  }
  logD('processEvent done')
}

async function processEventWs (context, event) {
  let type = event.type // WS_ITEM_CREATED, WS_ITEM_UPDATED, WS_ITEM_DELETED
  let object = event.object
  let objectType = object.__typename
  await context.dispatch('cache/update', {
    key: event.object.oid,
    fullItem: object
  }, { root: true })
  // todo найти все ленты с мастерской. В какие из них добавлять???? видимо в те, где pageToken === null
  for (let key in context.rootState.cache.cachedItems) {
    let keyPattern = 'wsItems: '
    if (key.startsWith(keyPattern)) {
      let { pagination, filter, sortStrategy } = JSON.parse(key.slice(keyPattern.length))
      assert(pagination)
      if (type === 'WS_ITEM_CREATED') { // добавляем object в начальные запросы
        if (!pagination.pageToken) { // pageToken === null при начальном запросе.
          await context.dispatch('cache/update', {
            key: key,
            path: '',
            actualAge: 'zero', // обновить при следующем запросе
            setter: ({ items, count, totalCount, nextPageToken }) => {
              assert(items && count >= 0 && totalCount >= 0)
              items.unshift(object)
              count++
              totalCount++
              return { items, count, totalCount, nextPageToken }
            }
          }, { root: true })
        }
      } else if (type === 'WS_ITEM_DELETED') { // удаляем из всех лент object
        await context.dispatch('cache/update', {
          key: key,
          path: '',
          actualAge: 'zero', // обновить при следующем запросе
          setter: ({ items, count, totalCount, nextPageToken }) => {
            assert(items && count >= 0 && totalCount >= 0)
            let indx = items.findIndex(item => item.oid === object.oid)
            if (indx >= 0) {
              items.splice(indx, 1)
              count--
              totalCount--
            }
            return { items, count, totalCount, nextPageToken }
          }
        }, { root: true })
      }
    }
  }
}

// вывести уведомление о действии пользователя
function notifyUserActionComplete (eventType, object) {
  assert.ok(eventType && object)
  let eventMessage = ''
  switch (eventType) {
    case 'NODE_CREATED':
      eventMessage = i18n.t('node created')
      break
    case 'NODE_DELETED':
      eventMessage = i18n.t('node deleted')
      break
    case 'NODE_RATED':
      eventMessage = i18n.t('node rated')
      break
    case 'USER_SUBSCRIBED':
      eventMessage = i18n.t('user subscribed')
      break
    case 'USER_UNSUBSCRIBED':
      eventMessage = i18n.t('user unsubscribed')
      break
    case 'WS_ITEM_CREATED':
      eventMessage = i18n.t('ws element created')
      break
    case 'WS_ITEM_DELETED':
      eventMessage = i18n.t('ws element deleted')
      break
    case 'WS_ITEM_UPDATED':
      eventMessage = i18n.t('ws element updated')
      break
  }
  // console.debug(eventMessage)
  notify(
    'info',
    eventMessage,
    {
      avatar: eventType.startsWith('WS_ITEM') ? null : object.thumbUrl,
      actions: [
        {
          label: i18n.t('GO'),
          noDismiss: true,
          color: 'green',
          handler: () => {
            // app/workspace/fragments
            let route = '/'
            if (['AUDIO', 'BOOK', 'FRAME', 'IMAGE', 'VIDEO'].includes(object.type)) {
              route = `/content/${object.oid}`
            } else if (['NODE'].includes(object.type)) {
              route = `/node/${object.oid}`
            } else if (['SPHERE', 'WORD', 'SENTENCE', 'CHAR'].includes(object.type)) {
              route = `/sphere/${object.oid}`
            } else {
              throw new Error(`bad object ${JSON.stringify(object)}`)
            }
            router.push(route)
          }
        }
      ]
    })
}

function notifyError (event) {
  assert.ok(event)
  notify('error', `${event.operation} ${event.code} ${event.message}`)
}
