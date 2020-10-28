import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/boot/log'
import { apollo } from 'src/boot/apollo'
import assert from 'assert'
import { fragments } from 'src/api/fragments'
import { rxdb } from 'src/system/rxdb'
import { apiCall } from 'src/api/index'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.GQL)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.GQL)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.GQL)

class EventApi {
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
                ${fragments.eventFragment}
                subscription event {
                    event {...eventFragment}
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
