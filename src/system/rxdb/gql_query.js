// сцепляет запросы и отправляет пачкой
import { assert } from 'src/system/common/utils'
import { getLogFunctions, LogSystemModulesEnum, performance } from 'src/boot/log'
import { getRawIdFromId } from 'src/system/rxdb'
import { AuthApi } from 'src/api/auth'
import { ObjectCreateApi } from 'src/api/object_create'
import { ObjectApi } from 'src/api/object'

let { logD, logT, logI, logW, logE, logC } = getLogFunctions(LogSystemModulesEnum.RXDB_GQL)

// класс для запроса списков и отдельных объектов
class GqlQueries {
   static getFetchFunc (id, params) {
      let fetchFunc
      switch (getRawIdFromId(id)) {
         // case 'services' :
         //    fetchFunc = async () => {
         //       return {
         //          notEvict: true, // живет вечно
         //          item: await AuthApi.services(),
         //          actualAge: 'day'
         //       }
         //    }
         //    break
         case 'settings' :
            fetchFunc = async () => {
               return {
                  notEvict: true, // живет вечно
                  item: await AuthApi.settings(),
                  actualAge: 'day'
               }
            }
            break
         // case 'nodeCategories' :
         //    fetchFunc = async () => {
         //       return {
         //          notEvict: true, // живет в кэше вечно
         //          item: await ObjectCreateApi.nodeCategories(),
         //          actualAge: 'day' // обновляется раз в день
         //       }
         //    }
         //    break
         case 'emojiSpheres' :
            fetchFunc = async () => {
               return {
                  notEvict: true, // живет в кэше вечно
                  item: await ObjectCreateApi.emojiSpheres(),
                  actualAge: 'day' // обновляется раз в день
               }
            }
            break
         case 'objectStat' :
            assert(params.oid, '!params.oid')
            fetchFunc = async () => {
               return {
                  item: await ObjectApi.stat(params.oid),
                  actualAge: 'hour'
               }
            }
            break
         default:
            throw new Error(`bad id ${id}`)
      }
      return fetchFunc
   }

   async destroy (clearStorage) {
      if (this.created) {
         this.created = false
      }
   }

   async create (cache) {
      this.cache = cache
      this.created = true
   }

   async get (id, clientFirst, force, onFetchFunc = null, params = null) {
      let fetchFunc = GqlQueries.getFetchFunc(id, params)

      logD('objects::get start')
      let rxDoc = await this.cache.get(id, fetchFunc, clientFirst, force, onFetchFunc)
      if (!rxDoc) return null // см "queued item was evicted by queue overflow"
      assert(rxDoc.cached, '!rxDoc.cached')
      return rxDoc
   }
}

export { GqlQueries }
