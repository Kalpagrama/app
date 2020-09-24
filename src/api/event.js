import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/boot/log'
import { apollo } from 'src/boot/apollo'
import assert from 'assert'
import { fragments } from 'src/api/fragments'
import {rxdb} from 'src/system/rxdb'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.GQL)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.GQL)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.GQL)

class EventApi{
  static init(){
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

  static deInit(){
    if (EventApi.subscription) {
      assert(apollo.clients.ws, '!apollo.clients.ws2')
      assert(localStorage.getItem('k_token'), '!localStorage.getItem(k_token)')
      EventApi.subscription.unsubscribe()
    }
    return true
  }
}

export {EventApi}
