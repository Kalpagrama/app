import {RxCollectionEnum} from 'src/system/rxdb/common'
import {assert} from 'src/system/utils'
import { isSsr } from 'src/system/log'

let rxdb

function getRxCollectionEnumFromId (id) {
   assert(id, '!id')
   let parts = id.split('::')
   assert(parts.length >= 2, 'bad id!' + id)
   let rxCollection = parts[0]
   assert(rxCollection in RxCollectionEnum, 'bad rxCollection' + rxCollection)
   return rxCollection
}

function getRawIdFromId (id) {
   assert(id, '!id')
   let parts = id.split('::')
   assert(parts.length >= 2, 'bad id!' + id)
   let rawId = parts[1]
   assert(rawId, 'bad id' + id)
   return rawId
}

function makeId (rxCollectionEnum, rawId, params = null) {
   assert(rawId, '!rawId')
   assert(rxCollectionEnum in RxCollectionEnum, 'bad rxCollectionEnum' + rxCollectionEnum)
   assert(!rawId.includes('::'), 'bad rawId' + rawId)
   params = params || {}
   return rxCollectionEnum + '::' + rawId + '::' + JSON.stringify(params)
}

async function initRxdb(store){
   console.log('!!!!!!!!!!!!!!!!!!!initRxdb')
   if (isSsr) {
      const {rxdbDummy} = await import('src/system/rxdb/index_ssr')
      rxdb = rxdbDummy
   } else {
      const {rxdbWrapper} = await import('src/system/rxdb/index_browser')
      rxdb = rxdbWrapper
   }
   await rxdb.create(store)
   return rxdb
}

export {
   initRxdb,
   rxdb,
   RxCollectionEnum,
   getRxCollectionEnumFromId,
   getRawIdFromId,
   makeId
}
