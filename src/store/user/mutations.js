import assert from 'assert'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.VUEX)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.VUEX)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.VUEX)

export function init (state, oid) {
  assert.ok(oid)
  state.initialized = true
  state.oid = oid
}

// export function deleteUserSession (state, {token, userOid}) {
//   if (!token) { // удалить все кроме текущей
//     let currUser = context.rootGetters['objects/objectGet']({ oid: event.object.oid })
//     // let currentToken = localStorage.getItem('ktoken').split('::')[0]
//     let indx = state.currentUser.sessions.findIndex(sess => sess.token === localStorage.getItem('ktoken'))
//     if (indx >= 0) state.currentUser.sessions = [state.currentUser.sessions[indx]]
//   } else {
//     let indx = state.currentUser.sessions.findIndex(sess => sess.token === token)
//     if (indx >= 0) state.currentUser.sessions.splice(indx, 1)
//   }
// }

export function subscribe (state, { objectShort, context: { rootGetters, commit } }) {
  logD('subscribe mutation', objectShort, rootGetters['objects/get'](state.oid))
  // let currentUser = context.getters['objects/get'](context.state.user.oid)

  commit('objects/update', {
    oid: state.oid,
    path: 'subscriptions',
    setter: (oldValue) => {
      let subscriptions = oldValue // JSON.parse(JSON.stringify(currUser.subscriptions))
      assert.ok(subscriptions.indexOf(objectShort.oid) === -1)
      subscriptions.push(objectShort)
      return subscriptions
    }
  }, { root: true })

  // let currUser = rootGetters.currUser
  // assert(currUser && currUser.subscriptions, currUser)
  // let subscriptions = JSON.parse(JSON.stringify(currUser.subscriptions))
  // assert.ok(subscriptions.indexOf(objectShort.oid) === -1)
  // subscriptions.push(objectShort)
  // commit('objects/update', {
  //   oid: objectShort.oid,
  //   path: 'subscriptions',
  //   value: subscriptions
  // }, { root: true })
  logD('subscribe mutation OK ')
}

export function unSubscribe (state, { objectShort, context: { rootGetters, commit } }) {
  logD('unSubscribe mutation', objectShort, rootGetters['objects/get'](state.oid))
  // let currentUser = context.getters['objects/get'](context.state.user.oid)

  commit('objects/update', {
    oid: state.oid,
    path: 'subscriptions',
    setter: (oldValue) => {
      let subscriptions = oldValue // JSON.parse(JSON.stringify(currUser.subscriptions))
      let index = subscriptions.findIndex(s => s.oid === objectShort.oid)
      assert.ok(index >= 0)
      subscriptions.splice(index, 1)
      return subscriptions
    }
  }, { root: true })

  // let currUser = rootGetters.currUser
  // assert(currUser && currUser.subscriptions, currUser)
  // let subscriptions = JSON.parse(JSON.stringify(currUser.subscriptions))
  // let index = subscriptions.findIndex(s => s.oid === objectShort.oid)
  // assert.ok(index >= 0)
  // subscriptions.splice(index, 1)
  // commit('objects/update', {
  //   oid: objectShort.oid,
  //   path: 'subscriptions',
  //   value: subscriptions
  // }, { root: true })
  logD('unSubscribe mutation ОК')
}
