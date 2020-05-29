import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
import { apollo } from 'src/boot/apollo'
import assert from 'assert'
import { fragments } from 'src/api/fragments'
import {rxdb} from 'src/system/rxdb'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.GQL)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.GQL)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.GQL)

class EventApi{
  static async init(){
    const observerEvent = apollo.clients.ws.subscribe({
      client: 'wsApollo',
      query: gql`
        ${fragments.eventFragment}
        subscription event {
          event {...eventFragment}
        }
      `
    })

    observerEvent.subscribe({
      next: async ({ data: { event } }) => {
        logD(`EVENT received ${event.type}`, event)
        await rxdb.processEvent(event)
      },
      error: (error) => {
        logE('EVENT error', error)
      }
    })
    return true
  }
}

export {EventApi}
