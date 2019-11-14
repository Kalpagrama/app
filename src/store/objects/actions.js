import { apolloProvider } from 'boot/apollo'
import { fragments } from 'schema/index'
import assert from 'assert'

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))
export const init = async (context) => {
  // if (context.state.initialized) throw new Error('subscriptions state initialized already')
  if (context.state.initialized) return
  context.dispatch('log/debug', ['objects', 'init'], { root: true })
  context.commit('init')
}

class Queue {
  constructor () {
    this.queueMaster = []
    this.queueSecondary = []
  }

  // вернет промис, который выполнится когда-то... (когда данные запросятся и вернутся)
  push (context, oid, fragmentName, priority) {
    return new Promise(async (resolve, reject) => {
      let queue
      let queueMaxSz = 0
      if (priority === 0) {
        queue = this.queueMaster
        queueMaxSz = 20
      } else if (priority === 1) {
        queue = this.queueSecondary
        queueMaxSz = 4
      }
      assert.ok(queue)
      queue.push({ context, oid, fragmentName, resolve, reject })
      while (queue.length > queueMaxSz) {
        let firstItem = queue.shift()
        this.destroyItem(firstItem)
      }
      await wait(100) // ждем, параллельных вызовов(чтобы выполнить пачкой)
      this.next(context)
    })
  }

  // вызывать при удалении из очереди
  destroyItem ({ context, oid, fragmentName, resolve, reject }) {
    let object = context.getters.objectGet({ oid, fragmentName })
    if (object) resolve(object)
    else reject('queued object was destroyed due out of date ')
  }

  // берет из очереди последний добавленный и отправляет на выполненеие
  next (context) {
    // если предыдущий запрос еще выполняется, то подождем...
    if (context.getters.queryInProgress) return
    // извлечь из очереди сдедующие объекты для запроса на сервер. Проверяем на наличие
    let itemsForQuery = []
    while (itemsForQuery.length < 5 && (this.queueMaster.length || this.queueSecondary.length)) {
      let queue
      if (this.queueMaster.length) queue = this.queueMaster
      else if (this.queueSecondary.length) queue = this.queueSecondary
      let lastItem = queue.pop()
      if (lastItem.context.getters.objectGet(lastItem)) { // уже есть. Запрашивать не надо
        this.destroyItem(lastItem)
      } else itemsForQuery.push(lastItem)
    }
    // let getFromQueue = (queue, count) => {
    //   let result = []
    //   while (result.length < count && queue.length) {
    //     let lastItem = queue.pop()
    //     if (lastItem.context.getters.objectGet(lastItem)) {
    //       this.destroyItem(lastItem)
    //     } else result.push(lastItem)
    //   }
    //   return result
    // }
    // // берем последний элемент из queueMaster
    // let itemsForQuery = [...getFromQueue(this.queueMaster, 5)]
    // // добиваем до пяти из queueSecondary
    // itemsForQuery.push(...getFromQueue(this.queueSecondary, 5 - itemsForQuery.length))

    // очищаем то что осталось в очереди
    this.queueMaster.forEach(item => {
      this.destroyItem(item)
    })
    this.queueSecondary.forEach(item => {
      this.destroyItem(item)
    })
    this.queueMaster = []
    this.queueSecondary = []

    if (itemsForQuery.length === 0) return

    let fragmentNames = Array.from(new Set(itemsForQuery.map(item => item.fragmentName)))
    context.commit('stateSet', ['queryInProgress', true])
    apolloProvider.clients.apiApollo.query({
      query: gql`
        ${fragmentNames.reduce((acc, item) => {
            let fr = fragments[item]
            return acc + fr.loc.source.body
            }, '')
          }
        query objectFull ($oids: [OID!]!) {
          objectList(oids: $oids) {
            ${fragmentNames.reduce((acc, item) =>
            acc + '\n...' + item, ''
            )}
          }
        }
      `,
      variables: {
        oids: itemsForQuery.map(item => item.oid)
      },
      fetchPolicy: 'network-only'
    })
    .then(result => {
      let objectList = result.data.objectList
      assert.ok(objectList.length === itemsForQuery.length)
      for (let item of itemsForQuery) {
        let object = objectList.find(obj => obj.oid === item.oid)
        if (!object) object = { oid: item.oid, notFound: true }

        context.commit('objectAdd', { object, fragmentName: item.fragmentName })
        if (object.notFound) item.reject(`object not found on backend ${object.oid}`)
        else item.resolve(object)
        context.commit('stateSet', ['queryInProgress', false])
      }
      this.next(context)
    })
    .catch(err => {
      for (let item of itemsForQuery) {
        item.reject(err)
      }
      context.commit('stateSet', ['queryInProgress', false])
    })
  }
}

const queue = new Queue()

// Вернет объект из кэша, либо запросит его. Если в данный момент какой-либо запрос уже выполняется, то поставит в очередь.
// priority 0 - будут выполнены 20 последних запросов.
// priority 1 - только если очередь priority 0 пуста. будут выполнены последние 4 запроса
// fragmentName - определяет множество выводимых полей
export const get = async (context, { oid, fragmentName, priority }) => {
  context.dispatch('log/debug', ['objects', 'objectGet start...'], { root: true })
  // Если объект в кэше - взять из кэша
  let object = context.getters.objectGet({ oid, fragmentName })
  if (object) {
    if (object.notFound) throw new Error(`object not found on backend ${object.oid}`)
    else return object
  }
  let promise = queue.push(context, oid, fragmentName, priority)
  return promise
}
