import assert from 'assert'
import { logE } from 'src/boot/log'

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
  state.workspace.nodes.push(node)
}
export const wsNodeUpdate = (state, node) => {
  assert(node.oid)
  let i = state.workspace.nodes.findIndex(d => d.oid === node.oid)
  if (i >= 0) {
    state.workspace.nodes[i] = node
  } else {
    logE('node not found', node)
  }
}
export const wsNodeDelete = (state, oid) => {
  assert(oid)
  let i = state.workspace.nodes.findIndex(d => d.oid === oid)
  if (i >= 0) {
    state.workspace.nodes.splice(i, 1)
  } else {
    logE('wsNode not found', oid)
  }
}

export const wsSphereCreate = (state, sphere) => {
  assert(sphere.oid)
  state.workspace.spheres.push(sphere)
}
export const wsSphereDelete = (state, oid) => {
  assert(oid)
  let i = state.workspace.spheres.findIndex(t => t.oid === oid)
  if (i >= 0) {
    state.workspace.spheres.splice(i, 1)
  } else {
    logE('wsSphere not found', oid)
  }
}
