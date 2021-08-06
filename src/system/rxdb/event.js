import assert from 'assert'
import { getLogFunc, initLogRocket, LogLevelEnum, LogSystemModulesEnum } from 'src/system/log'
import { i18n } from 'src/boot/i18n'
import { notify } from 'src/boot/notify'
import { EventApi } from 'src/api/event'
import { rxdb } from 'src/system/rxdb/index_browser'
import { RxCollectionEnum } from 'src/system/rxdb/common'
import { getReactive } from 'src/system/rxdb/reactive'
import { wait } from 'src/system/utils'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.RXDB_EVENT)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.RXDB_EVENT)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.RXDB_EVENT)
const logC = getLogFunc(LogLevelEnum.CRITICAL, LogSystemModulesEnum.RXDB_EVENT)

class Event {
   constructor (workspace, objects, lists, cache) {
      this.workspace = workspace
      this.objects = objects
      this.lists = lists
      this.cache = cache
   }

   async init () {
      await EventApi.init()
   }

   async deInit () {
      await EventApi.deInit()
   }

   // от сервера прилетел эвент (поправим данные в кэше)
   async processEvent (event, store) {
      assert(event && store, 'event && store')
      const f = this.processEvent
      logD(f, 'start', event)
      const t1 = performance.now()

      if (event.type === 'BATCH_EVENTS') {
         assert(event.events && Array.isArray(event.events))
         for (let subEvent of event.events) {
            await this.processEvent(subEvent, store)
         }
      } else {
         // добавляем эвент на ленту (кроме собственных событий  (я создал / я проголосовал итд))
         if (event.subject && event.subject.oid !== rxdb.getCurrentUser().oid) {
            let rxDocsFeed = await this.cache.find({
               selector: {
                  'props.rxCollectionEnum': RxCollectionEnum.LST_FEED
               }
            })
            logD(f, 'found LST_FEED: ', rxDocsFeed)
            for (let rxDoc of rxDocsFeed) {
               let reactiveItem = getReactive(rxDoc).getPayload()
               assert(reactiveItem.items, '!reactiveItem.items')
               // logD(f, `add event to begin of list (${reactiveItem.items.length})`, reactiveItem)
               reactiveItem.items.splice(0, 0, event)
               reactiveItem.totalCount++
               // logD(f, `reactive LST_FEED changed (${reactiveItem.items.length})`, reactiveItem)
            }
         }
         event.card = EventApi.makeEventCard(event)
         if (event.subject && event.subject.oid === rxdb.getCurrentUser().oid) this.notifyUserActionComplete(event.type, event.object)
         switch (event.type) {
            case 'ERROR':
               if (event.operation === 'OBJECT_CREATE') { // не удалось создать ядро!
                  // logE(f, 'не удалось создать ядро!', event)
                  // снимаем с публикации todo
               }
               logE(f, 'backend error!', event)
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
               await this.objects.processEvent(event) // обновить  статистику на ядре
               await this.lists.processEvent(event) // поместить объект во все ленты
               break
            case 'OBJECT_DELETED':
               await this.objects.processEvent(event) // обновить ядро
               await this.lists.processEvent(event) // удалить объект из всех лент
               break
            case 'VOTED':
               event.card = EventApi.makeEventCard(event)
               await this.objects.processEvent(event) // обновить ядро + статистику голосования на ядре
               await this.lists.processEvent(event) // обновить личную сферу юзера (если голосовал текущий пользователь)
               break
            case 'USER_SUBSCRIBED':
            case 'USER_UNSUBSCRIBED':
               event.card = EventApi.makeEventCard(event)
               await this.lists.processEvent(event)
               break
            case 'WS_ITEM_CREATED':
            case 'WS_ITEM_UPDATED':
            case 'WS_ITEM_DELETED':
               await this.workspace.processEvent(event)
               break
            case 'COMMENT_CREATED':
            case 'COMMENT_DELETED':
               await this.lists.processEvent(event) // поместить объект во все ленты
               break
            default:
               throw new Error(`unsupported Event ${event.type}`)
         }
      }
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
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
      // notify(
      //    'info',
      //    eventMessage,
      //    {
      //       // avatar: eventType.startsWith('WS_ITEM') ? null : object.thumbUrl,
      //       actions: [
      //          {
      //             label: i18n.t('Go', 'Перейти'),
      //             noDismiss: true,
      //             color: 'green',
      //             handler: async () => {
      //                // app/workspace/fragments
      //                let route = '/'
      //                if (['AUDIO', 'BOOK', 'FRAME', 'IMAGE', 'VIDEO'].includes(object.type)) {
      //                   route = `/content/${object.oid}`
      //                } else if (['NODE'].includes(object.type)) {
      //                   route = `/node/${object.oid}`
      //                } else if (['SPHERE', 'WORD', 'SENTENCE', 'CHAR'].includes(object.type)) {
      //                   route = `/sphere/${object.oid}`
      //                } else {
      //                   throw new Error(`bad object ${JSON.stringify(object)}`)
      //                }
      //                await router.push(route)
      //             }
      //          }
      //       ]
      //    })
   }

   notifyError (event) {
      assert.ok(event)
      notify('error', `${event.operation} ${event.code} ${event.message}`)
   }
}

export { Event }
