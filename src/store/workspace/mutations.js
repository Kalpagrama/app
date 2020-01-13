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

export const wsNodeCreate = (state, {object, context: { rootGetters, commit }}) => {
  let node = object
  assert(node.oid)
  // state.workspace.nodes.push(node)
  Vue.set(state.workspace.nodes, state.workspace.nodes.length, node)
}
export const wsNodeUpdate = (state, {object, context: { rootGetters, commit }}) => {
  let node = object
  assert(node.oid)
  let i = state.workspace.nodes.findIndex(d => d.oid === node.oid)
  if (i >= 0) {
    // state.workspace.nodes[i] = node
    Vue.set(state.workspace.nodes, i, node)
  } else {
    logE('node not found', node)
  }
}
export const wsNodeDelete = (state, {object, context: { rootGetters, commit }}) => {
  let node = object
  logD('wsNodeDelete', node)
  assert(node)
  let i = state.workspace.nodes.findIndex(d => d.oid === node.oid)
  if (i >= 0) {
    // state.workspace.nodes.splice(i, 1)
    Vue.delete(state.workspace.nodes, i)
    logD('wsNodeDelete', node)
  } else {
    logE('wsNodeDelete OID not found', node)
    logD('wsNodeDelete', node)
  }
}

export const wsSphereCreate = (state, {object, context: { rootGetters, commit }}) => {
  let sphere = object
  assert(sphere.oid)
  // state.workspace.spheres.push(sphere)
  Vue.set(state.workspace.spheres, state.workspace.spheres.length, sphere)
}
export const wsSphereDelete = (state, {object, context: { rootGetters, commit }}) => {
  let oid = object.oid
  assert(oid)
  let i = state.workspace.spheres.findIndex(t => t.oid === oid)
  if (i >= 0) {
    // state.workspace.spheres.splice(i, 1)
    Vue.delete(state.workspace.spheres, i)
  } else {
    logE('wsSphere not found', oid)
  }
}
