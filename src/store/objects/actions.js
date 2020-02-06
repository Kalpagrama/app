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
  context.commit('init')
  logD('objects/init done')
}

class Queue {
  constructor () {
    this.queueMaster = []
    this.queueSecondary = []
    this.queueWs = []
  }

  // вернет промис, который выполнится когда-то... (когда данные запросятся и вернутся)
  push (context, oid, priority, fromWs) {
    return new Promise((resolve, reject) => {
      let queue
      let queueMaxSz = 0
      if (fromWs) {
        queue = this.queueWs
        queueMaxSz = 888
      } else if (priority === 0) {
        queue = this.queueMaster
        queueMaxSz = 20
      } else if (priority === 1) {
        queue = this.queueSecondary
        queueMaxSz = 4
      }
      assert.ok(queue)
      queue.push({ context, oid, fromWs, resolve, reject })
      while (queue.length > queueMaxSz) {
        let firstItem = queue.shift()
        this.rejectItem(firstItem)
      }
      // ждем, параллельных вызовов(чтобы выполнить пачкой). Иначе, первый запрос пойдет отдельно, а остальные - пачкой
      wait(100).then(() => this.next(context)).catch(reject)
    })
  }

  // вызывать при удалении из очереди
  rejectItem ({ context, oid, fromWs, resolve, reject }) {
    reject('queued object was evicted legally')
  }

  // вызывать после получения объекта с сервера
  resolveItem (object) {
    assert(object && object.oid)
    const resolveObject = (queue, object) => {
      assert(queue && Array.isArray(queue))
      for (let { context, oid, fromWs, resolve, reject } of queue) {
        if (oid === object.oid) {
          let result = {
            item: object,
            actualAge: context.rootState.auth.userOid === oid ? 'day' : 'hour'
          }
          resolve(result)
        }
      }
      return queue.filter(item => item.oid !== object.oid)
    }
    this.queueWs = resolveObject(this.queueWs, object)
    this.queueMaster = resolveObject(this.queueMaster, object)
    this.queueSecondary = resolveObject(this.queueSecondary, object)
  }

  // берет из очереди последний добавленный и отправляет на выполненеие
  next (context) {
    // если предыдущий запрос еще выполняется, то подождем...
    if (context.getters.queryInProgress) return
    // извлечь из очереди сдедующие объекты для запроса на сервер. Проверяем на наличие
    let itemsForQuery = []
    let fromWs
    if (this.queueWs.length) { // запрашиваем сразу все элементы мастерской (одним запросом)
      fromWs = true
      itemsForQuery = [...this.queueWs]
    } else { // берем последние добавленные
      fromWs = false
      let totalQuery = [...this.queueSecondary, ...this.queueMaster]
      for (let i = totalQuery.length - 1; i >= 0 && itemsForQuery.length < 5; i--) {
        let queuedItem = totalQuery[i]
        if (itemsForQuery.findIndex(item => item.oid === queuedItem.oid) >= 0) continue // такой уже есть
        itemsForQuery.push(queuedItem)
      }
    }
    if (itemsForQuery.length === 0) return

    context.commit('stateSet', ['queryInProgress', true])

    apollo.clients.api.query({
      query: gql`
        ${fragments.objectFullFragment}
        query objectList ($oids: [OID!]!, $fromWs: Boolean) {
          objectList(oids: $oids, fromWs: $fromWs) {
            ... objectFullFragment
          }
        }
      `,
      variables: {
        oids: itemsForQuery.map(item => item.oid),
        fromWs
      }
    })
    .then(result => {
      let objectList = result.data.objectList
      for (let item of itemsForQuery) {
        let object = objectList.find(obj => obj.oid === item.oid)
        if (!object) object = { oid: item.oid, notFound: true }
        // объект был только что получен. надо его разрезолвить и удалить из всех очередей (кроме того он мог попасть дважды в одну и ту же очередь)
        this.resolveItem(object)
        context.commit('stateSet', ['queryInProgress', false])
      }
      this.next(context)
    })
    .catch(err => {
      logE('error on fetch objectList', err)
      for (let item of itemsForQuery) {
        let object = { oid: item.oid, fetchError: true }
        this.resolveItem(object)
      }
      context.commit('stateSet', ['queryInProgress', false])
    })
  }
}

const queue = new Queue()

// // Вернет объект из кэша, либо запросит его. и вернет промис, который возможно когда-то выполнится(когда дойдет очередь);
// // Если в данный момент какой-либо запрос уже выполняется, то поставит в очередь.
// // priority 0 - будут выполнены 20 последних запросов. Запрашиваются пачками по 5 штук. Последние запрошенные - в первую очередь
// // priority 1 - только если очередь priority 0 пуста. будут выполнены последние 4 запроса
// todo формировать очередь запросов (запрашивать пачкой)
export const get = async (context, { oid, priority, fromWs }) => {
  logD('objects/get action start', oid)
  const fetchItemFunc = async () => {
    // let promise = queue.push(context, oid, priority, fromWs)
    // return await promise
    let { data: { objectFull } } = await apollo.clients.api.query({
      query: gql`
        ${fragments.objectFullFragment}
        query objectFull ($oid: OID!, $fromWs: Boolean) {
          objectFull(oid: $oid, fromWs: $fromWs) {
            ... objectFullFragment
          }
        }
      `,
      variables: { oid, fromWs }
    })
    assert(context.rootState.auth.userOid)
    return {
      item: objectFull,
      actualAge: context.rootState.auth.userOid === oid ? 'day' : 'hour'
    }
  }
  let objectFull = await context.dispatch('cache/get', { key: oid, fetchItemFunc }, { root: true })
  logD('objects/get action complete', oid)
  return objectFull
}

// path ex: ['settings', 'general', 'language'] OR ['profile', 'gender']
export const update = async (context, { oid, path, newValue }) => {
  logD('objects/update action start', oid)
  if (path === 'profile.thumbUrl') {
    let file = newValue
    const toBase64 = file => new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = error => reject(error)
    })
    newValue = await toBase64(file)
  }

  context.commit('cache/updateItem', { key: oid, path, newValue }, { root: true }) // обновим в кэше
  let { data: { objectChange } } = await apollo.clients.api.mutate({
    mutation: gql`
      ${fragments.objectFullFragment}
      mutation sw_network_only_objectChange ($oid: OID!, $path: String!, $newValue: RawJSON!) {
        objectChange (oid: $oid, path: $path, newValue: $newValue){
          ...objectFullFragment
        }
      }
    `,
    variables: { oid, path, newValue }
  })
  logD('objects/update action complete', oid)
  return objectChange
}
