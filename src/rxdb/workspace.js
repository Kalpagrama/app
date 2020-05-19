import {
  createRxDatabase,
  RxDatabase
} from 'rxdb'

addRxPlugin(require('pouchdb-adapter-idb'))

import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.VUEX_WS)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.VUEX_WS)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.VUEX_WS)


async function init(){
  const db = await createRxDatabase({
    name: 'wsDB',
    adapter: 'idb', // <- storage-adapter
    multiInstance: true, // <- multiInstance (optional, default: true)
    eventReduce: false // <- eventReduce (optional, default: true)
  })
  getLogFunc(db)
}

init()

