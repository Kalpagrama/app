const debug = require('debug')('$workspace:mutations')
debug.enabled = true

export function state(state, [key, val]) {
  if (val) {
    state[key] = val
  } else {
    return state[key]
  }
}

export function addNode(state, node) {
  debug('addNode start')
  // add only unique node
  let findNode = state.workspace.nodes.find(n => n.oid === node.oid)
  if (findNode) {
    debug('addNode duplicate!')
  } else {
    debug('addNode add')
    state.workspace.nodes.push(node)
  }
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
