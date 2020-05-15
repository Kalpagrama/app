import { apollo } from 'src/boot/apollo'
import { fragments } from 'src/schema/index'
import assert from 'assert'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
import { denormalizeWSItem, normalizeWSItem } from 'src/store/workspace/index'
import { clearCache } from 'src/system/services'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.VUEX_WS)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.VUEX_WS)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.VUEX_WS)

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))

/*!
 * модуль для мастерской
 * Мастерская полностью на клиенте. Репликация с сервером - по возможности
 * При изменении данных - они добавляются в список wsUnsavedChanges. Взводится offlineStatus.
 * При отправке данных - делается копия (sentOutCopy) и очищается offlineStatus
 * При получении ответа сервера - sentOutCopy очищается
 * т.о изменные данные хранятся одновременно и в списках и в wsUnsavedChanges. При получении данных с сервера к ним подмешивается wsUnsavedChanges
 * Если при старе мастерской есть отправленные данные, для которых не получен ответ - они отправляются еще раз
 */

export const init = async (context) => {
  if (context.state.initialized) return
  logD('userWorkspace init')
  // инициализация wsUnsavedChanges
  await context.dispatch('cache/update', {
    key: 'wsUnsavedChanges',
    path: '',
    setter: (value) => {
      value = value || {}
      for (let unique in value) {
        assert(value[unique].item, '!item')
        delete value[unique].sentOutCopy // очищаем инфу о начатых отправлениях. Позже будет предпринята попытка повторно отправить данные
      }
      return value
    }
  }, { root: true })
  context.commit('init')
  return true
}

const QueueItemStatusEnum = Object.freeze({ CREATED: 'CREATED ', UPDATED: 'UPDATED', DELETED: 'DELETED' })
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
  let filterFuncStr = filterFunc.toString()
  let sortFuncStr = sortFunc.toString()
  assert(!filterFuncStr.includes('::'), 'filterFuncStr.includes ::')
  assert(!sortFuncStr.includes('::'), 'sortFuncStr.includes ::')
  return `listWS::${collection}::${filterFuncStr}::${sortFuncStr}`
}

// обновить версию локальной мастерской (по результатам обработки эвентов)
async function updateWsRevision (context, wsRevisionServer) {
  logD('updateRevision start')
  assert(context.rootGetters.currentUser, '!currentUser') // currentUser обязан быть в кэше!
  await context.dispatch('cache/update', {
    key: context.rootGetters.currentUser.oid,
    path: 'wsRevision',
    newValue: wsRevisionServer
  }, { root: true })
  logD('updateVersion complete')
}

// пометить элементы мастерской как outOfDate (запросятся при первой возможности)
async function expireWsCache (context) {
  logD('expireWsCache start')
  for (let key in context.rootState.cache.cachedItems) {
    let keyPattern = 'listWS::'
    if (key.startsWith(keyPattern)) {
      await context.dispatch('cache/expire', { key: key }, { root: true })
    }
  }
  logD('expireWsCache complete')
}

// вернет все ключи для всех списков, в которых может быть item
function getWsListsForItem (context, item) {
  let collection = getCollection(item.wsItemType)
  let result = []
  for (let key in context.rootState.cache.cachedItems) {
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

// применит изменения во всех списках
async function updateWsLists (context, item, offlineStatus) {
  for (let { key, collection, listFilterFunc, listSortFunc } of getWsListsForItem(context, item)) {
    await context.dispatch('cache/update', {
      key: key,
      path: '',
      setter: (value) => {
        // { items, count, totalCount, nextPageToken }
        assert(value.items && value.count >= 0 && value.totalCount >= 0)
        let indx = value.items.findIndex(listItem => listItem.unique === item.unique)
        if (offlineStatus === 'upserted' && indx >= 0) { // изменить
          value.items.splice(indx, 1, item) // удаляем элемент и на его место вставляем новый. используем splice для реактивности
        } else if (offlineStatus === 'upserted' && indx === -1) { // добавить
          let insertPos = 0
          if (listSortFunc) {
            for (let i = 0; i < value.items.length; i++) {
              if (listSortFunc(item, value.items[i]) <= 0) { // если item <= value.items[i]
                insertPos = i // вставляем в эту позицию
                break
              }
            }
          }
          // вставляем в insertPos используем splice для реактивности
          value.items.splice(insertPos, 0, item)
          value.count++
          value.totalCount++
        } else if (offlineStatus === 'deleted' && indx >= 0) { // удалить
          value.items.splice(indx, 1)
          value.count--
          value.totalCount--
        }
        return value
      }
    }, { root: true })
  }
}

// применит изменения локально в кэше. Запланирует изменения на сервере
async function updateItemLocal (context, item, offlineStatus) {
  assert(offlineStatus === 'upserted' || offlineStatus === 'deleted', 'bad offlineStatus' + offlineStatus)
  let collection = getCollection(item.wsItemType)
  let wsListKeyBase = makeListWsKey(collection) // первичный список (в нем все элементы этого типа)
  item = JSON.parse(JSON.stringify(item)) // делаем так  - тк к item будет добавлена реактивность
  // применить в wsUnsavedChanges
  await context.dispatch('cache/update', {
    key: 'wsUnsavedChanges',
    path: '',
    setter: (value) => {
      assert(value, '!value см init() ')
      let existingChanges = value[item.unique] || {}
      assert(existingChanges.offlineStatus !== 'deleted') // нельзя менять после удаления! и нельзя удалять дважды
      let changes = { item, collection, offlineStatus, sentOutCopy: existingChanges.sentOutCopy } // sentOutCopy - храним (очищается в processEvent)
      value[item.unique] = changes // запоминаем изменения для item в wsUnsavedChanges
      return value
    }
  }, { root: true })
  // применить во всех списках
  await updateWsLists(context, item, offlineStatus)
}

//

async function sendAllChangesToServer(context){

}
// послать измененный item на сервер
async function sendItemToServer (context, item, offlineStatus) {
  try {
    // запомнить sentOutCopy, очистить offlineStatus
    await context.dispatch('cache/update', {
      key: 'wsUnsavedChanges',
      path: '',
      setter: (value) => {
        value = value || {}
        let existingChanges = value[item.unique]
        assert(existingChanges, 'existingChanges not found!')
        existingChanges.sentOutCopy = JSON.parse(JSON.stringify(item)) // эта версия данных была отправлена на сервер
        existingChanges.offlineStatusBackup = existingChanges.offlineStatus // на случай - если обломится сохранение
        delete existingChanges.offlineStatus // на данный момент все имеющиеся изменения учтены и отправлены на сервер
        return value
      }
    }, { root: true })

    if (offlineStatus === 'upserted') {
      let { data: { wsItemCreate: wsItem } } = await apollo.clients.api.mutate({
        mutation: gql`
          ${fragments.objectFullFragment}
          mutation ($item: WSItemInput!, $wsRevision: Int!) {
            wsItemUpsert (item: $item, wsRevision: $wsRevision)
          }
        `,
        variables: { item, wsRevision: context.rootGetters.currentUser.wsRevision }
      })
    } else if (offlineStatus === 'deleted') {
      let { data: { wsItemCreate: wsItem } } = await apollo.clients.api.mutate({
        mutation: gql`
          ${fragments.objectFullFragment}
          mutation ($item: WSItemInput!, $wsRevision: Int!) {
            wsItemDelete (item: $item, wsRevision: $wsRevision)
          }
        `,
        variables: { item, wsRevision: context.rootGetters.currentUser.wsRevision }
      })
    }
  } catch (err) {
    logE('error on sendToServer ws changes', err, item)
    try {
      if (!err.networkError) { // если ошибка не сетевая
        // обычно - это конфликт версий
        // удалить этот item из локальных изменений. Перезагрузить wsItems (возьмем версию сервера)
        await context.dispatch('cache/update', {
          key: 'wsUnsavedChanges',
          path: '',
          setter: (value) => {
            value = value || {}
            delete value[item.unique]
            return value
          }
        }, { root: true })
        await wsItems(context, { collection: getCollection(item.wsItemType) })
      } else {
        // произошла сетевая ошибка. Это нормально. Вернем все в исходное. Попробуем позже
        await context.dispatch('cache/update', {
          key: 'wsUnsavedChanges',
          path: '',
          setter: (value) => {
            value = value || {}
            let existingChanges = value[item.unique]
            assert(existingChanges, 'existingChanges not found!')
            assert(existingChanges.sentOutCopy, '!existingChanges.sentOutCopy')
            delete existingChanges.sentOutCopy
            assert(existingChanges.offlineStatusBackup)
            existingChanges.offlineStatus = existingChanges.offlineStatusBackup
            return value
          }
        }, { root: true })
      }
    } catch (err) {
      logE('logic error! cant clear local item changes. try clear all cache', err)
      await clearCache()
      await window.location.reload()
    }
  }
}

// получить списки из мастерской (содержит полные элементы)
export const wsItems = async (context, { collection, filterFunc, sortFunc }) => {
  assert(collection in WsCollectionEnum, 'bad collection' + collection)
  logD('wsItems get ... ')
  const fetchItemFunc = async () => {
    const fetchItemFunc = async () => {
      let { data: { wsItems: { items, count, totalCount, nextPageToken } } } = await apollo.clients.api.query({
        query: gql`
          ${fragments.wsObjectShortFragment}
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
      assert(context.rootState.cache.cachedItems.wsUnsavedChanges, '!wsUnsavedChanges')
      for (let unique in context.rootState.cache.cachedItems.wsUnsavedChanges) {
        let { item, collection, offlineStatus, sentOutCopy } = context.rootState.cache.cachedItems.wsUnsavedChanges[unique]
        let indx = items.findIndex(itemFromServer => item.unique === itemFromServer.unique)
        if (offlineStatus) {
          if (indx >= 0 && offlineStatus === 'upserted') {
            items[indx] = item
          }// заменяем на локальную измененную копию
          else if (indx >= 0 && offlineStatus === 'deleted') {
            items.splice(indx, 1)
          } else if (indx === -1 && offlineStatus === 'upserted') items.push(item)
        }
      }
      return {
        item: { items, count, totalCount, nextPageToken },
        actualAge: 'day'
      }
    }
    // 1. получить ВСЕ данные с сервера
    let wsFeedResult = await context.dispatch('cache/get',
      { key: makeListWsKey(collection), fetchItemFunc }, { root: true })
    logD('wsItems get complete')
    // 2. сделать копию. отфильтровать и отсортировать
    let items = { ...wsFeedResult.items }
    if (filterFunc) items = items.filer(filterFunc)
    if (sortFunc) items.sort(sortFunc)
    return {
      item: { items, count: items.count, totalCount: wsFeedResult.count, nextPageToken: null },
      actualAge: 'day'
    }
  }

  let wsFeedResult = await context.dispatch('cache/get',
    { key: makeListWsKey(collection, filterFunc, sortFunc), fetchItemFunc }, { root: true })
  return wsFeedResult
}
export const wsItemUpsert = async (context, item) => {
  let collection = getCollection(item.wsItemType)
  await updateItemLocal(context, item, 'upserted')
}
export const wsItemDelete = async (context, item) => {
  assert(item.unique, '!item.unique')
  let collection = getCollection(item.wsItemType)
  await updateItemLocal(context, item, 'deleted')
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
//  (прилетел эвент WS_ITEM_CREATED/WS_ITEM_DELETED/WS_ITEM_UPDATED) обновим wsUnsavedChanges
export const processEvent = async (context, event) => {
  logD('updateWsItems start')
  let { type, object: itemServer } = event
  assert(itemServer.oid && itemServer.name != null && itemServer.unique, 'assert itemServer !check')
  assert(type === 'WS_ITEM_CREATED' || type === 'WS_ITEM_DELETED' || type === 'WS_ITEM_UPDATED', 'bad ev type')
  assert(itemServer.revision, '!itemServer.revision')

  // обновим wsUnsavedChanges
  await context.dispatch('cache/update', {
    key: 'wsUnsavedChanges',
    path: '',
    setter: (value) => {
      value = value || {}
      let existingChanges = value[itemServer.unique]
      if (existingChanges) { // у нас есть изменения этого item!
        assert(existingChanges.item, '!existingChanges.item')
        if (existingChanges.sentOutCopy && existingChanges.sentOutCopy.revision === itemServer.revision - 1) {
          // все ок. Мы изменили данные - они поменялись на сервере и к нам прилетело подтверждение
          if (!existingChanges.offlineStatus) {
            delete value[itemServer.unique]
          }// локальных изменений нет. удаляем весь объект
          else {
            delete existingChanges.sentOutCopy
          } // пока данные сохранялись - что то еще поменялось (будет отправлено на сервер позже)
        } else { // проблема! мы изменяли данные. Но ответ от сервера - ответ НЕ НА НАШИ изменения (либо мы вообще еще не успели ничего отправить)
          // Есть несохраненные данные! по всей видимости данные изменены из другого клиента
          logE(`version conflict! 
            itemServer.revision=${itemServer.revision} 
            existingChanges=${existingChanges}`)
          // ничего не поделать - принимаем версию сервера. удаляем локальные изменения
          delete value[itemServer.unique]
          updateWsLists(context, itemServer, type === 'WS_ITEM_DELETED' ? 'deleted' : 'upserted') // setter не может быть async. выполняем в фоне
        }
      } else { // мы ничего не меняли. применяем ко всем спискам!
        // действие совершено не из этого клиента? (например, приложение открыто одновременно на ПК и в телефоне)
        updateWsLists(context, itemServer, type === 'WS_ITEM_DELETED' ? 'deleted' : 'upserted') // setter не может быть async. выполняем в фоне
      }
      return value
    }
  }, { root: true })
}

// работа с мастерской идет через эвенты. Мутация на сервере вызывает эвент, котрый отлавливается в модуле events
export const wsItemCreate = async (context, item) => {
  logD('wsItemCreate start', item)
  let itemInput = denormalizeWSItem(item)
  logD('denormalizeWSItem=', itemInput)
  let { data: { wsItemCreate: wsItem } } = await apollo.clients.api.mutate({
    mutation: gql`
      ${fragments.objectFullFragment}
      mutation wsItemCreate ($item: WSItemInput!) {
        wsItemCreate (item: $item) {
          ...objectFullFragment
        }
      }
    `,
    variables: { item: itemInput }
  })
  wsItem = normalizeWSItem(wsItem)
  let updatedItem = await context.dispatch('cache/update', {
    key: wsItem.oid,
    newValue: wsItem,
    actualAge: 'hour'
  }, { root: true })
  logD('wsItemCreate done', updatedItem)
  return updatedItem
}
// работа с мастерской идет через эвенты. Мутация на сервере вызывает эвент, котрый отлавливается в модуле events
export const wsItemUpdate = async (context, item) => {
  logD('wsItemUpdate start', item)
  let itemInput = denormalizeWSItem(item)
  let { data: { wsItemUpdate: wsItem } } = await apollo.clients.api.mutate({
    mutation: gql`
      ${fragments.objectFullFragment}
      mutation wsItemUpdate ($item: WSItemInput!) {
        wsItemUpdate (item: $item) {
          ...objectFullFragment
        }
      }
    `,
    variables: { item: itemInput }
  })
  wsItem = normalizeWSItem(wsItem)
  let updatedItem = context.dispatch('cache/update', {
    key: wsItem.oid,
    newValue: wsItem,
    actualAge: 'hour'
  }, { root: true })
  logD('wsItemUpdate done', updatedItem)
  return updatedItem
}
// работа с мастерской идет через эвенты. Мутация на сервере вызывает эвент, котрый отлавливается в модуле events
export const wsItemDelete = async (context, oid) => {
  logD('wsItemDelete start')
  let { data: { wsItemDelete: result } } = await apollo.clients.api.mutate({
    mutation: gql`
      ${fragments.objectFullFragment}
      mutation wsItemDelete ($oid: OID!) {
        wsItemDelete (oid: $oid)
      }
    `,
    variables: { oid }
  })
  // todo выкинуть из кэша
  logD('wsItemDelete done')
  return result
}

// обновим кэш мастерской (прилетел эвент WS_ITEM_CREATED/WS_ITEM_DELETED/WS_ITEM_UPDATED)
export const updateWsLists = async (context, event) => {
  logD('updateWsItems start')
  let { type, object } = event
  assert(object.oid && object.name != null)
  assert(type === 'WS_ITEM_CREATED' || type === 'WS_ITEM_DELETED' || type === 'WS_ITEM_UPDATED', 'bad ev type')
  for (let key in context.rootState.cache.cachedItems) {
    if (!key.startsWith(listKeyPattern)) continue
    let collection = key.slice(listKeyPattern.length)
    logD('updateWsItems collection', collection)
    assert(object.wsItemType, '!object.wsItemType')
    if (getCollection(object.wsItemType) !== collection) continue
    logD('updateWsItems after CONTINUE', key)
    if (type === 'WS_ITEM_CREATED') {
      await context.dispatch('cache/update', {
        key: key,
        path: '',
        setter: (value) => {
          // { items, count, totalCount, nextPageToken }
          // logD('setter: ', value)
          assert(value.items && value.count >= 0 && value.totalCount >= 0)
          let indx = value.items.findIndex(item => item.oid === object.oid)
          if (indx === -1) {
            // элемент в самом списке - objectShort
            // вставляем в начало используем splice для реактивности
            value.items.splice(0, 0, makeWsObjectShort(object))
            value.count++
            value.totalCount++
          }
          return value
        }
      }, { root: true })
    } else if (type === 'WS_ITEM_DELETED') {
      await context.dispatch('cache/update', {
        key: key,
        path: '',
        setter: (value) => {
          // { items, count, totalCount, nextPageToken }
          assert(value.items && value.count >= 0 && value.totalCount >= 0)
          let indx = value.items.findIndex(item => item.oid === object.oid)
          if (indx >= 0) {
            // splice для реактивности
            value.items.splice(indx, 1)
            value.count--
            value.totalCount--
          }
          return value
        }
      }, { root: true })
    } else if (type === 'WS_ITEM_UPDATED') {
      await context.dispatch('cache/update', {
        key: key,
        path: '',
        setter: (value) => {
          // { items, count, totalCount, nextPageToken }
          // logD('setter: ', value)
          assert(value.items && value.count >= 0 && value.totalCount >= 0)
          let indx = value.items.findIndex(item => item.oid === object.oid)
          if (indx >= 0) {
            // элемент в самом списке - objectShort. удаляем элемент и на его место вставляем новый используем splice для реактивности
            value.items.splice(indx, 1, makeWsObjectShort(object))
            value.count++
            value.totalCount++
          }
          return value
        }
      }, { root: true })
    }
  }
  logD('updateWsItems complete')
}
