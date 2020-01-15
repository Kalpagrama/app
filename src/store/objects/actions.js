import { apollo } from 'src/boot/apollo'
import { fragments } from 'src/schema/index'
import assert from 'assert'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.VUEX)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.VUEX)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.VUEX)

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))
export const init = async (context) => {
  logD('objects/init')
  if (context.state.initialized) return
  let currentUser = await context.dispatch('objects/get', { oid: context.rootState.auth.userOid }, { root: true })
  context.commit('init', currentUser)
  logD('objects/init done')
}

//
// class Queue {
//   constructor () {
//     this.queueMaster = []
//     this.queueSecondary = []
//   }
//
//   // вернет промис, который выполнится когда-то... (когда данные запросятся и вернутся)
//   push (context, oid, fragmentName, priority) {
//     return new Promise((resolve, reject) => {
//       let queue
//       let queueMaxSz = 0
//       if (priority === 0) {
//         queue = this.queueMaster
//         queueMaxSz = 20
//       } else if (priority === 1) {
//         queue = this.queueSecondary
//         queueMaxSz = 4
//       }
//       assert.ok(queue)
//       queue.push({ context, oid, fragmentName, resolve, reject })
//       while (queue.length > queueMaxSz) {
//         let firstItem = queue.shift()
//         this.destroyItem(firstItem)
//       }
//       // ждем, параллельных вызовов(чтобы выполнить пачкой). Иначе, первый запрос пойдет отдельно, а остальные - пачкой
//       wait(100).then(() => this.next(context)).catch(reject)
//     })
//   }
//
//   // вызывать при удалении из очереди
//   destroyItem ({ context, oid, fragmentName, resolve, reject }) {
//     let object = context.getters.objectGet({ oid, fragmentName })
//     if (object) {
//       resolve(object)
//     } else {
//       reject('queued object was evicted legally')
//     }
//   }
//
//   // берет из очереди последний добавленный и отправляет на выполненеие
//   next (context) {
//     // если предыдущий запрос еще выполняется, то подождем...
//     if (context.getters.queryInProgress) return
//     // извлечь из очереди сдедующие объекты для запроса на сервер. Проверяем на наличие
//     let itemsForQuery = []
//     while (itemsForQuery.length < 5 && (this.queueMaster.length || this.queueSecondary.length)) {
//       let queue
//       if (this.queueMaster.length) {
//         queue = this.queueMaster
//       } else if (this.queueSecondary.length) queue = this.queueSecondary
//       let lastItem = queue.pop()
//       if (lastItem.context.getters.objectGet(lastItem)) { // уже есть. Запрашивать не надо
//         this.destroyItem(lastItem)
//       } else {
//         itemsForQuery.push(lastItem)
//       }
//     }
//     // let getFromQueue = (queue, count) => {
//     //   let result = []
//     //   while (result.length < count && queue.length) {
//     //     let lastItem = queue.pop()
//     //     if (lastItem.context.getters.objectGet(lastItem)) {
//     //       this.destroyItem(lastItem)
//     //     } else result.push(lastItem)
//     //   }
//     //   return result
//     // }
//     // // берем последний элемент из queueMaster
//     // let itemsForQuery = [...getFromQueue(this.queueMaster, 5)]
//     // // добиваем до пяти из queueSecondary
//     // itemsForQuery.push(...getFromQueue(this.queueSecondary, 5 - itemsForQuery.length))
//
//     // очищаем то что осталось в очереди
//     this.queueMaster.forEach(item => {
//       this.destroyItem(item)
//     })
//     this.queueSecondary.forEach(item => {
//       this.destroyItem(item)
//     })
//     this.queueMaster = []
//     this.queueSecondary = []
//
//     if (itemsForQuery.length === 0) return
//
//     let fragmentNames = Array.from(new Set(itemsForQuery.map(item => item.fragmentName)))
//     context.commit('stateSet', ['queryInProgress', true])
//     apollo.clients.api.query({
//       query: gql`
//         ${fragmentNames.reduce((acc, item) => {
//             let fr = fragments[item]
//             return acc + fr.loc.source.body
//             }, '')
//           }
//         query objectFull ($oids: [OID!]!) {
//           objectList(oids: $oids) {
//             ${fragmentNames.reduce((acc, item) =>
//             acc + '\n...' + item, ''
//             )}
//           }
//         }
//       `,
//       variables: {
//         oids: itemsForQuery.map(item => item.oid)
//       },
//       fetchPolicy: 'network-only'
//     })
//     .then(result => {
//       let objectList = result.data.objectList
//       assert.ok(objectList.length === itemsForQuery.length)
//       for (let item of itemsForQuery) {
//         let object = objectList.find(obj => obj.oid === item.oid)
//         if (!object) object = { oid: item.oid, notFound: true }
//
//         context.commit('objectAdd', { object, fragmentName: item.fragmentName })
//         if (object.notFound) {
//           item.reject(`object not found on backend ${object.oid}`)
//         } else if (object.deletedAt) {
//           item.reject(`object was deleted ${object.oid}`)
//         } else {
//           item.resolve(object)
//         }
//         context.commit('stateSet', ['queryInProgress', false])
//       }
//       this.next(context)
//     })
//     .catch(err => {
//       for (let item of itemsForQuery) {
//         item.reject(err)
//       }
//       context.commit('stateSet', ['queryInProgress', false])
//     })
//   }
// }
//
// const queue = new Queue()

// класс заставляет apollo.cache периодически очищаться
class CacheControl {
  constructor () {
    this.queue = [] // список запрашиваемых сущностей в последнее время. В начале - самые старые
    this.keys = new Set() // дубль this.queue
    this.addRefCnt = 0
    this.querySubscriptions = {}
    this.noop = () => {
    }
  }

  set (context, objectFull, querySubscription) {
    logD('CacheControl::set start')
    assert(objectFull && querySubscription && objectFull.oid)
    context.commit('set', objectFull)
    this.querySubscriptions[objectFull.oid] = querySubscription
    return context.state.objects[objectFull.oid]
  }

  get (context, oid) {
    logD('CacheControl::get', oid)
    this.incRef(context, oid)
    return context.state.objects[oid]
  }

  incRef (context, oid) {
    this.addRefCnt++
    apollo.cache.retain(oid) // apollo.cache.gc() не тронет этот item
    if (this.keys.has(oid)) {
      let indx = this.queue.indexOf(oid)
      assert(indx >= 0)
      this.queue.splice(indx, 1)
    }
    this.keys.add(oid)
    this.queue.push(oid)
    // TODO заменить 11 на 1000 после тестирования
    if (this.addRefCnt % 11 === 0) { // тяжелая операция Вызываем иногда
      // TODO заменить 12 на 5000 после тестирования
      while (this.keys.length > 12) {
        let releasedOid = this.queue.shift()
        this.keys.delete(releasedOid)
        // обнуляем счетчик ссылок. apollo.cache.gc() теперь сможет удалить releasedOid
        while (apollo.cache.release(releasedOid)) this.noop()
      }
      let deletedKeys = apollo.cache.gc()
      logD('try evict cache entries', deletedKeys)
      for (let oid of deletedKeys) {
        if (this.querySubscriptions[oid]) {
          this.querySubscriptions[oid].unsubscribe()
        }
        delete context.state.objects[oid]
        delete this.querySubscriptions[oid]
      }
      logD('evict cache entries OK')
    }
  }
}

const cacheControl = new CacheControl()

// // Вернет объект из кэша, либо запросит его. и вернет промис, который возможно когда-то выполнится(когда дойдет очередь);
// // Если в данный момент какой-либо запрос уже выполняется, то поставит в очередь.
// // priority 0 - будут выполнены 20 последних запросов.
// // priority 1 - только если очередь priority 0 пуста. будут выполнены последние 4 запроса
// // fragmentName - определяет множество выводимых полей
// export const getOld = async (context, { oid, fragmentName, priority }) => {
//   logD('objects', 'objectGet start...')
//   // Если объект в кэше - взять из кэша
//   let object = context.getters.objectGet({ oid, fragmentName })
//   if (object) {
//     if (object.notFound) {
//       throw new Error(`object not found on backend ${object.oid}`)
//     } else if (object.deletedAt) {
//       throw new Error(`object was deleted ${object.oid}`)
//     } else {
//       return object
//     }
//   }
//   let promise = queue.push(context, oid, fragmentName, priority)
//   return await promise
// }

// запросит объект из кэша аполло. и сохранит его во вьюикс. (иначе имеем утечку. при каждом обращении создается соллбэк и новый объект(который не удаляется никогда поскольку на него есть ссылка в коллбэке).)
// реагирует на изменения объекта в кэше apollo и меняет клон из вьюикс (cacheControl.set)
// todo priority!!! ставить в очередь запрашивать пачкой! (после persist cache save)
export const get = async (context, { oid, fragmentName, priority }) => {
  logD('objects/get action start', oid)
  let cacheObject = cacheControl.get(context, oid)
  if (cacheObject) return cacheObject

  let promise = new Promise((resolve, reject) => {
    let querySubscription = apollo.clients.api.watchQuery({
      query: gql`
        ${fragments.objectFullFragment}
        query objectFull ($oid: OID!) {
          objectFull(oid: $oid) {
            ... objectFullFragment
          }
        }
      `,
      variables: { oid },
      fetchPolicy: 'cache-first'
    })
    let subs = querySubscription
    querySubscription.subscribe({
      next: ({ data }) => {
        logD('querySubscription.subscribe::next')
        assert(data && data.objectFull, data)
        if (context.state.objects[oid]) logD('object changed in apollo cache. try to change in local cache...', data.objectFull)
        let cacheObject = cacheControl.set(context, data.objectFull, querySubscription)
        resolve(cacheObject)
      },
      error: reject
    })
  })
  let objectFull = await promise
  logD('objects/get action complete', oid)
  return objectFull
}

// path ex: ['settings', 'general', 'language'] OR ['profile', 'gender']
export const update = async (context, { oid, path, value }) => {
  logD('objects/update action start', oid)
  if (path === 'profile.thumbUrl') {
    let file = value
    const toBase64 = file => new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = error => reject(error)
    })
    value = await toBase64(file)
  }

  context.commit('update', { oid, path, value }) // обновим в кэше
  // let p = path.split('.')
  // let object = JSON.parse(JSON.stringify(context.getters.get(oid))) || {oid, __typename: 'User'}
  // setValue(object, p, value)

  let { data: { objectChange } } = await apollo.clients.api.mutate({
    mutation: gql`
      ${fragments.objectFullFragment}
      mutation sw_network_only_objectChange ($oid: OID!, $path: String!, $value: RawJSON!) {
        objectChange (oid: $oid, path: $path, value: $value){
          ...objectFullFragment
        }
      }
    `,
    variables: { oid, path, value }
  })
  logD('objects/update action complete', oid)
  return objectChange
}
