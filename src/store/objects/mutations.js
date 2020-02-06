import assert from 'assert'
import { apollo } from 'src/boot/apollo'
import { fragments } from 'src/schema'
import Vue from 'vue'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.VUEX)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.VUEX)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.VUEX)

// todo передавать и хранить не currentUser, а oid. Юзера брать из cachedItems по oid в геттере
export function init (state) {
  state.initialized = true
}

// function setValue (obj, path, value) {
//   let o = obj
//   for (let i = 0; i < path.length - 1; i++) {
//     let n = path[i]
//     if (!(n in o)) o[n] = {}
//     o = o[n]
//   }
//   o[path[path.length - 1]] = value
// }
//
// export function set (state, objectFull) {
//   logD('mutation objects/set')
//   assert(objectFull && objectFull.oid, objectFull)
//   let cachedObject = state.objects[objectFull.oid]
//   if (cachedObject) {
//     if (cachedObject.changesApplied) { // уже изменено (оптимизация)
//       logD('changesApplied detected! skip it.')
//       // эта ветка срабатывает если изменения инициированы vuex-мутацией update (src/store/objects/mutations.js:109)
//       delete cachedObject.changesApplied
//     } else {
//       // эта ветка срабатывает если изменения инициированы самим apollo (например, ответом на apollo.client.mutate(...))
//       // TODO На самом деле изменилось какое-то одно проперти. Не обязательно присваивать все! Может быть очень накладной операцией!
//       // надо только понять что именно поменялось...
//       // если этого сделать не получится - отменить изменения через мутации аполло и вызывать явно vuex-мутацию update (src/store/objects/mutations.js:109)
//       for (let prop in objectFull) {
//         Vue.set(cachedObject, prop, objectFull[prop])
//       }
//     }
//   } else {
//     state.objects[objectFull.oid] = Vue.observable(JSON.parse(JSON.stringify(objectFull)))
//     // state.objects[objectFull.oid] = objectFull // JSON.parse(JSON.stringify(objectFull))
//   }
//   logD('mutation objects/set complete')
// }
//
// export function stateSet (state, [key, val]) {
//   // console.debug('asdasd')
//   assert.ok(Object.prototype.hasOwnProperty.call(state, key), key)
//   state[key] = val
// }
//
// // обновит данные в кэше аполло. см src/store/objects/actions.js:214 (watchQuery.subscribe)
// export function update (state, { oid, path, newValue, setter }) {
//   logD('object/update mutation', oid, path)
//   // let object = state.objects[oid] ? state.objects[oid].objectData : null
//   // if (!object) return
//   let p = path.split('.')
//
//   // const pFunc = (pathArr) => {
//   //   assert(pathArr.length)
//   //   let result = ''
//   //   let first = pathArr.shift()
//   //   if (pathArr.length) return `${first}{${pFunc(pathArr)}}`
//   //   else return first
//   // }
//   let cacheData = state.objects[oid]
//   if (!cacheData) {
//     logW('cacheData not found in local cache. try apollo cache', oid)
//     cacheData = apollo.clients.api.readFragment({
//       id: oid,
//       fragmentName: 'objectFullFragment',
//       fragment: fragments.objectFullFragment
//     })
//   } else {
//     cacheData.changesApplied = true
//   }
//   if (setter) {
//     // берем старые данные и меняем их сеттером
//     assert(cacheData, '!cacheData')
//     let oldValue = cacheData
//     for (let prop of p) {
//       assert(oldValue, '!oldValue')
//       oldValue = oldValue[prop]
//     }
//     // logD('oldValue = ', oldValue)
//     // - иначе ошибка из-за того что oldValue(если оно массив) - readOnly. Можно получить копию через stringify, но это затратно
//     if (Array.isArray(oldValue)) oldValue = oldValue.slice()
//     newValue = setter(oldValue)
//     // logD('newValue = ', newValue)
//   }
//
//   assert(cacheData, 'cacheData is null')
//   setValue(cacheData, p, newValue)
//
//   // //writeFragment быстрее. Но ему надо чтобы в object были все поля фрагмента. Иначе - ругается ворнингами
//   // apollo.clients.api.writeData({ id: oid, data: cacheData })
//
//   apollo.clients.api.writeFragment({
//     id: oid,
//     fragmentName: 'objectFullFragment',
//     fragment: fragments.objectFullFragment,
//     data: cacheData
//   })
//
//   if (cacheData.changesApplied) delete cacheData.changesApplied
//   logD('object/update mutation complete', oid, path)
// }
