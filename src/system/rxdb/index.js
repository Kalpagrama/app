import {RxCollectionEnum} from 'src/system/rxdb/common'

let rxdb

async function initRxdb(store){
   console.log('!!!!!!!!!!!!!!!!!!!initRxdb')
   if (process.env.MODE === 'ssr') {
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
   RxCollectionEnum
}
