const debug = require('debug')('$workspace:action')
debug.enabled = true
import { apolloProvider } from 'boot/apollo'
import { fragments } from 'schema/index'

export const init = async (context, userWorkspace) => {
  // if (context.getters.initialized) throw new Error('events state initialized already')
  if (context.getters.initialized) return
  debug('userWorkspace init. userWorkspace=', userWorkspace)
  context.commit('init', userWorkspace)
  return userWorkspace
}

// bookmark
export const addWSBookmark = async (context, bookmark) => {
  debug('addWSBookmark start')
  let { data: { addWSBookmark } } = await apolloProvider.clients.apiApollo.mutate({
    mutation: gql`
      ${fragments.WSBookmarkFragment}
      mutation addWSBookmark ($bookmark: WSBookmarkInput!) {
        addWSBookmark (bookmark: $bookmark) {
          ...WSBookmarkFragment
        }
      }
    `,
    variables: {
      bookmark: bookmark
    }
  })
  debug('addWSBookmark done', addWSBookmark)
  // context.commit('addWSBookmark', addWSBookmark)
  return addWSBookmark
}
export const deleteWSBookmark = async (store, uid) => {
  debug('deleteWSBookmark start')
  let { data: { deleteWSBookmark } } = await apolloProvider.clients.apiApollo.mutate({
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
  let { data: { updateWSBookmark } } = await apolloProvider.clients.apiApollo.mutate({
    mutation: gql`
      ${fragments.WSBookmarkFragment}
      mutation updateWSBookmark ($uid: String!, $bookmark: WSBookmarkInput!) {
        updateWSBookmark(uid: $uid, bookmark: $bookmark) {
          ...WSBookmarkFragment
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
export const addWSContent = async (context, content) => {
  debug('addWSContent start')
  // check existance
  let i = context.state.workspace.contents.find(c => c.content.oid === content.content.oid)
  // debug('i', i)
  if (i) {
    debug('addWSContent done', i)
    return i
  } else {
    let { data: { addWSContent } } = await apolloProvider.clients.apiApollo.mutate({
      mutation: gql`
        ${fragments.WSContentFragment}
        mutation addWSContent ($content: WSContentInput!) {
          addWSContent (content: $content) {
            ...WSContentFragment
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
    // context.commit('addWSContent', addWSContent)
    return addWSContent
  }
}
export const updateWSContent = async (context, content) => {
  debug('updateWSContent start')
  let { data: { updateWSContent } } = await apolloProvider.clients.apiApollo.mutate({
    mutation: gql`
      ${fragments.WSContentFragment}
      mutation updateWSContent ($uid: String!, $content: WSContentInput!) {
        updateWSContent (uid: $uid, content: $content) {
          ...WSContentFragment
        }
      }
    `,
    variables: {
      uid: content.uid,
      content: content
    }
  })
  debug('updateWSContent done', updateWSContent)
  // context.commit('updateWSContent', updateWSContent)
  return updateWSContent
}
export const deleteWSContent = async (context, uid) => {
  debug('deleteWSContent start')
  let { data: { deleteWSContent } } = await apolloProvider.clients.apiApollo.mutate({
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
  // context.commit('deleteWSContent', uid)
  return deleteWSContent
}

// fragment
export const addWSFragment = async (context, fragment) => {
  debug('addWSFragment start', fragment)
  // if (fragment.uid) return
  let i = context.state.workspace.fragments.find(c => c.uid === fragment.uid)
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
    let { data: { addWSFragment } } = await apolloProvider.clients.apiApollo.mutate({
      mutation: gql`
        ${fragments.WSFragmentFragment}
        mutation addWSFragment ($fragment: WSFragmentInput!) {
          addWSFragment (fragment: $fragment) {
            ...WSFragmentFragment
          }
        }
      `,
      variables: {
        fragment: fragmentInput
      }
    })
    debug('addWSFragment done', addWSFragment)
    // context.commit('addWSFragment', addWSFragment)
    return addWSFragment
    // return null
  }
}
export const updateWSFragment = async (context, fragment) => {
  debug('updateWSFragment start')
  if (!fragment.uid) return
  let { data: { updateWSFragment } } = await apolloProvider.clients.apiApollo.mutate({
    mutation: gql`
      ${fragments.WSFragmentFragment}
      mutation updateWSFragment ($uid: String!, $fragment: WSFragmentInput!) {
        updateWSFragment (uid: $uid, fragment: $fragment) {
          ...WSFragmentFragment
        }
      }
    `,
    variables: {
      uid: fragment.uid,
      fragment: fragment
    }
  })
  debug('updateWSFragment done', updateWSFragment)
  // context.commit('updateWSFragment', updateWSFragment)
  return updateWSFragment
}
export const deleteWSFragment = async (context, fragment) => {
  debug('deleteWSFragment start')
  if (!fragment.uid) return
  let { data: { deleteWSFragment } } = await apolloProvider.clients.apiApollo.mutate({
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
  // context.commit('deleteWSFragment', fragment)
}

// tag
export const addWSSphere = async (context, tag) => {
  debug('addWSSphere start')
  let { data: { addWSSphere } } = await apolloProvider.clients.apiApollo.mutate({
    mutation: gql`
      ${fragments.WSSphereFragment}
      mutation addWSSphere ($tag: WSSphereInput!) {
        addWSSphere (tag: $tag) {
          ...WSSphereFragment
        }
      }
    `,
    variables: {
      tag: tag
    }
  })
  // context.commit('addWSSphere', addWSSphere)
  debug('addWSSphere done', addWSSphere)
  return addWSSphere
}
export const updateWSSphere = async (context, tag) => {
  debug('updateWSSphere start')
  let { data: { updateWSSphere } } = await apolloProvider.clients.apiApollo.mutate({
    mutation: gql`
      ${fragments.WSSphereFragment}
      mutation updateWSSphere ($uid: String!, $tag: WSSphereInput!) {
        updateWSSphere (uid: $uid, tag: $tag) {
          ...WSSphereFragment
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
  // context.commit('updateWSSphere', updateWSSphere)
  debug('updateWSSphere done', updateWSSphere)
  return updateWSSphere
}
export const deleteWSSphere = async (context, uid) => {
  debug('deleteWSSphere start', uid)
  let { data: { deleteWSSphere } } = await apolloProvider.clients.apiApollo.mutate({
    mutation: gql`
      mutation deleteWSSphere ($uid: String!) {
        deleteWSSphere (uid: $uid)
      }
    `,
    variables: {
      uid: uid
    }
  })
  // context.commit('deleteWSSphere', uid)
  // TODO: delete this tag from all tagUids
  debug('deleteWSSphere done')
  return deleteWSSphere
}

// draft
export const addWSNode = async (context, draft) => {
  debug('addWSNode start')
  if (!draft) return
  let { data: { addWSNode } } = await apolloProvider.clients.apiApollo.mutate({
    mutation: gql`
      ${fragments.WSNodeFragment}
      mutation addWSNode ($draft: WSNodeInput!) {
        addWSNode (draft: $draft) {
          ...WSNodeFragment
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
  debug('addWSNode done')
  // context.commit('addWSNode', addWSNode)
  debug('addWSNode', addWSNode)
  return addWSNode
}
export const updateWSNode = async (context, draft) => {
  debug('updateWSNode start')
  if (!draft) return
  let { data: { updateWSNode } } = await apolloProvider.clients.apiApollo.mutate({
    mutation: gql`
      ${fragments.WSNodeFragment}
      mutation updateWSNode ($uid: String!, $draft: WSNodeInput!) {
        updateWSNode (uid: $uid, draft: $draft) {
          ...WSNodeFragment
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
  debug('updateWSNode done', updateWSNode)
  // context.commit('updateWSNode', updateWSNode)
  return updateWSNode
}
export const deleteWSNode = async (context, draft) => {
  debug('deleteWSNode start')
  if (!draft.uid) return
  let { data: { deleteWSNode } } = await apolloProvider.clients.apiApollo.mutate({
    mutation: gql`
      mutation deleteWSNode ($uid: String!) {
        deleteWSNode (uid: $uid)
      }
    `,
    variables: {
      uid: draft.uid
    }
  })
  debug('deleteWSNode done', deleteWSNode)
  // context.commit('deleteWSNode', draft)
  return deleteWSNode
}
