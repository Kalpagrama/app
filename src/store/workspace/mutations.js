import { stat } from 'fs'

const debug = require('debug')('$workspace:mutation')
debug.enabled = true

export function state(state, [key, val]) {
  if (val) {
    state[key] = val
  } else {
    return state[key]
  }
}

// content
export const addWSContent = (state, content) => {
  debug('addWSContent start')
  state.workspace.contents.push(content)
  debug('addWSContent done')
}
export const updateWSContent = (state, content) => {
  debug('updateWSContent start')
  let i = state.workspace.contents.findIndex(c => c.uid === content.uid)
  state.workspace.contents[i] = content
  debug('updateWSContent done')
}
export const deleteWSContent = (state, content) => {
  debug('deleteWSContenet start')
  let i = state.workspace.contents.findIndex(c => c.uid === content.uid)
  state.workspace.splice(i, 1)
  debug('deleteWSContent done')
}

// tag
export const addWSTag = (state, tag) => {
  debug('addWSTag start')
  state.workspace.tags.push(tag)
  debug('addWSTag done')
}
export const updateWSTag = (state, tag) => {
  debug('updateWSTag start')
  let i = state.workspace.tags.findIndex(t => t.uid === tag.uid)
  state.workspace.tags[i] = tag
  debug('updateWSTag done')
}
export const deleteWSTag = (state, tag) => {
  debug('deleteWSTag start')
  let i = state.workspace.tags.findIndex(t => t.uid === tag.uid)
  state.workspace.tags.splice(i, 1)
  // TODO: delete this tag from all contents drafts and nodes
  debug('deleteWSTag done')
}

// node
export function addNode(state, node) {
  debug('addNode start')
  // add only unique node
  let findIndex = state.workspace.nodes.findIndex(n => n.oid === node.oid)
  if (findIndex) {
    debug('addNode duplicate!')
  } else {
    debug('addNode add')
    state.workspace.nodes.push(node)
  }
}
export function updateNode(state, node) {
  debug('updateNode start')
  let findIndex = state.workspace.nodes.findIndex(n => n.oid === node.oid)
  if (findIndex) {
    state.workspace.nodes[findIndex] = node
  } else {
    debug('updateNode NOTHING TO UPDATE create')
    state.workspace.nodes.push(node)
  }
  debug('updateNode done')
}

export function deleteNode(state, oid) {
  debug('deleteNode')
  let nodes = state.workspace.nodes
  if (nodes.includes(oid)) {
    debug('deleteNode start')
    state.workspace.nodes = nodes.filter(n => n.oid !== oid)
  } else {
    debug('no such node!')
  }
}
