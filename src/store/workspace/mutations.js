import assert from 'assert'

const debug = require('debug')('$workspace:mutation')
debug.enabled = true

export function init(state, workspace) {
  state.workspace = workspace
  state.initialized = true
}

export function stateSet(state, [key, val]) {
  assert.ok(state.hasOwnProperty(key))
  state[key] = val
}

// bookmark
export const addWSBookmark = (state, bookmark) => {
  debug('addWSBookmark start')
  state.workspace.bookmarks.push(bookmark)
  debug('addWSBookmark done')
}
export const deleteWSBookmark = (state, uid) => {
  debug('deleteWSBookmark start')
  let i = state.workspace.bookmarks.findIndex(b => b.uid === uid)
  state.workspace.bookmarks.splice(i, 1)
  debug('deleteWSBookmark done')
}
export const updateWSBookmark = (state, bookmark) => {
  debug('updateWSBookmark start')
  let i = state.workspace.bookmarks.findIndex(b => b.uid === bookmark.uid)
  state.workspace.bookmarks[i] = bookmark
  debug('updateWSBookmark done')
}

// content
export const addWSContent = (state, content) => {
  debug('addWSContent start')
  state.workspace.contents.push(content)
  debug('addWSContent done')
}
export const deleteWSContent = (state, uid) => {
  debug('deleteWSContenet start')
  let i = state.workspace.contents.findIndex(c => c.uid === uid)
  state.workspace.contents.splice(i, 1)
  debug('deleteWSContent done')
}
export const updateWSContent = (state, content) => {
  debug('updateWSContent start')
  let i = state.workspace.contents.findIndex(c => c.uid === content.uid)
  state.workspace.contents[i] = content
  debug('updateWSContent done')
}

// fragment
export const addWSFragment = (state, fragment) => {
  debug('addWSFragment start')
  state.workspace.fragments.push(fragment)
  debug('addWSFragment done')
}
export const deleteWSFragment = (state, fragment) => {
  debug('deleteWSFragment start')
  if (!fragment.uid) return
  let i = state.workspace.fragments.findIndex(f => f.uid === fragment.uid)
  state.workspace.fragments.splice(i, 1)
  debug('deleteWSFragment done')
}
export const updateWSFragment = (state, fragment) => {
  debug('updateWSFragment start')
  if (!fragment.uid) return
  let i = state.workspace.fragments.findIndex(f => f.uid === fragment.uid)
  state.workspace.fragments[i] = fragment
  debug('updateWSFragment done')
}

// draft
export const addWSNode = (state, draft) => {
  debug('addWSNode start')
  state.workspace.nodes.push(draft)
  debug('addWSNode done')
}
export const deleteWSNode = (state, draft) => {
  debug('deleteWSNode start')
  if (!draft.uid) return
  let i = state.workspace.nodes.findIndex(d => d.uid === draft.uid)
  state.workspace.nodes.splice(i, 1)
  debug('deleteWSNode done')
}
export const updateWSNode = (state, draft) => {
  debug('updateWSNode start')
  if (!draft.uid) return
  let i = state.workspace.nodes.findIndex(d => d.uid === draft.uid)
  state.workspace.nodes[i] = draft
  debug('updateWSNode done')
}

// tag
export const addWSSphere = (state, tag) => {
  debug('addWSSphere start')
  state.workspace.spheres.push(tag)
  debug('addWSSphere done')
}
export const deleteWSSphere = (state, uid) => {
  debug('deleteWSSphere start', uid)
  let i = state.workspace.spheres.findIndex(t => t.uid === uid)
  state.workspace.spheres.splice(i, 1)
  // TODO: delete this tag from all contents drafts and nodes
  debug('deleteWSSphere done')
}
export const updateWSSphere = (state, tag) => {
  debug('updateWSSphere start')
  let i = state.workspace.spheres.findIndex(t => t.uid === tag.uid)
  state.workspace.spheres[i] = tag
  debug('updateWSSphere done')
}
