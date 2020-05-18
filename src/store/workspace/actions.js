import { apollo } from 'src/boot/apollo'
import { fragments } from 'src/schema/index'
import assert from 'assert'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
import { clearCache } from 'src/system/services'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.VUEX_WS)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.VUEX_WS)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.VUEX_WS)
const WsItemTypeEnum = Object.freeze({
  NODE: 'NODE',
  CONTENT_WITH_NOTES: 'CONTENT_WITH_NOTES',
  CHAIN: 'CHAIN',
  SPHERE: 'SPHERE'
})
const WsCollectionEnum = Object.freeze({
  NODE_LIST: 'NODE_LIST',
  CONTENT_LIST: 'CONTENT_LIST',
  CHAIN_LIST: 'CHAIN_LIST',
  SPHERE_LIST: 'SPHERE_LIST'
})
const OperationEnum = Object.freeze({ UPSERT: 'UPSERT', DELETE: 'DELETE' })

function getCollection (wsItemType) {
  switch (wsItemType) {
    case WsItemTypeEnum.NODE:
      return WsCollectionEnum.NODE_LIST
    case WsItemTypeEnum.CONTENT_WITH_NOTES:
      return WsCollectionEnum.CONTENT_LIST
    case WsItemTypeEnum.SPHERE:
      return WsCollectionEnum.SPHERE_LIST
    case WsItemTypeEnum.CHAIN:
      return WsCollectionEnum.CHAIN_LIST
    default:
      assert(false, 'bad wsItemType:' + wsItemType)
  }
}

function makeListWsKey (collection, filterFunc = null, sortFunc = null) {
  assert(collection)
  let filterFuncStr = filterFunc ? filterFunc.toString() : ''
  let sortFuncStr = sortFunc ? sortFunc.toString() : ''
  assert(!filterFuncStr.includes('::'), 'filterFuncStr.includes ::')
  assert(!sortFuncStr.includes('::'), 'sortFuncStr.includes ::')
  return `listWS::${collection}::${filterFuncStr}::${sortFuncStr}`
}

function makeWsItemKey (wsItemType) {
  assert(wsItemType in WsItemTypeEnum, 'bad wsItemType: ' + wsItemType)
  return 'WS::' + wsItemType + '::' + Date.now()
}

function getItemTypeFromKey (wsItemKey) {
  let values = wsItemKey.split('::')
  assert(values.length === 3)
  return values[1]
}

/*!
 * WsLocal класс для работы с изменениями мастерской offline
 * Мастерская полностью на клиенте. Репликация с сервером - в фоне
 * Данные хранятся в виде списков "wsList::collection::filterFunc::sortFunc". Список - массив из wsItemKey (аналог oid, но генерится клиентом)
 * Сами объекты - хранятся по отдельности. Ключ: 'WS::' + wsItemType + '::' + Date.now()
 * При изменении данных - они добавляются в список wsLocalChanges. Взводится operation (UPSERT/DELETE).
 * wsLocalChanges: {wsItemKey: { item, operation, itemSent, operationSent }} - хранится в кэше вечно (как и юзер)
 * При получении данных - к полученным данным подмешивается wsLocalChanges
 * При получении ответа сервера - itemSent и operationSent очищается. если operation не взведен(все изменения сохранены) - вся запись удаляется
 * Если при старте мастерской есть отправленные данные, для которых не получен ответ - они отправляются еще раз
 */
class WsLocal {
  async init (context) {
    this.context = context
    // очищаем инфу о начатых отправлениях. Позже будет предпринята попытка повторно отправить данные (на основе item и operation)
    await this.updateLocalChanges(value => {
      if (Object.keys(value).length) logD('Обнаружены несохраненные изменения!')
      for (let wsItemKey in value) {
        assert(value[wsItemKey].item, '!item') // тут должна лежать последняя локальная версия
        value[wsItemKey].operation = value[wsItemKey].operation || value[wsItemKey].operationSent // operation - при отправке очищается
        delete value[wsItemKey].itemSent
        delete value[wsItemKey].operationSent
      }
      return value
    })
    await this.sendAllChanges()
  }

  // обновить версию локальной мастерской (по результатам обработки эвентов). пришедшая ревизия должна быть строго на 1 больше текущей
  async updateWsRevision (wsRevisionServer) {
    assert(this.context.rootGetters.currentUser, '!currentUser') // currentUser обязан быть в кэше!
    let wsRevisionLocal = this.context.rootGetters.currentUser.wsRevision
    if (wsRevisionLocal !== wsRevisionServer - 1) { // версия мастерской отстала от сервера
      logE('версия мастерской отстала от сервера! инвалидируем данные мастерской!', wsRevisionLocal, wsRevisionServer) // todo logW
      for (let { key, collection, listFilterFunc, listSortFunc } of this.getWsLists()) {
        await this.context.dispatch('cache/expire', key, { root: true })
      }
    }
    await this.context.dispatch('cache/update', {
      key: this.context.rootGetters.currentUser.oid,
      path: 'wsRevision',
      newValue: wsRevisionServer
    }, { root: true })
  }

  // изменить локальные изменения
  async updateLocalChanges (setter) {
    assert(setter, '!setter')
    await this.context.dispatch('cache/update', { key: 'wsLocalChanges', setter, defaultValue: {} }, { root: true })
  }

  // вернет все ключи для всех списков, в которых может быть item
  getWsListsForItem (item) {
    let collection = getCollection(item.wsItemType)
    let result = []
    for (let key in this.context.rootState.cache.cachedItems) {
      if (!key.startsWith('listWS::')) continue
      let keyEntries = key.split('::')
      assert(keyEntries.length === 4, 'keyItems.length === 4')
      let listCollection = keyEntries[1]
      // eslint-disable-next-line no-new-func
      let listFilterFunc = keyEntries[2] ? new Function('return ' + keyEntries[2])() : null
      // eslint-disable-next-line no-new-func
      let listSortFunc = keyEntries[3] ? new Function('return ' + keyEntries[3])() : null
      if (listCollection !== collection) continue
      if (listFilterFunc && !listFilterFunc(item)) continue
      // в этом списке МОЖЕТ находится нужный item!
      result.push({ key, collection, listFilterFunc, listSortFunc })
    }
    return result
  }

  // вернет все ключи для всех списков этой коллекции
  getWsListsForCollection (collection) {
    let result = []
    for (let key in this.context.rootState.cache.cachedItems) {
      if (!key.startsWith('listWS::')) continue
      let keyEntries = key.split('::')
      assert(keyEntries.length === 4, 'keyItems.length === 4')
      let listCollection = keyEntries[1]
      // eslint-disable-next-line no-new-func
      let listFilterFunc = keyEntries[2] ? new Function('return ' + keyEntries[2])() : null
      // eslint-disable-next-line no-new-func
      let listSortFunc = keyEntries[3] ? new Function('return ' + keyEntries[3])() : null
      if (listCollection !== collection) continue
      result.push({ key, collection, listFilterFunc, listSortFunc })
    }
    return result
  }

  // вернет все ключи для всех списков мастерской
  getWsLists () {
    let result = []
    for (let key in this.context.rootState.cache.cachedItems) {
      if (!key.startsWith('listWS::')) continue
      let keyEntries = key.split('::')
      assert(keyEntries.length === 4, 'keyItems.length === 4')
      let listCollection = keyEntries[1]
      // eslint-disable-next-line no-new-func
      let listFilterFunc = keyEntries[2] ? new Function('return ' + keyEntries[2])() : null
      // eslint-disable-next-line no-new-func
      let listSortFunc = keyEntries[3] ? new Function('return ' + keyEntries[3])() : null
      result.push({ key, collection: listCollection, listFilterFunc, listSortFunc })
    }
    return result
  }

  // вернет полные элементы из кэша, либо с сервера(при этом - подмешает к ним wsLocalChanges. сохранит список отдельно от элементов. обновит все фильтрованные списки)
  async getItems (collection, filterFunc, sortFunc) {
    assert(collection in WsCollectionEnum, 'bad collection' + collection)
    const fetchItemFunc = async () => {
      const fetchItemFunc = async () => {
        let { data: { wsItems: { items, count, totalCount, nextPageToken } } } = await apollo.clients.api.query({
          query: gql`
            query wsItems ( $collection: WsCollectionEnum!){
              wsItems (collection: $collection) {
                totalCount
                count
                nextPageToken
                items
              }
            }
          `,
          variables: { collection }
        })
        // подмешиваем несохраненную информацию (хранится локально)
        assert(this.context.rootState.cache.cachedItems.wsLocalChanges, '!wsLocalChanges')
        for (let wsItemKey in this.context.rootState.cache.cachedItems.wsLocalChanges) {
          let { item, operation, itemSent, operationSent } = this.context.rootState.cache.cachedItems.wsLocalChanges[wsItemKey]
          let indx = items.findIndex(itemFromServer => item.wsItemKey === itemFromServer.wsItemKey)
          if (operation) {
            if (indx >= 0 && operation === OperationEnum.UPSERT) {
              items[indx] = item
            }// заменяем
            else if (indx >= 0 && operation === OperationEnum.DELETE) {
              items.splice(indx, 1)
            }// удаляем
            else if (indx === -1 && operation === OperationEnum.UPSERT) items.push(item) // добавляем
          }
        }
        // заново набиваем фильтрованные списки в соответствии с listFilterFunc и listSortFunc
        for (let { key, listFilterFunc, listSortFunc } of this.getWsListsForCollection(collection)) {
          let list = []
          if (listFilterFunc) list = items.filter(filterFunc)
          if (listSortFunc) list.sort(listSortFunc)
          await this.context.dispatch('cache/update', { key, newValue: list }, { root: true })
        }
        // сохраняем элементы в кэше отдельно от списков
        for (let item of items) {
          assert(item.wsItemKey, '!wsItemKey')
          await this.context.dispatch('cache/update', {
            key: item.wsItemKey,
            newValue: item
          }, { root: true })
        }
        return {
          item: items.map(item => item.wsItemKey),
          actualAge: 'day'
        }
      }
      // 1. получить ВСЕ данные с сервера (itemsAll - массив из wsItemKey)
      let itemsAll = await this.context.dispatch('cache/get', {
        key: makeListWsKey(collection), fetchItemFunc
      }, { root: true })
      logD('wsItems get complete')
      // 2. сделать копию. отфильтровать и отсортировать
      let items = [...itemsAll]
      let fullItems = {} // тут лежат полные объекты
      for (let wsItemKey of items) fullItems[wsItemKey] = await this.getItem(wsItemKey)
      if (filterFunc) {
        let filterFuncWrap = (wsItemKey) => fullItems[wsItemKey] ? filterFunc(fullItems[wsItemKey]) : false
        items = items.filer(filterFuncWrap)
      }
      if (sortFunc) {
        let sortFuncWrap = (wsItemKeyLeft, wsItemKeyRight) => fullItems[wsItemKeyLeft] ? sortFunc(fullItems[wsItemKeyLeft], wsItemKeyRight) : 0
        items.sort(sortFuncWrap)
      }
      return {
        item: items.map(wsItemKey => fullItems[wsItemKey]),
        actualAge: 'day'
      }
    }
    let items = await this.context.dispatch('cache/get',
      { key: makeListWsKey(collection, filterFunc, sortFunc), fetchItemFunc }, { root: true })
    return items
  }

  // вернет элемент мастерской(хранится отдельно от списка)
  async getItem (wsItemKey) {
    assert(wsItemKey, 'wsItemKey!')
    let wsItemType = getItemTypeFromKey(wsItemKey)
    let collection = getCollection(wsItemType)
    const fetchItemFunc = async () => {
      // expire (для того чтобы данные заново запросились c сервера и обновились)
      await this.context.dispatch('cache/expire', { key: makeListWsKey(collection) }, { root: true })
      await this.getItems(collection) // перезапросит все итемы с сервера (из-за expire)
      return {
        item: this.context.rootState.cache.cachedItems[wsItemKey],
        actualAge: 'day'
      }
    }
    let item = await this.context.dispatch('cache/get', { key: wsItemKey, fetchItemFunc }, { root: true })
    return item
  }

  // изменить элемент в мастерской. Если externalChange не наши изменения (пришли из другого клиетна)! (Нужно в processEvent)
  async changeItem (item, operation, externalChange = false) {
    item = JSON.parse(JSON.stringify(item)) // нельзя чтобы передынный итем стал реактивным!
    assert(item && operation in OperationEnum, 'bad params' + operation + JSON.stringify(item))
    assert(item.wsItemKey && item.wsItemType in WsItemTypeEnum, 'bad item' + JSON.stringify(item))
    assert(getItemTypeFromKey(item.wsItemKey) === item.wsItemType, 'bad item' + JSON.stringify(item))
    let updateItemFunc = async (updatedItem) => {
      let { data: { wsItemUpsert, wsItemDelete } } = await apollo.clients.api.mutate({
        mutation: operation === OperationEnum.UPSERT
          ? gql`mutation wsItemUpsert($item: RawJSON!) {
                  wsItemUpsert (item: $item)
                }`
          : gql`
                  mutation wsItemDelete($item: RawJSON!) {
                    wsItemDelete (item: $item)
                  }`,
        variables: { item: updatedItem }
      })
      return { item: wsItemUpsert || wsItemDelete, actualAge: 'day' } // wsItemDelete вернет boolean
    }
    let fetchItemFunc = async () => {
      let itemFetched = await this.getItem(item.wsItemKey) // getItem возмет с кэша, либо запросит с сервера
      return { item: itemFetched, actualAge: 'day' }
    }
    let mergeItemFunc = (serverItem, cacheItem) => {
      assert(serverItem && cacheItem)
      let mergedItem
      // берем значение с сервера
      mergedItem = serverItem
      assert(mergedItem, 'надо вернуть либо смердженный объект, либо исключение')
      return mergedItem
    }
    let updateInProgress = false // данные по этому item отправлены на сервер и ответ еще не получен
    // Изменить wsLocalChanges. По приходу эвента - привести wsLocalChanges в исходное сосотояние (см processEvent)
    if (!externalChange) { // запоминаем локальные изменеия только если сделали их сами
      await this.updateLocalChanges(value => {
        let itemLocalChanges = value[item.wsItemKey] || {}
        if (itemLocalChanges.item) { // если это не первое сохранение этого item
          if (itemLocalChanges.operation === OperationEnum.DELETE && operation === OperationEnum.UPSERT) assert(false, 'cant update deleted item!') // нельзя менять уже удаленый item
          assert(itemLocalChanges.operationSent !== OperationEnum.DELETE, 'item delete sent before!') // нельзя менять или удалять уже удаленый item
          if (itemLocalChanges.itemSent) updateInProgress = true // данные по этому item ушли на сервер, но ответа еще не было...
        }
        itemLocalChanges.item = item // тут самые последние изменения
        itemLocalChanges.operation = operation // последняя сделанная операция
        if (!updateInProgress) { // при отправке - запоминаем то что отправили
          itemLocalChanges.itemSent = JSON.parse(JSON.stringify(item)) // последняя отправленная версия данных
          itemLocalChanges.operationSent = itemLocalChanges.operation // последняя отправленная операция
          delete itemLocalChanges.operation // неотправленных изменений пока что нет
        }
        value[item.wsItemKey] = itemLocalChanges
        return value
      })
    }
    // данные запишутся в кэш и В ФОНЕ отправятся на сервер(если это наши измения и нет незавршенных измениий этого item)
    let updatedItem = await this.context.dispatch('cache/update', {
      key: item.wsItemKey,
      newValue: item,
      updateItemFunc: !updateInProgress && !externalChange ? updateItemFunc : null,
      fetchItemFunc: !updateInProgress && !externalChange ? fetchItemFunc : null,
      mergeItemFunc: !updateInProgress && !externalChange ? mergeItemFunc : null,
      debounceMsec: 4000 // ждем 4 секунды. Если за это время изменений больше не будет - они уйдут на сервер
    }, { root: true })
    // поправить все списки (удалить элемент из всех списков, а затем вставить на новое место)
    let collectionItems = await this.getItems(getCollection(item.wsItemType)) // полный перечень элементов этой коллекции
    let collectionItemsMap = {}
    for (let wsItem of collectionItems) collectionItemsMap[wsItem.wsItemKey] = wsItem
    // todo проверить, что такой способ (удалить элемент из всех списков, а затем вставить на новое место) не вызовет перерисовку списка на экране при каждом измении элемента!
    for (let { key, collection, listFilterFunc, listSortFunc } of this.getWsListsForItem(item)) {
      await this.context.dispatch('cache/update', {
        key: key,
        path: '',
        setter: listItems => {
          assert(listItems && Array.isArray(listItems))
          let indx = listItems.findIndex(listItem => listItem.wsItemKey === item.wsItemKey)
          if (indx >= 0) listItems.splice(indx, 1) // удаляем элемент. используем splice для реактивности
          if (operation === OperationEnum.UPSERT) { // вставляем на нужные места
            if (!listFilterFunc || listFilterFunc(item)) { // список подходит
              let insertPos = 0
              if (listSortFunc) {
                for (let i = 0; i < listItems.length; i++) {
                  if (!collectionItemsMap[listItems[i]] || listSortFunc(item, collectionItemsMap[listItems[i]]) <= 0) { // если item <= value.items[i]
                    insertPos = i // вставляем в эту позицию
                    break
                  }
                }
              }
              listItems.splice(insertPos, 0, item)
            }
          }
          return listItems
        }
      }, { root: true })
    }
    return updatedItem
  }

  async processEvent (event) {
    logD('Получили WsEvent')
    let { type, wsItem: itemServer, wsRevision } = event
    assert(itemServer.oid && itemServer.name != null && itemServer.wsItemKey, 'assert itemServer !check')
    assert(type === 'WS_ITEM_CREATED' || type === 'WS_ITEM_DELETED' || type === 'WS_ITEM_UPDATED', 'bad ev type')
    assert(itemServer.revision, '!itemServer.revision')
    // обновим wsLocalChanges
    await this.updateLocalChanges(value => {
      let itemLocalChanges = value[itemServer.wsItemKey]
      if (itemLocalChanges) { // у нас были изменения этого item!
        if (itemLocalChanges.itemSent && (!itemLocalChanges.itemSent.revision || itemLocalChanges.itemSent.revision === itemServer.revision - 1)) {
          // все ок. Мы изменили данные - они поменялись на сервере и к нам прилетело подтверждение
          logD('Мы меняли данные и получили подтверждение. Все ОК!')
          if (!itemLocalChanges.operation) { // локальных изменений больше сделано не было. удаляем весь объект
            logD('больше изменеий по этом item - нет')
            delete value[itemServer.wsItemKey]
          } else { // пока изменения сохранялись на сервере - юзер что-то сделал еще. отправим изменения позже (sendAllChanges)
            logD('Пока данные менялись на сервере - были сделаны еще изменения этого item')
            delete itemLocalChanges.itemSent
            delete itemLocalChanges.operationSent
          }
        } else { // проблема! мы изменяли данные. Но ответ от сервера - ответ НЕ НА НАШИ изменения (либо мы вообще еще не успели ничего отправить)
          // Есть несохраненные данные! по всей видимости данные изменены из другого клиента
          logE(`Мы меняли данные. Но параллельно данные изменены из другого клиента! 
            itemServer.revision=${itemServer.revision} 
            existingChanges=${itemLocalChanges}`)
          // ничего не поделать - удаляем локальные изменения, принимаем версию сервера. На сервер не шлем(sendToServer = false).
          delete value[itemServer.wsItemKey]
          this.changeItem(itemServer, type === 'WS_ITEM_DELETED' ? OperationEnum.DELETE : OperationEnum.UPSERT, true)
        }
      } else {
        // мы ничего не меняли. применяем ко всем спискам!
        // Действие совершено не из этого клиента? (например, приложение открыто одновременно на ПК и в телефоне)
        // меняем локально в кэше. На сервер не шлем(sendToServer = false).
        logD('Мы ничего не меняли. Данные были изменены из другого клиента')
        this.changeItem(itemServer, type === 'WS_ITEM_DELETED' ? OperationEnum.DELETE : OperationEnum.UPSERT, true) // setter не может быть async. выполняем в фоне
      }
      return value
    })
    await this.updateWsRevision(wsRevision) // обновим ревизию мастерской
    await this.sendAllChanges() // отправим неотправленное
  }

  // обойти все wsLocalChanges и отправить неотправленные
  async sendAllChanges () {
    logD('Пытаемся отправить на сервер все локальные изменения')
    let cnt = 0
    for (let wsItemKey in this.context.rootState.cache.cachedItems.wsLocalChanges) {
      let { item, operation, itemSent, operationSent } = this.context.rootState.cache.cachedItems.wsLocalChanges[wsItemKey]
      if (operation && !itemSent) { // есть неотправленные изменения
        cnt++
        await this.changeItem(item, operation)
      }
    }
    if (cnt) {
      logD('все локальные изменения сохранены.', cnt)
    } else {
      logD('локальных измений нет.')
    }
  }
}

const wsLocal = new WsLocal()
export const init = async (context) => {
  // logD('userWorkspace init')
  await wsLocal.init(context)
  context.commit('init')
  return true
}

// атавизм. Этот метод не нужен, тк wsItems возвращает полные сущности
export const wsItem = async (context, wsItemKey) => {
  logW('method workspace/wsItem is deprecated! use wsItems instead!', wsItemKey)
  return await wsLocal.getItem(wsItemKey)
}
// получить списки из мастерской (содержит полные элементы)
export const wsItems = async (context, { collection, filterFunc, sortFunc }) => {
  let items = await wsLocal.getItems(collection, filterFunc, sortFunc)
  return { items, count: items.length, totalCount: items.length, nextPageToken: null }
}
export const wsItemUpsert = async (context, item) => {
  if (!item.wsItemKey) item.wsItemKey = makeWsItemKey(item.wsItemType) // генерируем wsItemKey для нового элемента
  return await wsLocal.changeItem(item, OperationEnum.UPSERT)
}
export const wsItemDelete = async (context, item) => {
  await wsLocal.changeItem(item, OperationEnum.DELETE)
}
// очистить мастерскую на сервере
export const wsClear = async (context) => {
  logD('wsClear start')
  let { data: { wsClear } } = await apollo.clients.api.mutate({
    mutation: gql`
      mutation wsClear {
        wsClear
      }
    `
  })
  await clearCache()
  await window.location.reload()
  logD('wsClear done', wsClear)
  return wsClear
}
//  (прилетел эвент WS_ITEM_CREATED/WS_ITEM_DELETED/WS_ITEM_UPDATED) обновим wsLocalChanges
export const processEvent = async (context, event) => {
  await wsLocal.processEvent(event)
}
