import assert from 'assert'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.VUEX)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.VUEX)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.VUEX)
import Vue from 'vue'

export function init (state, workspace) {
  assert.ok(workspace)
  state.workspace = workspace
  state.initialized = true
}

export function stateSet (state, [key, val]) {
  assert.ok(Object.prototype.hasOwnProperty.call(state, key))
  state[key] = val
}

export const wsNodeCreate = (state, node) => {
  assert(node.oid)
  // state.workspace.nodes.push(node)
  Vue.set(state.workspace.nodes, state.workspace.nodes.length, node)
}
export const wsNodeUpdate = (state, node) => {
  assert(node.oid)
  let i = state.workspace.nodes.findIndex(d => d.oid === node.oid)
  if (i >= 0) {
    // state.workspace.nodes[i] = node
    Vue.set(state.workspace.nodes, i, node)
  } else {
    logE('node not found', node)
  }
}
export const wsNodeDelete = (state, node) => {
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

export const wsSphereCreate = (state, sphere) => {
  assert(sphere.oid)
  // state.workspace.spheres.push(sphere)
  Vue.set(state.workspace.spheres, state.workspace.spheres.length, sphere)
}
export const wsSphereDelete = (state, oid) => {
  assert(oid)
  let i = state.workspace.spheres.findIndex(t => t.oid === oid)
  if (i >= 0) {
    // state.workspace.spheres.splice(i, 1)
    Vue.delete(state.workspace.spheres, i)
  } else {
    logE('wsSphere not found', oid)
  }
}
