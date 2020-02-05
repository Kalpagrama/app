import assert from 'assert'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.VUEX)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.VUEX)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.VUEX)
import Vue from 'vue'

export function init (state) {
  state.initialized = true
}

export function stateSet (state, [key, val]) {
  assert.ok(Object.prototype.hasOwnProperty.call(state, key))
  state[key] = val
}

export const wsNodeCreate = (state, { object, context: { rootState, commit } }) => {
  let node = object
  logD('wsNodeCreate', node)
  assert(node.oid)
  commit('objects/update', {
    oid: rootState.auth.userOid,
    path: 'workspace.nodes',
    setter: (oldValue) => {
      let nodes = oldValue
      let index = nodes.findIndex(n => n.oid === node.oid)
      assert.ok(index === -1)
      nodes.push(node)
      return nodes
    }
  }, { root: true })
  // Vue.set(state.workspace.nodes, state.workspace.nodes.length, node)
}
export const wsNodeUpdate = (state, { object, context: { rootState, commit } }) => {
  let node = object
  logD('wsNodeUpdate', node)
  assert(node.oid)
  commit('objects/update', {
    oid: rootState.auth.userOid,
    path: 'workspace.nodes',
    setter: (oldValue) => {
      let nodes = oldValue
      let index = nodes.findIndex(n => n.oid === node.oid)
      assert.ok(index >= 0)
      nodes[index] = node
      return nodes
    }
  }, { root: true })
  // let i = state.workspace.nodes.findIndex(d => d.oid === node.oid)
  // if (i >= 0) {
  //   Vue.set(state.workspace.nodes, i, node)
  // } else {
  //   logE('node not found', node)
  // }
}
export const wsNodeDelete = (state, { object, context: { rootState, commit } }) => {
  let node = object
  logD('wsNodeDelete', node)
  assert(node)
  commit('objects/update', {
    oid: rootState.auth.userOid,
    path: 'workspace.nodes',
    setter: (oldValue) => {
      let nodes = oldValue
      let index = nodes.findIndex(n => n.oid === node.oid)
      assert.ok(index >= 0)
      nodes.splice(index, 1)
      return nodes
    }
  }, { root: true })

  // let i = state.workspace.nodes.findIndex(d => d.oid === node.oid)
  // if (i >= 0) {
  //   Vue.delete(state.workspace.nodes, i)
  //   logD('wsNodeDelete', node)
  // } else {
  //   logE('wsNodeDelete OID not found', node)
  //   logD('wsNodeDelete', node)
  // }
}

export const wsSphereCreate = (state, { object, context: { rootState, commit } }) => {
  let sphere = object
  assert(sphere && sphere.oid)
  logD('wsSphereCreate', sphere)
  commit('objects/update', {
    oid: rootState.auth.userOid,
    path: 'workspace.spheres',
    setter: (oldValue) => {
      let spheres = oldValue
      let index = spheres.findIndex(s => s.oid === sphere.oid)
      assert.ok(index === -1)
      spheres.push(sphere)
      return spheres
    }
  }, { root: true })
  // Vue.set(state.workspace.spheres, state.workspace.spheres.length, sphere)
}
export const wsSphereDelete = (state, { object, context: { rootState, commit } }) => {
  let oid = object.oid
  assert(oid)
  logD('wsSphereDelete', oid)
  commit('objects/update', {
    oid: rootState.auth.userOid,
    path: 'workspace.spheres',
    setter: (oldValue) => {
      let spheres = oldValue
      let index = spheres.findIndex(s => s.oid === oid)
      assert.ok(index >= 0)
      spheres.splice(index, 1)
      return spheres
    }
  }, { root: true })
  // let i = state.workspace.spheres.findIndex(t => t.oid === oid)
  // if (i >= 0) {
  //   Vue.delete(state.workspace.spheres, i)
  // } else {
  //   logE('wsSphere not found', oid)
  // }
}
