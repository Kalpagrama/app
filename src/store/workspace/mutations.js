const debug = require('debug')('$workspace:mutation')
debug.enabled = true

export function init(state, workspace) {
  state.workspace = workspace
  state.initialized = true
}

export function state(state, [key, val]) {
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
export const addWSDraft = (state, draft) => {
  debug('addWSDraft start')
  state.workspace.drafts.push(draft)
  debug('addWSDraft done')
}
export const deleteWSDraft = (state, draft) => {
  debug('deleteWSDraft start')
  if (!draft.uid) return
  let i = state.workspace.drafts.findIndex(d => d.uid === draft.uid)
  state.workspace.drafts.splice(i, 1)
  debug('deleteWSDraft done')
}
export const updateWSDraft = (state, draft) => {
  debug('updateWSDraft start')
  if (!draft.uid) return
  let i = state.workspace.drafts.findIndex(d => d.uid === draft.uid)
  state.workspace.drafts[i] = draft
  debug('updateWSDraft done')
}

// tag
export const addWSTag = (state, tag) => {
  debug('addWSTag start')
  state.workspace.tags.push(tag)
  debug('addWSTag done')
}
export const deleteWSTag = (state, uid) => {
  debug('deleteWSTag start', uid)
  let i = state.workspace.tags.findIndex(t => t.uid === uid)
  state.workspace.tags.splice(i, 1)
  // TODO: delete this tag from all contents drafts and nodes
  debug('deleteWSTag done')
}
export const updateWSTag = (state, tag) => {
  debug('updateWSTag start')
  let i = state.workspace.tags.findIndex(t => t.uid === tag.uid)
  state.workspace.tags[i] = tag
  debug('updateWSTag done')
}
