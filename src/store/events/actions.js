import { apollo } from 'src/boot/apollo'
import { fragments } from 'src/schema/index'
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
  // logD('processEvent start', event)
  switch (event.type) {
    case 'ERROR':
      notifyError(event)
      break
    case 'PROGRESS':
      context.commit('stateSet', ['progress', event])
      if (event.action === 'UPLOAD') context.commit('stateSet', ['progressUpload', event])
      if (event.action === 'CREATE_NODE') context.commit('stateSet', ['progressCreateNode', event])
      break
    case 'NOTICE':
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
      // поместить ядро во все ленты
      await context.dispatch('lists/processEvent', event, { root: true })
      context.commit('addEvent', { event, context })
      break
    case 'NODE_VOTED':
      if (event.subject.oid === context.rootState.auth.userOid) {
        notifyUserActionComplete(event.type, event.object)
      }
      await context.dispatch('cache/update', {
        key: event.object.oid,
        path: 'rate',
        newValue: event.rate
      }, { root: true })
      await context.dispatch('lists/processEvent', event, { root: true })
      context.commit('addEvent', { event, context })
      break
    case 'NODE_DELETED':
      notifyUserActionComplete(event.type, event.object)
      context.commit('addEvent', { event, context })
      break
    case 'USER_SUBSCRIBED':
      notifyUserActionComplete(event.type, event.object)
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
      // notifyUserActionComplete(event.type, event.object)
      // logD('try processEventWs')
      await processEventWs(context, event)
      break
    default:
      throw new Error(`unsupported Event ${event.type}`)
  }
  logD('processEvent done')
}

async function processEventWs (context, event) {
  assert(event.wsRevision)
  if (event.wsRevision - context.rootState.workspace.revision > 1 ||
    context.rootState.workspace.revision > event.wsRevision // при очистке мастерской могло произойти такое
  ) {
    logW('на сервере есть неучтенные изменения!!', event.wsRevision, context.rootState.workspace.revision)
    await context.dispatch('workspace/expireWsCache', {}, { root: true })
  }
  // обновим в кэше значение итема
  let key = 'wsItem: ' + event.object.oid
  let vuexItem = context.rootState.cache.cachedItems[key]
  // logD('processEventWs:: ', vuexItem, event.object)
  if (!vuexItem || vuexItem.revision !== event.object.revision) {
    // если у имеющегося объекта та же ревизия - обновлять не надо (скорей всего это наши же изменения)
    logD('обновим значение итема в кэше')
    await context.dispatch('cache/update', {
      key: key,
      newValue: event.object
    }, { root: true })
  }

  // обновим списки мастерской
  logD('обновим списки мастерской')
  await context.dispatch('lists/processEvent', event, { root: true })
  context.dispatch('workspace/updateRevision', event.wsRevision, { root: true })
}

// вывести уведомление о действии пользователя
function notifyUserActionComplete (eventType, object) {
  // logD('notifyUserActionComplete', object)
  assert.ok(eventType && object)
  let eventMessage = ''
  switch (eventType) {
    case 'NODE_CREATED':
      eventMessage = i18n.t('node created')
      break
    case 'NODE_DELETED':
      eventMessage = i18n.t('node deleted')
      break
    case 'NODE_VOTED':
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
