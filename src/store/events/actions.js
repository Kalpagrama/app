import { apolloProvider } from 'boot/apollo'
import { fragments } from 'schema/index'
import { Notify } from 'quasar'
import { router } from 'boot/main'
import assert from 'assert'
import { i18n } from 'boot/i18n'
import { logI } from 'boot/log'
import { logD, logE } from 'src/boot/log'

export const init = async (context, userEvents) => {
  // if (context.state.initialized) throw new Error('events state initialized already')
  if (context.state.initialized) return
  logD('init', userEvents)
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

  context.commit('init', userEvents)
  return userEvents
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
  switch (event.type) {
    case 'ERROR':
      context.commit('stateSet', ['error', event])
      notifyError(event)
      break
    case 'PROGRESS':
      context.commit('stateSet', ['progress', event])
      break
    case 'NOTICE':
      processEventNotice(context, event)
      break
    case 'USER_CHANGED':
      context.commit('user/setUserValue', { path: event.path, value: event.value })
      context.commit('addEvent', event)
      break
    case 'NODE_CREATED':
      if (event.subject.oid === context.rootState.user.user.oid) {
        notifyUserActionComplete(event.type, event.object)
      }
      context.commit('stateSet', ['nodeCreated', event])
      context.commit('addEvent', event)
      break
    case 'NODE_RATED':
      if (event.subject.oid === context.rootState.user.user.oid) {
        notifyUserActionComplete(event.type, event.object)
      }
      context.commit('stateSet', ['nodeRated', event])
      context.commit('objects/setObjectValue', {
        oid: event.object.oid,
        path: ['rate'],
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
      context.commit('subscriptions/subscribe', event.object, { root: true })
      context.commit('addEvent', event)
      break
    case 'USER_UNSUBSCRIBED':
      notifyUserActionComplete(event.type, event.object)
      context.commit('stateSet', ['userUnSubscribed', event])
      context.commit('subscriptions/unSubscribe', event.object, { root: true })
      context.commit('addEvent', event)
      break
    case 'WS_ITEM_CREATED':
    case 'WS_ITEM_UPDATED':
    case 'WS_ITEM_DELETED':
      notifyUserActionComplete(event.type, event.object)
      processEventWs(context, event)
      break
    default:
      throw new Error(`unsupported Event ${event.type}`)
  }
}

function processEventWs (context, event) {
  let type = event.type // WS_ITEM_CREATED, WS_ITEM_UPDATED, WS_ITEM_DELETED
  let object = event.wsObject
  let objectType = object.__typename
  let operationName
  switch (type) {
    case 'WS_ITEM_CREATED':
      operationName = 'add'
      break
    case 'WS_ITEM_UPDATED':
      operationName = 'update'
      break
    case 'WS_ITEM_DELETED':
      operationName = 'delete'
      break
    default:
      throw new Error(`bad type ${type}`)
  }
  logD(operationName, objectType)
  context.commit(`workspace/${operationName}${objectType}`, object, { root: true })
}

function processEventNotice (context, { typeNotice, message }) {
  // TODO!
  if (typeNotice === 'GREETING') {
    // показать форму приветствия и туториал
    throw new Error(' todo !')
  } else {
    throw new Error('not implemented!')
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
  Notify.create(
    {
      position: 'top',
      message: eventMessage,
      avatar: object.thumbUrl,
      actions: [{
        label: i18n.t('Goto...'),
        noDismiss: true,
        handler: () => {
          // app/workspace/fragments
          let route = '/app/home'
          if (['AUDIO', 'BOOK', 'FRAME', 'IMAGE', 'VIDEO'].includes(object.type)) {
            route = `/app/content/${object.oid}`
          } else if (['NODE'].includes(object.type)) {
            route = `/app/node/${object.oid}`
          } else if (['SPHERE', 'WORD', 'SENTENCE', 'CHAR'].includes(object.type)) {
            route = `/app/sphere/${object.oid}`
          } else if (['WSBookmark', 'WSSphere', 'WSContent', 'WSNode', 'WSFragment'].includes(object.__typename)) {
            if (object.__typename === 'WSBookmark') {
              route = '/app/workspace/bookmarks'
            } else if (object.__typename === 'WSSphere') {
              route = '/app/workspace/spheres'
            } else if (object.__typename === 'WSContent') {
              route = '/app/workspace/contents'
            } else if (object.__typename === 'WSNode') {
              route = '/app/workspace/nodes'
            } else if (object.__typename === 'WSFragment') route = '/app/workspace/fragments'
          } else {
            throw new Error(`bad object ${JSON.stringify(object)}`)
          }
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
