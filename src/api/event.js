import { getLogFunc, LogLevelEnum, LogSystemModulesEnum, performance, localStorage } from 'src/system/log'
import { apollo } from 'src/boot/apollo'
import gql from 'graphql-tag'
import assert from 'assert'
import { fragments } from 'src/api/fragments'
import { rxdb } from 'src/system/rxdb'
import { apiCall } from 'src/api/index'
import { AuthApi } from 'src/api/auth'
import { router } from 'src/boot/system'
import { notify } from 'src/boot/notify'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.API)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.API)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.API)

class EventApi {
   static verbalizeRate(float){
      assert(float >= 0 && float <= 1)
      if (float <= 0.2) return 'Очень далеко'
      else if (float <= 0.4) return 'Далеко'
      else if (float <= 0.6) return 'Где-то рядом'
      else if (float <= 0.8) return 'Близко'
      else if (float <= 1) return 'Прямо в точку!'
   }

   // ф-я дублируется на сервере (при изменении - синхронизировать)
   static makeEventCard (event) {
      const myOid = rxdb.getCurrentUser().oid
      const cropObj = (obj) => {
         assert(obj.oid && obj.type, 'bad obj: ' + JSON.stringify(obj))
         return { oid: obj.oid, name: obj.name || '', thumbUrl: obj.thumbUrl, type: obj.type }
      }
      const verbalizeObject = (obj) => {
         assert(obj.oid && obj.type, 'bad obj: ' + JSON.stringify(obj))
         return `${verbalizeObjectType(obj)}${obj.name ? ' ' + obj.name : ''}`
      }
      const verbalizeObjectType = (obj) => {
         assert(obj.type, 'bad obj: ' + JSON.stringify(obj))
         switch (obj.type) {
            case 'NODE':
               return 'ядро'
            case 'JOINT':
               return 'связь'
            case 'USER':
               return 'пользователь'
            case 'SPHERE':
            case 'CHAR':
            case 'WORD':
            case 'SENTENCE':
               return 'сфера'
            case 'AUDIO':
            case 'IMAGE':
            case 'VIDEO':
            case 'BOOK':
               return 'контент'
         }
      }
      let resultCard = { icon: '', title: 'Новое событие', description: '', items: [] }
      switch (event.type) {
         case 'USER_SUBSCRIBED':
            if (event.subject.oid === myOid) {
               resultCard.items = [`вы подписались на ${verbalizeObjectType(event.object)}`, cropObj(event.object)]
            } else {
               resultCard.items = [cropObj(event.subject), `подписался на ${verbalizeObjectType(event.object)}`, cropObj(event.object)]
            }
            break
         case 'USER_UNSUBSCRIBED':
            if (event.subject.oid === myOid) {
               resultCard.items = [`вы отписались от ${verbalizeObjectType(event.object)}`, cropObj(event.object)]
            } else {
               resultCard.items = [cropObj(event.subject), `отписался от ${verbalizeObjectType(event.object)}`, cropObj(event.object)]
            }
            break
         case 'VOTED':
            if (event.subject.oid === myOid) {
               resultCard.items = [`вы проголосовали за ${verbalizeObjectType(event.object)}`, cropObj(event.object)]
            } else {
               resultCard.items = [cropObj(event.subject), `проголосовал за ${verbalizeObjectType(event.object)} - ${EventApi.verbalizeRate(event.rateUser)}`, cropObj(event.object)]
            }
            break
         case 'OBJECT_CREATED':
            resultCard.title = 'Создан новый объект'
            if (event.matter.reason === 'JOIN') {
               resultCard.items = [cropObj(event.subject), 'использовал ваше ядро для создания', cropObj(event.object)]
            } else if (event.subject.oid === myOid) {
               resultCard.items = [`вы создали ${verbalizeObjectType(event.object)}`, cropObj(event.object)]
            } else {
               resultCard.items = [cropObj(event.subject), `создал ${verbalizeObjectType(event.object)}`, cropObj(event.object)]
            }
            break
         case 'COMMENT_CREATED':
            resultCard.title = 'Новый комментарий'
            resultCard.items = [cropObj(event.subject), `создал комментарий на ${verbalizeObjectType(event.object)}`, cropObj(event.object), event.comment.text]
            break
         case 'COMMENT_DELETED':
            resultCard.title = 'Удален комментарий'
            resultCard.items = [cropObj(event.subject), `удалил комментарий на ${verbalizeObjectType(event.object)}`, cropObj(event.object), event.comment.text]
            break
      }
      resultCard.description = ''
      resultCard.title = resultCard.items.reduce((acc, item) => {
         acc += ` ${typeof item === 'string' ? item : `"${item.name}"`}`
         return acc
      }, '')
      return resultCard
   }

   static async init () {
      if (EventApi.initialized) return true
      const f = EventApi.init
      logD(f, 'start')
      const t1 = performance.now()
      const cb = async () => {
         assert(apollo.clients.ws, '!apollo.clients.ws1')
         assert(localStorage.getItem('k_token'), '!localStorage.getItem(k_token)')
         apollo.clients.ws.openConnection()
         const observerEvent = apollo.clients.ws.subscribe({
            client: 'wsApollo',
            query: gql`
                ${fragments.eventFragmentWithBatch}
                subscription {
                    event {...eventFragmentWithBatch}
                }
            `
         })
         EventApi.subscription = observerEvent.subscribe({
            next: async ({ data: { event } }) => {
               logD('EVENT received', event)
               if (event.type === 'NOTICE' && event.typeNotice === 'SESSION_CONFIRMED'){
                  // сессия подтверждена (например перешли по ссылке подтверждения с почты)
                  let {result, failReason, oid} = await AuthApi.userAuthenticate(null, null)
                  if (result === false) throw new Error(`Error on userAuthenticate: ${failReason}`)
                  else {
                     notify('info', 'Welcome to KALPAGRAMA!')
                     await router.replace('/')
                  }
               } else await rxdb.processEvent(event)
            },
            error: (error) => {
               logE('apollo subscribe (websocket) error', error)
            }
         })
         return true
      }
      let res = await apiCall(f, cb)
      EventApi.initialized = true
      return res
   }

   static async deInit () {
      if (!EventApi.initialized) return true
      const f = EventApi.deInit
      logD(f, 'start')
      const t1 = performance.now()
      const cb = async () => {
         if (EventApi.subscription) {
            assert(apollo.clients.ws, '!apollo.clients.ws2')
            // assert(localStorage.getItem('k_token'), '!localStorage.getItem(k_token)')
            EventApi.subscription.unsubscribe()
         }
         apollo.clients.ws.closeConnection()
         return true
      }
      let res = await apiCall(f, cb)
      EventApi.initialized = false
      return res
   }
}

export { EventApi }
