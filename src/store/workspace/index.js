import state from './state'
import * as getters from './getters'
import * as mutations from './mutations'
import * as actions from './actions'
import assert from 'assert'

// todo extendedFields - временное решение для элементов мастерской (пока структура элемента мастерской не стабилизировалась) В последствии планируестся провести через графкуэль
export function denormalizeWSItem (item) {
  let wsItem = { extendedFields: {} }
  for (let key of Object.keys(item)) {
    if (['oid', 'unique', 'thumbOid', 'name', 'wsItemType', 'revision'].includes(key)) {
      wsItem[key] = item[key]
    } else {
      wsItem.extendedFields[key] = item[key]
    }
  }
  return wsItem
}
export function normalizeWSItem (item) {
  assert(item.extendedFields, '!item.extendedFields')
  let wsItem = {...item, ...item.extendedFields}
  delete wsItem.extendedFields
  return wsItem
}

export default {
  namespaced: true,
  getters,
  mutations,
  actions,
  state,
}
