import { getLogFunctions, LogSystemModulesEnum, performance } from 'src/boot/log'
import { apollo } from 'src/boot/apollo'
import gql from 'graphql-tag'
import {assert} from 'src/system/common/utils'
import { fragments } from 'src/api/fragments'
import { rxdb } from 'src/system/rxdb'
import { apiCall } from 'src/api/index'
import { AuthApi } from 'src/api/auth'
import { router } from 'src/boot/system'
import { notify } from 'src/boot/notify'
import { store } from 'src/store/index'
import { t } from 'src/boot/i18n'
let { logD, logT, logI, logW, logE, logC } = getLogFunctions(LogSystemModulesEnum.API)

class EventApi {
   static verbalizeRate(float){
      assert(float >= 0 && float <= 1)
      if (float <= 0.2) return 'Very far' // 'Очень далеко'
      else if (float <= 0.4) return 'Far' // 'Далеко'
      else if (float <= 0.6) return 'Quite close' // 'Где-то рядом'
      else if (float <= 0.8) return 'Close' // 'Близко'
      else if (float <= 1) return 'Spot on' // 'Прямо в точку!'
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
            case 'BLOCK':
               return 'смысловой блок'
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
      const f = EventApi.init
      logD(f, 'start')
      const t1 = performance.now()
      const kToken = rxdb.getAuthToken()
      if (!kToken) {
         logT(f, 'session is not initialized! cancel EventApi::init!')
         return false
      }
      if (EventApi.kToken === kToken) return true // уже все норм! ничего больше не надо
      else if (EventApi.kToken) {
         logT(f, 'уже инициализировано с другим токеном! deinit old connection!', EventApi.kToken, kToken)
         await EventApi.deInit()
      }
      const cb = async () => {
         assert(apollo.clients.ws, '!apollo.clients.ws1')
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
                     store.commit('ui/stateSet', ['authGuard', null])
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
      let res
      // приложение может работать и без сокетов!
      try {
         res = await apiCall(f, cb, false)
      } catch (err) {
         logE('error on EventApi::deinit', err)
      }
      EventApi.kToken = kToken
      return res
   }

   static async deInit () {
      if (!EventApi.kToken) return true
      const f = EventApi.deInit
      logD(f, 'start')
      const t1 = performance.now()
      const cb = async () => {
         if (EventApi.subscription) {
            assert(apollo.clients.ws, '!apollo.clients.ws2')
            EventApi.subscription.unsubscribe()
         }
         apollo.clients.ws.closeConnection()
         return true
      }
      let res
      // приложение может работать и без сокетов!
      try {
         res = await apiCall(f, cb, false)
      } catch (err) {
         logE('error on EventApi::deinit', err)
      }
      EventApi.kToken = null
      return res
   }
}

export { EventApi }
