
export const initialized = (state, getters) => {
  return state.initialized
}

export const WSItems = (state, getters) => {
  return [
    ...state.workspace.bookmarks,
    ...state.workspace.contents,
    ...state.workspace.fragments
  ]
}

export const bookmarks = (state, getters) => {
  return state.workspace.bookmarks.reduce((acc, val) => {
    acc[val.uid] = val
    return acc
  }, {})
}

export const bookmarksCount = (state, getters) => {
  return state.workspace.bookmarks.length
}

export const contents = (state, getters) => {
  return state.workspace.contents.reduce((acc, val) => {
    acc[val.uid] = val
    return acc
  }, {})
}

export const contentsCount = (state, getters) => {
  return state.workspace.contents.length
}

export const fragments = (state, getters) => {
  return state.workspace.fragments.reduce((acc, val) => {
    acc[val.uid] = val
    return acc
  }, {})
}

export const fragmentsCount = (state, getters) => {
  return state.workspace.fragments.length
}

export const tags = (state, getters) => {
  return state.workspace.tags.reduce((acc, val) => {
    acc[val.uid] = val
    return acc
  }, {})
}

export const tagsCount = (state, getters) => {
  return state.workspace.tags.length
}

export const drafts = (state, getters) => {
  return state.workspace.drafts.reduce((acc, val) => {
    acc[val.uid] = val
    return acc
  }, {})
}

export const draftsCount = (state, getters) => {
  return state.workspace.drafts.length
}
