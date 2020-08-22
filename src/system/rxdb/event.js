import assert from 'assert'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
import { i18n } from 'src/boot/i18n'
import { notify } from 'src/boot/notify'
import { router } from 'src/boot/main'
import { EventApi } from 'src/api/event'
import { rxdb } from 'src/system/rxdb'
import { RxCollectionEnum } from 'src/system/rxdb/index'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.RXDB_EVENT)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.RXDB_EVENT)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.RXDB_EVENT)
const logC = getLogFunc(LogLevelEnum.CRITICAL, LogModulesEnum.RXDB_EVENT)
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))

class Event {
  constructor (workspace, objects, lists) {
    this.workspace = workspace
    this.objects = objects
    this.lists = lists
  }

  init () {
    EventApi.init()
  }

  deInit () {
    EventApi.deInit()
  }

  async clear () {
  }

  // от сервера прилетел эвент (поправим данные в кэше)
  async processEvent (event, store) {
    assert(event && store, 'event && store')
    const f = this.processEvent
    logD(f, 'start', rxdb.isLeader())
    const t1 = performance.now()
    if (!rxdb.isLeader()) return
    switch (event.type) {
      case 'ERROR':
        if (event.operation === 'OBJECT_CREATE') { // не удалось создать ядро!
          logD(f, 'снимаем с публикации')
          // обнулим прогресс
          let fakeProgressEvent = { type: 'PROGRESS', action: 'CREATE', oid: event.object.oid, progress: -1 }
          store.commit('core/processEvent', fakeProgressEvent)
          let { items: createdWsNodes } = await rxdb.find({
            selector: {
              rxCollectionEnum: RxCollectionEnum.WS_NODE,
              $or: [{ oid: event.object.oid }, { oid: null }]
            }
          })
          logD(f, 'move createdWsNodes to draft. createdWsNodes.len = ' + createdWsNodes.length)
          // переместим ядро в черновики
          for (let wsNode of createdWsNodes) {
            logD(f, 'move wsNode to draft', wsNode.oid)
            await wsNode.updateExtended('stage', 'draft', false)// без debounce
            delete wsNode.oid
          }
          await wait(3000)
          let { items: createdWsNodes2 } = await rxdb.find({
            selector: {
              rxCollectionEnum: RxCollectionEnum.WS_NODE,
              stage: 'published',
              oid: event.object.oid
            }
          })
          logD(f, 'createdWsNodes2=', createdWsNodes2)
        }
        this.notifyError(event)
        break
      case 'PROGRESS':
        store.commit('core/processEvent', event)
        break
      case 'NOTICE':
        break
      case 'OBJECT_CHANGED':
        await this.objects.processEvent(event)
        break
      case 'OBJECT_CREATED':
        if (event.subject.oid === localStorage.getItem('k_user_oid')) {
          this.notifyUserActionComplete(event.type, event.object)
        }
        await this.lists.processEvent(event) // поместить объект во все ленты
        break
      case 'OBJECT_DELETED':
        this.notifyUserActionComplete(event.type, event.object)
        await this.objects.processEvent(event) // обновить ядро
        await this.lists.processEvent(event) // удалить объект из всех лент
        break
      case 'VOTED':
        if (event.subject.oid === localStorage.getItem('k_user_oid')) {
          this.notifyUserActionComplete(event.type, event.object)
        }
        await this.objects.processEvent(event) // обновить ядро
        await this.lists.processEvent(event) // обновить личную сферу юзера (если голосовал текущий пользователь)
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
    logD(f, `complete: ${performance.now() - t1} msec`)
  }

// вывести уведомление о действии пользователя
  notifyUserActionComplete (eventType, object) {
    assert.ok(eventType && object)
    let eventMessage = ''
    switch (eventType) {
      case 'OBJECT_CREATED':
        eventMessage = i18n.t('object created', 'объект создан')
        break
      case 'OBJECT_DELETED':
        eventMessage = i18n.t('object deleted', 'объект удален')
        break
      case 'VOTED':
        eventMessage = i18n.t('объект rated', 'объект оценен')
        break
      case 'USER_SUBSCRIBED':
        eventMessage = i18n.t('user subscribed', 'пользователь подписался')
        break
      case 'USER_UNSUBSCRIBED':
        eventMessage = i18n.t('user unsubscribed', 'пользователь отписался')
        break
      case 'WS_ITEM_CREATED':
        eventMessage = i18n.t('ws element created', 'элемент создан')
        break
      case 'WS_ITEM_DELETED':
        eventMessage = i18n.t('ws element deleted', 'элемент удален')
        break
      case 'WS_ITEM_UPDATED':
        eventMessage = i18n.t('ws element updated', 'элемент изменен')
        break
    }
    notify(
      'info',
      eventMessage,
      {
        // avatar: eventType.startsWith('WS_ITEM') ? null : object.thumbUrl,
        actions: [
          {
            label: i18n.t('Go', 'Перейти'),
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
