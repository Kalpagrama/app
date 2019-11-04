const debug = require('debug')('$workspace:action')
debug.enabled = true
import {apollo} from 'boot/apollo'

const content = gql`
  fragment content on Object {
    oid
    type
    name
    thumbUrl(preferWidth: 600)
    ... on Video {
      url
      urlOriginal
      duration
      width
      height
    }
    ... on Image {
      url
      urlOriginal
      width
      height
    }
  }
`

const WSContent = gql`
  ${content}
  fragment WSContent on WSContent {
    uid
    name
    tagUids
    createdAt
    updatedAt
    content {
      ...content
    }
  }
`
const WSFragment = gql`
  fragment WSFragment on WSFragment {
    uid
    name
    # relativePoints {x y z}
    thumbUrl(preferWidth: 600)
    relativeCuts {type name start end thumbUrl(preferWidth: 600)}
    relativeScale
    tagUids
    createdAt
    updatedAt
    content {
      ...content
    }
  }
  ${content}
`
const WSDraft = gql`
  ${WSFragment}
  fragment WSDraft on WSDraft {
    uid
    name
    tagUids
    createdAt
    updatedAt
    spheres { oid type name }
    fragments {
      ...WSFragment
    }
  }
`
const WSBookmark = gql`
  fragment WSBookmark on WSBookmark {
    uid
    type
    name
    url
    thumbUrl(preferWidth: 600)
    tagUids
    createdAt
    updatedAt
  }
`
const WSTag = gql`
  fragment WSTag on WSTag {
    uid
    name
    color
    icon
    createdAt
    updatedAt
  }
`

export const userWorkspace = async (state) => {
  debug('userWorkspace start')
  let {data: {userWorkspace}} = await apollo.query({
    query: gql`
      ${WSContent} ${WSFragment} ${WSBookmark} ${WSTag} ${WSDraft}
      query userWorkspace {
        userWorkspace {
          drafts { ...WSDraft }
          fragments { ...WSFragment }
          contents { ...WSContent }
          bookmarks { ...WSBookmark }
          tags { ...WSTag }
        }
      }
    `
  })
  debug('userWorkspace', userWorkspace)
  state.commit('state', ['workspace', userWorkspace])
  return userWorkspace
}

// bookmark
export const addWSBookmark = async (store, bookmark) => {
  debug('addWSBookmark start')
  let {data: {addWSBookmark}} = await apollo.mutate({
    mutation: gql`
      ${WSBookmark}
      mutation addWSBookmark ($bookmark: WSBookmarkInput!) {
        addWSBookmark (bookmark: $bookmark) {
          ...WSBookmark
        }
      }
    `,
    variables: {
      bookmark: bookmark
    }
  })
  debug('addWSBookmark done', addWSBookmark)
  store.commit('addWSBookmark', addWSBookmark)
  return addWSBookmark
}
export const deleteWSBookmark = async (store, uid) => {
  debug('deleteWSBookmark start')
  let {data: {deleteWSBookmark}} = await apollo.mutate({
    mutation: gql`
      mutation deleteWSBookmark ($uid: String!) {
        deleteWSBookmark(uid: $uid)
      }
    `,
    variables: {
      uid: uid
    }
  })
  debug('deleteWSBookmark done', deleteWSBookmark)
  store.commit('deleteWSBookmark', uid)
  return deleteWSBookmark
}
export const updateWSBookmark = async (store, bookmark) => {
  debug('updateWSBookmark start')
  let {data: {updateWSBookmark}} = await apollo.mutate({
    mutation: gql`
      ${WSBookmark}
      mutation updateWSBookmark ($uid: String!, $bookmark: WSBookmarkInput!) {
        updateWSBookmark(uid: $uid, bookmark: $bookmark) {
          ...WSBookmark
        }
      }
    `,
    variables: {
      uid: bookmark.uid,
      bookmark: {
        name: bookmark.name,
        url: bookmark.url,
        tagUids: bookmark.tagUids
      }
    }
  })
  debug('updateWSBookmark done', updateWSBookmark)
  store.commit('updateWSBookmark', bookmark)
  return updateWSBookmark
}

// content
export const addWSContent = async (store, content) => {
  debug('addWSContent start')
  // check existance
  let i = store.state.workspace.contents.find(c => c.content.oid === content.content.oid)
  // debug('i', i)
  if (i) {
    debug('addWSContent done', i)
    return i
  } else {
    let {data: {addWSContent}} = await apollo.mutate({
      mutation: gql`
        ${WSContent}
        mutation addWSContent ($content: WSContentInput!) {
          addWSContent (content: $content) {
            ...WSContent
          }
        }
      `,
      variables: {
        content: {
          oid: content.content.oid,
          name: content.name || '',
          tagUids: content.tagsUids || []
        }
      }
    })
    debug('addWSContent done', addWSContent)
    store.commit('addWSContent', addWSContent)
    return addWSContent
  }
}
export const updateWSContent = async (store, content) => {
  debug('updateWSContent start')
  let {data: {updateWSContent}} = await apollo.mutate({
    mutation: gql`
      ${WSContent}
      mutation updateWSContent ($uid: String!, $content: WSContentInput!) {
        updateWSContent (uid: $uid, content: $content) {
          ...WSContent
        }
      }
    `,
    variables: {
      uid: content.uid,
      content: content
    }
  })
  debug('updateWSContent done', updateWSContent)
  store.commit('updateWSContent', updateWSContent)
  return updateWSContent
}
export const deleteWSContent = async (store, uid) => {
  debug('deleteWSContent start')
  let {data: {deleteWSContent}} = await apollo.mutate({
    mutation: gql`
      mutation deleteWSContent ($uid: String!) {
        deleteWSContent (uid: $uid)
      }
    `,
    variables: {
      uid: uid
    }
  })
  debug('deleteWSContent done', deleteWSContent)
  store.commit('deleteWSContent', uid)
  return deleteWSContent
}

// fragment
export const addWSFragment = async (store, fragment) => {
  debug('addWSFragment start', fragment)
  // if (fragment.uid) return
  let i = store.state.workspace.fragments.find(c => c.uid === fragment.uid)
  if (i) {
    debug('addWSFragment done', i)
    return i
  } else {
    // TODO: make it perfect
    let fragmentInput = {
      name: fragment.name,
      tagUids: fragment.tagUids,
      // thumbUrl: fragment.thumbUrl,
      // relativePoints: fragment.relativePoints.map(p => ({x: p.x, y: p.y, z: p.z})),
      relativeCuts: fragment.relativePoints.reduce((acc, val, i, arr) => {
        // name type start end
        if ((i + 1) % 2 !== 0) {
          acc.push({
            name: '',
            start: val.x,
            end: arr[i + 1].x,
            type: 'video',
            thumb: ''
          })
        }
        return acc
      }, []),
      relativeScale: fragment.relativeScale,
      contentOid: fragment.content.oid
    }
    debug('fragmentInput', fragmentInput)
    let {data: {addWSFragment}} = await apollo.mutate({
      mutation: gql`
        ${WSFragment}
        mutation addWSFragment ($fragment: WSFragmentInput!) {
          addWSFragment (fragment: $fragment) {
            ...WSFragment
          }
        }
      `,
      variables: {
        fragment: fragmentInput
      }
    })
    debug('addWSFragment done', addWSFragment)
    store.commit('addWSFragment', addWSFragment)
    return addWSFragment
    // return null
  }
}
export const updateWSFragment = async (store, fragment) => {
  debug('updateWSFragment start')
  if (!fragment.uid) return
  let {data: {updateWSFragment}} = await apollo.mutate({
    mutation: gql`
      ${WSFragment}
      mutation updateWSFragment ($uid: String!, $fragment: WSFragmentInput!) {
        updateWSFragment (uid: $uid, fragment: $fragment) {
          ...WSFragment
        }
      }
    `,
    variables: {
      uid: fragment.uid,
      fragment: fragment
    }
  })
  debug('updateWSFragment done', updateWSFragment)
  store.commit('updateWSFragment', updateWSFragment)
  return updateWSFragment
}
export const deleteWSFragment = async (store, fragment) => {
  debug('deleteWSFragment start')
  if (!fragment.uid) return
  let {data: {deleteWSFragment}} = await apollo.mutate({
    mutation: gql`
      mutation deleteWSFragment ($uid: String!) {
        deleteWSFragment (uid: $uid)
      }
    `,
    variables: {
      uid: fragment.uid
    }
  })
  debug('deleteWSFragment done', deleteWSFragment)
  store.commit('deleteWSFragment', fragment)
}

// tag
export const addWSTag = async (store, tag) => {
  debug('addWSTag start')
  let {data: {addWSTag}} = await apollo.mutate({
    mutation: gql`
      ${WSTag}
      mutation addWSTag ($tag: WSTagInput!) {
        addWSTag (tag: $tag) {
          ...WSTag
        }
      }
    `,
    variables: {
      tag: tag
    }
  })
  store.commit('addWSTag', addWSTag)
  debug('addWSTag done', addWSTag)
  return addWSTag
}
export const updateWSTag = async (store, tag) => {
  debug('updateWSTag start')
  let {data: {updateWSTag}} = await apollo.mutate({
    mutation: gql`
      ${WSTag}
      mutation updateWSTag ($uid: String!, $tag: WSTagInput!) {
        updateWSTag (uid: $uid, tag: $tag) {
          ...WSTag
        }
      }
    `,
    variables: {
      uid: tag.uid,
      tag: {
        name: tag.name,
        color: tag.color,
        icon: tag.icon
      }
    }
  })
  store.commit('updateWSTag', updateWSTag)
  debug('updateWSTag done', updateWSTag)
  return updateWSTag
}
export const deleteWSTag = async (store, uid) => {
  debug('deleteWSTag start', uid)
  let {data: {deleteWSTag}} = await apollo.mutate({
    mutation: gql`
      mutation deleteWSTag ($uid: String!) {
        deleteWSTag (uid: $uid)
      }
    `,
    variables: {
      uid: uid
    }
  })
  store.commit('deleteWSTag', uid)
  // TODO: delete this tag from all tagUids
  debug('deleteWSTag done')
  return deleteWSTag
}

// draft
export const addWSDraft = async (store, draft) => {
  debug('addWSDraft start')
  if (!draft) return
  let {data: {addWSDraft}} = await apollo.mutate({
    mutation: gql`
      ${WSDraft}
      mutation addWSDraft ($draft: WSDraftInput!) {
        addWSDraft (draft: $draft) {
          ...WSDraft
        }
      }
    `,
    variables: {
      draft: {
        name: draft.name || Date.now().toString(),
        fragments: draft.fragments || [],
        categories: draft.categories || [],
        spheres: draft.spheres || [],
        tagUids: draft.tagUids || []
      }
    }
  })
  debug('addWSDraft done')
  store.commit('addWSDraft', addWSDraft)
  debug('addWSDraft', addWSDraft)
  return addWSDraft
}
export const updateWSDraft = async (store, draft) => {
  debug('updateWSDraft start')
  if (!draft) return
  let {data: {updateWSDraft}} = await apollo.mutate({
    mutation: gql`
      ${WSDraft}
      mutation updateWSDraft ($uid: String!, $draft: WSDraftInput!) {
        updateWSDraft (uid: $uid, draft: $draft) {
          ...WSDraft
        }
      }
    `,
    variables: {
      uid: draft.uid,
      draft: {
        name: draft.name,
        fragments: draft.fragments,
        spheres: draft.spheres,
        tagUids: draft.tagUids
      }
    }
  })
  debug('updateWSDraft done', updateWSDraft)
  store.commit('updateWSDraft', updateWSDraft)
  return updateWSDraft
}
export const deleteWSDraft = async (store, draft) => {
  debug('deleteWSDraft start')
  if (!draft.uid) return
  let {data: {deleteWSDraft}} = await apollo.mutate({
    mutation: gql`
      mutation deleteWSDraft ($uid: String!) {
        deleteWSDraft (uid: $uid)
      }
    `,
    variables: {
      uid: draft.uid
    }
  })
  debug('deleteWSDraft done', deleteWSDraft)
  store.commit('deleteWSDraft', draft)
  return deleteWSDraft
}
