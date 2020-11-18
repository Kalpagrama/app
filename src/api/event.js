import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/boot/log'
import { apollo } from 'src/boot/apollo'
import assert from 'assert'
import { fragments } from 'src/api/fragments'
import { rxdb } from 'src/system/rxdb'
import { apiCall } from 'src/api/index'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.API)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.API)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.API)

class EventApi {
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
               resultCard.items = [cropObj(event.subject), `проголосовал за ${verbalizeObjectType(event.object)}`, cropObj(event.object)]
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
      }
      resultCard.description = resultCard.items.reduce((acc, item) => {
         acc += ` ${typeof item === 'string' ? item : `"${item.name}"`}`
         return acc
      }, '')
      return resultCard
   }

   static async init () {
      const f = EventApi.init
      logD(f, 'start')
      const t1 = performance.now()
      const cb = async () => {
         assert(apollo.clients.ws, '!apollo.clients.ws1')
         assert(localStorage.getItem('k_token'), '!localStorage.getItem(k_token)')
         const observerEvent = apollo.clients.ws.subscribe({
            client: 'wsApollo',
            query: gql`
                ${fragments.eventFragmentWithBatch}
                subscription event {
                    event {...eventFragmentWithBatch}
                }
            `
         })
         EventApi.subscription = observerEvent.subscribe({
            next: async ({ data: { event } }) => {
               logD(`EVENT received ${event.type}`, event)
               await rxdb.processEvent(event)
            },
            error: (error) => {
               logE('apollo subscribe (websocket) error', error)
            }
         })
         return true
      }
      return await apiCall(f, cb)
   }

   static async deInit () {
      const f = EventApi.deInit
      logD(f, 'start')
      const t1 = performance.now()
      const cb = async () => {
         if (EventApi.subscription) {
            assert(apollo.clients.ws, '!apollo.clients.ws2')
            // assert(localStorage.getItem('k_token'), '!localStorage.getItem(k_token)')
            EventApi.subscription.unsubscribe()
         }
         return true
      }
      return await apiCall(f, cb)
   }
}

export { EventApi }
