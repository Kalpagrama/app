import assert from 'assert'
import { apollo } from 'src/boot/apollo'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
import { fragments } from 'src/schema'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.VUEX)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.VUEX)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.VUEX)

export function init (state) {
  // current user  хранится в кэше со всеми объектами, но живет вечно
  // assert.ok(user && user.oid)
  // assert.ok(!state.objects[user.oid])
  // state.objects[user.oid] = { objectData: user, fragments: [fragmentName] }
  // state.currentUser = user
  state.initialized = true
}

export function stateSet (state, [key, val]) {
  // console.debug('asdasd')
  assert.ok(Object.prototype.hasOwnProperty.call(state, key))
  state[key] = val
}

// // удаляем из кэша при превышении размера и по ttl
// function cleanUp (state) {
//   // удаляем по ttl, либо по превышению размера
//   while (state.ttls.length > 8888 || (state.ttls.length && state.ttls[0].ttl < Date.now())) {
//     let first = state.ttls.shift()
//     delete state.objects[first.oid]
//   }
// }

// // кэш объектов
// export function objectAdd (state, { object, fragmentName }) {
//   assert.ok(object.oid)
//   cleanUp(state)
//   let storedValue = state.objects[object.oid]
//   if (storedValue) {
//     if (!storedValue.fragments.includes(fragmentName)) storedValue.fragments.push(fragmentName)
//     for (let prop in object) {
//       storedValue.objectData[prop] = object[prop]
//     }
//   } else {
//     storedValue = { objectData: object, fragments: [fragmentName] }
//     // todo state.ttls должно быть отсортировано по t tl. (актуально, если мы захотим назначать разные ttl)
//     // сейчас сортировка естественным образом соблюдается(данные добавляются хронологически)
//     state.ttls.push({ oid: object.oid, ttl: Date.now() + 1000 * 60 * 60 }) // + 1 час
//   }
//   state.objects[object.oid] = storedValue
// }

// export function updateOld (state, { oid, path, value }) {
//   let object = state.objects[oid] ? state.objects[oid].objectData : null
//   if (!object) return
//   let p = path.split('.')
//   setValue(object, p, value)
//   logD('currentUser', state.currentUser)
//   if (i18next.language !== state.currentUser.profile.lang) { // изменился язык пользователя. изменить язык интерфейса
//     logD('change lang from:2 ', i18next.language, 'to: ', state.currentUser.profile.lang)
//     i18next.changeLanguage(state.currentUser.profile.lang).catch(err => logE(err))
//     // window.location.reload()
//     Vue.forceUpdate();
//   }
// }

function setValue (obj, path, value) {
  let o = obj
  for (let i = 0; i < path.length - 1; i++) {
    let n = path[i]
    if (!(n in o)) o[n] = {}
    o = o[n]
  }
  o[path[path.length - 1]] = value
}

export function update (state, { oid, path, newValue, setter }) {
  logD('object/update mutation', oid, path)
  // let object = state.objects[oid] ? state.objects[oid].objectData : null
  // if (!object) return
  let p = path.split('.')

  // const pFunc = (pathArr) => {
  //   assert(pathArr.length)
  //   let result = ''
  //   let first = pathArr.shift()
  //   if (pathArr.length) return `${first}{${pFunc(pathArr)}}`
  //   else return first
  // }

  if (setter) {
    let cacheData = apollo.clients.api.readFragment({
      id: oid,
      fragmentName: 'objectFullFragment',
      fragment: fragments.objectFullFragment
    })
    logD('cacheData=', cacheData)
    if (!cacheData) return
    let oldValue = cacheData
    for (let prop of p){
      assert(oldValue)
      oldValue = oldValue[prop]
    }
    logD('oldValue = ', oldValue)
    newValue = setter(oldValue)
    logD('newValue = ', newValue)
  }

  let object = {}
  setValue(object, p, newValue)
  logD('objects/update. object=', object)
  // writeFragment быстрее. Но ему надо чтобы в object были все поля фрагмента. Иначе - ругается ворнингами
  apollo.clients.api.writeData({ id: oid, data: object })
  // apollo.clients.api.writeFragment({
  //   id: oid,
  //   fragmentName: 'objectFullFragment',
  //   fragment: fragments.objectFullFragment,
  //   data: object
  // })
}
