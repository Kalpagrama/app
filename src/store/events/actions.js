import { apolloProvider } from 'boot/apollo'
import { fragments } from 'schema/index'
import { Notify } from 'quasar'
import { router } from 'boot/main'
import assert from 'assert'
import { i18n } from 'boot/i18n'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.VUEX)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.VUEX)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.VUEX)

export const init = async (context) => {
  if (context.state.initialized) return
  logD('init', context.rootState.objects.currentUser.events)
  const observerEvent = apolloProvider.clients.wsApollo.subscribe({
    client: 'wsApollo',
    query: gql`
      ${fragments.eventFragment}
      subscription event {
        event {...eventFragment}
      }
    `
  })

  observerEvent.subscribe({
    next: ({ data: { event } }) => {
      logD(`EVENT received ${event.type}`, event)
      processEvent(context, event)
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
  let { data: { testWebPush } } = await apolloProvider.clients.apiApollo.query({
    query: gql`
      query testWebPush {
        testWebPush
      }`,
    fetchPolicy: 'network-only'
  })
  logD('testWebPush result = ', testWebPush)
  return testWebPush
}

function processEvent (context, event) {
  logD('event received', event)
  switch (event.type) {
    case 'ERROR':
      context.commit('stateSet', ['error', event])
      notifyError(event)
      break
    case 'PROGRESS':
      context.commit('stateSet', ['progress', event])
      break
    case 'NOTICE':
      context.commit('stateSet', ['notice', event])
      break
    case 'OBJECT_CHANGED':
      context.commit('objects/setObjectValue', {
        oid: event.object.oid,
        path: event.path,
        value: event.value
      }, {root: true})
      context.commit('addEvent', event)
      break
    case 'NODE_CREATED':
      if (event.subject.oid === context.rootState.objects.currentUser.oid) {
        notifyUserActionComplete(event.type, event.object)
      }
      context.commit('stateSet', ['nodeCreated', event])
      context.commit('addEvent', event)
      break
    case 'NODE_RATED':
      if (event.subject.oid === context.rootState.objects.currentUser.oid) {
        notifyUserActionComplete(event.type, event.object)
      }
      context.commit('stateSet', ['nodeRated', event])
      context.commit('objects/setObjectValue', {
        oid: event.object.oid,
        path: 'rate',
        value: event.rate
      }, { root: true })
      context.commit('addEvent', event)
      break
    case 'NODE_DELETED':
      notifyUserActionComplete(event.type, event.object)
      context.commit('stateSet', ['nodeDeleted', event])
      context.commit('addEvent', event)
      break
    case 'USER_SUBSCRIBED':
      notifyUserActionComplete(event.type, event.object)
      context.commit('stateSet', ['userSubscribed', event])
      if (event.subject.oid === context.rootState.objects.currentUser.oid) { // если это мы подписались
        context.commit('subscriptions/subscribe', event.object, { root: true })
        // на кого я подписан...
        let cachedObj = context.rootGetters['objects/objectGet']({ oid: event.object.oid })
        if (cachedObj && cachedObj.subscribers) { // обновим закэшированные данные
          cachedObj.subscribers.push({
            oid: event.subject.oid,
            name: event.subject.name,
            type: event.subject.type,
            thumbUrl: event.subject.thumbUrl
          })
        }
      }
      context.commit('addEvent', event)
      break
    case 'USER_UNSUBSCRIBED':
      notifyUserActionComplete(event.type, event.object)
      context.commit('stateSet', ['userUnSubscribed', event])
      if (event.subject.oid === context.rootState.objects.currentUser.oid) {
        context.commit('subscriptions/unSubscribe', event.object, { root: true })
        let cachedObj = context.rootGetters['objects/objectGet']({ oid: event.object.oid })
        if (cachedObj && cachedObj.subscribers) { // обновим закэшированные данные
          let indx = cachedObj.subscribers.findIndex(obj => obj.oid === event.subject.oid)
          if (indx >= 0) {
            cachedObj.subscribers.splice(indx, 1)
          } else {
            logE('subscriber not found', event, cachedObj)
          }
        }
      }
      context.commit('addEvent', event)
      break
    case 'WS_ITEM_CREATED':
    case 'WS_ITEM_UPDATED':
    case 'WS_ITEM_DELETED':
      logD('try notifyUserActionComplete', event)
      event.object = event.objectFull
      notifyUserActionComplete(event.type, event.object)
      logD('try processEventWs')
      processEventWs(context, event)
      break
    default:
      throw new Error(`unsupported Event ${event.type}`)
  }
}

function processEventWs (context, event) {
  let type = event.type // WS_ITEM_CREATED, WS_ITEM_UPDATED, WS_ITEM_DELETED
  let object = event.object
  let objectType = object.__typename
  let operationName
  switch (type) {
    case 'WS_ITEM_CREATED':
      operationName = 'Create'
      break
    case 'WS_ITEM_UPDATED':
      operationName = 'Update'
      break
    case 'WS_ITEM_DELETED':
      operationName = 'Delete'
      break
    default:
      throw new Error(`bad type ${type}`)
  }
  logD(operationName, objectType)
  context.commit(`workspace/ws${objectType}${operationName}`, object, { root: true })
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
  Notify.create(
    {
      position: 'top',
      message: eventMessage,
      avatar: eventType.startsWith('WS_ITEM') ? null : object.thumbUrl,
      actions: [{
        label: i18n.t('Goto...'),
        noDismiss: true,
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
          // else if (['WSBookmark', 'WSSphere', 'WSContent', 'WSNode', 'WSFragment'].includes(object.__typename)) {
          //   if (object.__typename === 'WSBookmark') {
          //     route = '/app/workspace/bookmarks'
          //   } else if (object.__typename === 'WSSphere') {
          //     route = '/app/workspace/spheres'
          //   } else if (object.__typename === 'WSContent') {
          //     route = '/app/workspace/contents'
          //   } else if (object.__typename === 'WSNode') {
          //     route = '/app/workspace/nodes'
          //   } else if (object.__typename === 'WSFragment') route = '/app/workspace/fragments'
          // }

          router.push(route)
        }
      }]
    }
  )
}

function notifyError (event) {
  assert.ok(event)

  Notify.create(
    {
      position: 'top',
      message: `${event.operation} ${event.code} ${event.message}`
    }
  )
}
