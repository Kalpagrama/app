// сцепляет запросы и отправляет пачкой
import assert from 'assert'
import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/boot/log'
import { RxCollectionEnum, rxdb, makeId, getRawIdFromId } from 'src/system/rxdb/index'
import { AuthApi } from 'src/api/auth'
import { NodeApi } from 'src/api/node'
import { ObjectsApi } from 'src/api/objects'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.RXDB_GQL)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.RXDB_GQL)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.RXDB_GQL)
const logC = getLogFunc(LogLevelEnum.CRITICAL, LogSystemModulesEnum.RXDB_GQL)

// класс для запроса списков и отдельных объектов
class GqlQueries {
   constructor (cache) {
      this.cache = cache
   }

   // Вернет объект из кэша, либо запросит его. и вернет промис, который ВОЗМОЖНО когда-то выполнится(когда дойдет очередь);
   // Если в данный момент какой-либо запрос уже выполняется, то поставит в очередь.
   // priority 0 - будут выполнены QUEUE_MAX_SZ последних запросов. Запрашиваются пачками по 5 штук. Последние запрошенные - в первую очередь
   // priority 1 - только если очередь priority 0 пуста. будут выполнены последние 4 запроса
   async get (id, clientFirst, force, onFetchFunc = null, servicesApollo = null, params = null) {
      let fetchFunc
      switch (getRawIdFromId(id)) {
         case 'services' :
            assert(servicesApollo, '!servicesApollo')
            fetchFunc = async () => {
               return {
                  notEvict: true, // живет вечно
                  item: await AuthApi.services(servicesApollo),
                  actualAge: 'day'
               }
            }
            break
         case 'nodeCategories' :
            fetchFunc = async () => {
               return {
                  notEvict: true, // живет в кэше вечно
                  item: await NodeApi.nodeCategories(),
                  actualAge: 'day' // обновляется раз в день
               }
            }
            break
         case 'emojiSpheres' :
            fetchFunc = async () => {
               return {
                  notEvict: true, // живет в кэше вечно
                  item: await NodeApi.emojiSpheres(),
                  actualAge: 'day' // обновляется раз в день
               }
            }
            break
         case 'votes' :
            assert(params.oid, '!params.oid')
            fetchFunc = async () => {
               return {
                  item: await ObjectsApi.votes(params.oid),
                  actualAge: 'hour'
               }
            }
            break
         default: throw new Error(`bad id ${id}`)
      }

      // logD('objects::get start')
      let rxDoc = await this.cache.get(id, fetchFunc, clientFirst, force, onFetchFunc)
      if (!rxDoc) return null // см "queued item was evicted legally"
      assert(rxDoc.cached, '!rxDoc.cached')
      return rxDoc
   }
}

export { GqlQueries }
