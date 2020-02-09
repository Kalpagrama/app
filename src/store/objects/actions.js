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

// сцепляет запросы и отправляет пачкой
class QueryAccumulator {
  constructor () {
    this.queueMaster = []
    this.queueSecondary = []
  }

  // вернет промис, который выполнится когда-то... (когда данные запросятся и вернутся)
  push (context, oid, priority) {
    assert(context && oid && priority >= 0, 'context && oid && priority')
    return new Promise((resolve, reject) => {
      let queue
      let queueMaxSz = 0
      if (priority === 0) {
        queue = this.queueMaster
        queueMaxSz = 20
      } else if (priority === 1) {
        queue = this.queueSecondary
        queueMaxSz = 4
      }
      assert(queue && queueMaxSz)
      if (queue.findIndex(item => item.oid === oid) === -1) {
        queue.push({ context, oid, resolve, reject })
      }
      while (queue.length > queueMaxSz) {
        let firstItem = queue.shift()
        let { context, oid, resolve, reject } = firstItem
        reject('queued object was evicted legally')
      }
      // ждем, параллельных вызовов(чтобы выполнить пачкой). Иначе, первый запрос пойдет отдельно, а остальные - пачкой
      wait(100).then(() => this.next(context)).catch(reject)
    })
  }

  // вызывать после получения объекта с сервера. разрезолвит объект во всех очередях
  resolveItem (object) {
    assert(object && object.oid)
    const resolveObject = (queue, object) => {
      assert(queue && Array.isArray(queue))
      for (let { context, oid, resolve, reject } of queue) {
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
    this.queueMaster = resolveObject(this.queueMaster, object)
    this.queueSecondary = resolveObject(this.queueSecondary, object)
  }

  rejectItem (oid, err) {
    assert(oid && err)
    const rejectObject = (queue, objOid, err) => {
      assert(queue && Array.isArray(queue))
      for (let { context, oid, resolve, reject } of queue) {
        if (oid === objOid) {
          reject(err)
        }
      }
      return queue.filter(item => item.oid !== objOid)
    }
    this.queueMaster = rejectObject(this.queueMaster, oid, err)
    this.queueSecondary = rejectObject(this.queueSecondary, oid, err)
  }

  // берет из очереди последний добавленный и отправляет на выполненеие
  next (context) {
    // если предыдущий запрос еще выполняется, то подождем...
    if (context.rootState.objects.queryInProgress) return
    // извлечь из очереди сдедующие объекты для запроса на сервер. Проверяем на наличие
    let itemsForQuery = [] // элементы для следующего запроса
    let totalQuery = [] // элементы из всех очередей (самые приоритетные - в конце)
    for (let itemSec of this.queueSecondary) {
      if (totalQuery.findIndex(item => item.oid === itemSec.oid) === -1) totalQuery.push(itemSec)
    }
    for (let itemMas of this.queueMaster) {
      if (totalQuery.findIndex(item => item.oid === itemMas.oid) === -1) totalQuery.push(itemMas)
    }
    // берем последние добавленные (самые приоритетные - в конце)
    for (let i = totalQuery.length - 1; i >= 0 && itemsForQuery.length < 5; i--) {
      let queuedItem = totalQuery[i]
      if (itemsForQuery.findIndex(item => item.oid === queuedItem.oid) >= 0) continue // такой уже есть
      itemsForQuery.push(queuedItem)
    }
    if (itemsForQuery.length === 0) return

    context.commit('objects/stateSet', ['queryInProgress', true], { root: true }) // Не более одного запроса в единицу времени

    apollo.clients.api.query({
      query: gql`
        ${fragments.objectFullFragment}
        query objectList ($oids: [OID!]!) {
          objectList(oids: $oids) {
            ... objectFullFragment
          }
        }
      `,
      variables: {
        oids: itemsForQuery.map(item => item.oid)
      }
    })
    .then(result => {
      context.commit('objects/stateSet', ['queryInProgress', false], { root: true })
      let objectList = result.data.objectList
      for (let item of itemsForQuery) {
        let object = objectList.find(obj => obj.oid === item.oid)
        // объект был только что получен. надо его разрезолвить и удалить из всех очередей (кроме того он мог попасть дважды в одну и ту же очередь)
        if (object && !object.deletedAt) {
          this.resolveItem(object)
        } else if (object && !object.deletedAt) {
          this.rejectItem(item.oid, 'deleted')
        } else {
          this.rejectItem(item.oid, 'notFound')
        }
      }
      this.next(context)
    })
    .catch(err => {
      context.commit('objects/stateSet', ['queryInProgress', false], { root: true })
      logE('error on fetch objectList', err)
      for (let item of itemsForQuery) this.rejectItem(item.oid, 'fetchError')
    })
  }
}

const queryAccumulator = new QueryAccumulator()

// Вернет объект из кэша, либо запросит его. и вернет промис, который возможно когда-то выполнится(когда дойдет очередь);
// Если в данный момент какой-либо запрос уже выполняется, то поставит в очередь.
// priority 0 - будут выполнены 20 последних запросов. Запрашиваются пачками по 5 штук. Последние запрошенные - в первую очередь
// priority 1 - только если очередь priority 0 пуста. будут выполнены последние 4 запроса
export const get = async (context, { oid, priority }) => {
  logD('objects/get action start', { oid, priority })
  priority = priority || 0
  const fetchItemFunc = async () => {
    let promise = queryAccumulator.push(context, oid, priority)
    return await promise
  }
  let objectFull = await context.dispatch('cache/get', { key: oid, fetchItemFunc }, { root: true })
  logD('objects/get action complete', oid)
  return objectFull
}

// моментально изменит объект во вьюикс и запланирует изменения на сервере
export const update = async (context, { oid, path, newValue, setter, actualAge }) => {
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
  let updateItemFunc = async (updatedItem) => {
    assert(updatedItem.oid && updatedItem.revision)
    assert(oid && path != null && newValue)
    let { data: { objectChange } } = await apollo.clients.api.mutate({
      mutation: gql`
        ${fragments.objectFullFragment}
        mutation sw_network_only_objectChange ($oid: OID!, $path: String!, $newValue: RawJSON!, $revision: Int!) {
          objectChange (oid: $oid, path: $path, newValue: $newValue, revision: $revision){
            ...objectFullFragment
          }
        }
      `,
      variables: { oid, path, newValue, revision: updatedItem.revision }
    })
    return objectChange
  }
  let fetchItemFunc = async () => {
    let item = await context.dispatch('objects/get', { oid, priority: 0 }, { root: true })
    return item
  }
  let mergeItemFunc = (path, serverItem, cacheItem) => {
    assert(serverItem && cacheItem)
    let mergedItem
    if (path) {
      // todo merge or throw error
    } else {
      // todo merge or throw error
    }
    assert(mergedItem, 'надо вернуть либо смердженный объект, либо исключение')
    return mergedItem
  }
  let updatedItem = await context.dispatch('cache/update', {
    key: oid,
    path,
    newValue,
    setter,
    actualAge,
    updateItemFunc,
    fetchItemFunc,
    mergeItemFunc
  }, {root: true})
  logD('objects/update action complete', oid)
  return updatedItem
}
