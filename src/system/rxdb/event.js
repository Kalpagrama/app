import assert from 'assert'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
import { i18n } from 'src/boot/i18n'
import { notify } from 'src/boot/notify'
import { router } from 'src/boot/main'
import { EventApi } from 'src/api/event'
import {rxdb} from 'src/system/rxdb'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.RXDB_EVENT)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.RXDB_EVENT)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.RXDB_EVENT)
const logC = getLogFunc(LogLevelEnum.CRITICAL, LogModulesEnum.RXDB_EVENT)

// todo make reactive!
let reactiveProgress = {
  progress: 0,
  progressUpload: 0,
  progressCreateNode: 0
}
class Event {
  constructor (workspace, objects, lists) {
    this.workspace = workspace
    this.objects = objects
    this.lists = lists
  }

  async init () {
    await EventApi.init()
  }

  async clear(){}

  // от сервера прилетел эвент (поправим данные в кэше)
  async processEvent (event) {
    const f = this.processEvent
    logD(f, 'start', rxdb.isLeader())
    if (!rxdb.isLeader()) return
    switch (event.type) {
      case 'ERROR':
        this.notifyError(event)
        break
      case 'PROGRESS':
        reactiveProgress.progress = event.progress
        if (event.action === 'UPLOAD') reactiveProgress.progressUpload = event.progress
        if (event.action === 'CREATE_NODE') reactiveProgress.progressCreateNode = event.progress
        break
      case 'NOTICE':
        break
      case 'OBJECT_CHANGED':
        await this.objects.processEvent(event)
        break
      case 'NODE_CREATED':
        if (event.subject.oid === localStorage.getItem('k_user_oid')) {
          this.notifyUserActionComplete(event.type, event.object)
        }
        // поместить ядро во все ленты
        await this.lists.processEvent(event)
        break
      case 'CHAIN_CREATED':
        if (event.subject.oid === rxdb.currentUser().oid) {
          this.notifyUserActionComplete(event.type, event.object)
        }
        // поместить цепочку во все ленты
        await this.lists.processEvent(event)
        break
      case 'VOTED':
        if (event.subject.oid === localStorage.getItem('k_user_oid')) {
          this.notifyUserActionComplete(event.type, event.object)
        }
        await this.objects.processEvent(event) // обновить ядро
        await this.lists.processEvent(event) // обновить личную сферу юзера (если голосовал текущий пользователь)
        break
      case 'NODE_DELETED':
        this.notifyUserActionComplete(event.type, event.object)
        break
      case 'USER_SUBSCRIBED':
        this.notifyUserActionComplete(event.type, event.object)
        await this.lists.processEvent(event)
        break
      case 'USER_UNSUBSCRIBED':
        this.notifyUserActionComplete(event.type, event.object)
        await this.lists.processEvent(event)
        break
      case 'WS_ITEM_CREATED':
      case 'WS_ITEM_UPDATED':
      case 'WS_ITEM_DELETED':
        await this.workspace.processEvent(event)
        break
      default:
        throw new Error(`unsupported Event ${event.type}`)
    }
    logD('processEvent done')
  }

// вывести уведомление о действии пользователя
  notifyUserActionComplete (eventType, object) {
    assert.ok(eventType && object)
    let eventMessage = ''
    switch (eventType) {
      case 'NODE_CREATED':
        eventMessage = i18n.t('node created')
        break
      case 'CHAIN_CREATED':
        eventMessage = i18n.t('chain created')
        break
      case 'NODE_DELETED':
        eventMessage = i18n.t('node deleted')
        break
      case 'VOTED':
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
            handler: async () => {
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
              await router.push(route)
            }
          }
        ]
      })
  }

  notifyError (event) {
    assert.ok(event)
    notify('error', `${event.operation} ${event.code} ${event.message}`)
  }
}

export { Event }
