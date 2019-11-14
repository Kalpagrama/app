import { apolloProvider } from 'boot/apollo'
import { fragments } from 'schema/index'
import assert from 'assert'

export const init = async (context) => {
  // if (context.getters.initialized) throw new Error('subscriptions state initialized already')
  if (context.getters.initialized) return
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
    return new Promise((resolve, reject) => {
      let queue
      if (priority === 0) queue = this.queueMaster
      else if (priority === 1) queue = this.queueSecondary
      assert.ok(queue)
      queue.push({ context, oid, fragmentName, resolve, reject })
      this.next()
    })
  }

  // вызывать при удалении из очереди
  destroyItem ({ context, oid, fragmentName, resolve, reject }) {
    let object = context.getters.objectGet({ oid, fragmentName })
    if (object) resolve(object)
    else reject('query was destroyed due out of date ')
  }

  // берет из очереди последний добавленный
  next () {
    let getFromQueue = (queue, count) => {
      let result = []
      while (result.length < count && this.queue.length) {
        let lastItem = queue.pop()
        if (lastItem.context.getters.objectGet(lastItem)) {
          this.destroyItem(lastItem)
          continue
        }
      }
      return result
    }

    // берем последний элемент из queueMaster
    let itemsForQuery = [...getFromQueue(this.queueMaster, 1)]
    // добиваем до пяти из queueSecondary
    itemsForQuery.push(...getFromQueue(this.queueSecondary, 5 - itemsForQuery.length))

    // очищаем то что осталось
    this.queueMaster.forEach(item => {
      this.destroyItem(item)
    })
    this.queueSecondary.forEach(item => {
      this.destroyItem(item)
    })
    this.queueMaster = []
    this.queueSecondary = []

    let fragmentName = 'nodeFragment'
    let fragment = fragments[fragmentName]
    assert.ok(fragment || !fragmentName)
    apolloProvider.clients.apiApollo.query({
      query: gql`
        ${fragment}
        query objectFull ($oids: [OID!]!) {
          objectList(oids: $oids) {
            ...${fragmentName}
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
        assert.ok(object)
        item.resolve(object)
      }
    })
    .catch(err => {
      for (let item of itemsForQuery) {
        item.reject(err)
      }
    })
  }
}

const queue = new Queue()

// Вернет объект из кэша, либо запросит его
// priority 0 - будут выполнен только последний запрос.
// priority 1 - только если очередь priority 0 пуста. будут выполнены последние 4 запроса
// fragmentName - определяет множество выводимых полей
export const get = async (context, { oid, fragmentName, priority }) => {
  context.dispatch('log/debug', ['objects', 'objecGet start...'], { root: true })

  // Если объект в кэше - взять из кэша
  let object = context.getters.objectGet({ oid, fragmentName })
  if (object) return object
  let promise = queue.push(context, oid, fragmentName, priority)
  return promise
}
// подсказка загрузчику в том, что скоро могут понадобиться эти ядра.
// По возможности эти ядра будут загружены. Последние запрошенные - в приоритете
export const objectsPreload = (store, oid) => {

}
