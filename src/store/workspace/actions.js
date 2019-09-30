const debug = require('debug')('$workspace:action')
debug.enabled = true
var apollo = null

export const userWorkspace = async (state, a) => {
  debug('userWorkspace start')
  if (!apollo) apollo = a
  let {data: {userWorkspace}} = await a.query({
    query: gql`
      query userWorkspace {
        userWorkspace {
          drafts {
            uid
            name
            tagUids
            createdAt
            updatedAt
            spheres {
              oid
              type
              name
            }
          }
          tags {
            uid
            name
            color
            icon
            createdAt
            updatedAt
          }
          bookmarks {
            uid
            type
            name
            url
            thumbUrl(preferWidth: 600)
            tagUids
            createdAt
            updatedAt
          }
          fragments {
            uid
            name
            thumbUrl(preferWidth: 600)
            relativePoints {x y z}
            relativeScale
            tagUids
            contentUid
          }
          contents {
            uid
            name
            tagUids
            content {
              oid
              type
              name
              thumbUrl(preferWidth: 600)
              ... on Video {
                url
                urlOriginal
                duration
              }
              ... on Image {
                url
                urlOriginal
              }
            }
          }
        }
      }
    `
  })
  debug('userWorkspace', userWorkspace)
  state.commit('state', ['workspace', userWorkspace])
  return userWorkspace
}

export const addWSBookmark = async (store, bookmark) => {
  debug('addWSBookmark start')
  let {data: {addWSBookmark}} = await apollo.mutate({
    mutation: gql`
      mutation addWSBookmark ($bookmark: WSBookmarkInput!) {
        addWSBookmark (bookmark: $bookmark) {
          uid
          type
          name
          url
          thumbUrl(preferWidth: 600)
          tagUids
          createdAt
          updatedAt
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
      mutation updateWSBookmark ($uid: String!, $bookmark: WSBookmarkInput!) {
        updateWSBookmark(uid: $uid, bookmark: $bookmark) {
          uid
          type
          name
          url
          createdAt
          thumbUrl(preferWidth: 600)
          updatedAt
          tagUids
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

export const addWSContent = async (store, content) => {
  debug('addWSContent start')
  let {data: {addWSContent}} = await apollo.mutate({
    mutation: gql`
      mutation addWSContent ($content: WSContentInput!) {
        addWSContent (content: $content) {
          uid
          name
          tagUids
          thumbUrl(preferWidth: 600)
          createdAt
          updatedAt
          content {
            oid
            type
            thumbUrl(preferWidth: 600)
            name
            ... on Video {
              duration
              url
              urlOriginal
            }
            ... on Image {
              url
              urlOriginal
            }
          }
        }
      }
    `,
    variables: {
      content: {oid: content.oid}
    }
  })
  debug('addWSContent done', addWSContent)
  store.commit('addWSContent', addWSContent)
  return addWSContent
}

export const updateWSContent = async (store, content) => {
  debug('updateWSContent start')
  let r = await apollo.mutate({
    mutation: gql`
      mutation updateWSContent ($uid: String!, $content: WSContentInput!) {uid}
    `,
    variables: {
      uid: content.uid,
      content: content
    }
  })
  debug('updateWSContent done')
  store.commit('updateWSContent', content)
  return true
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

export const addWSTag = async (store, tag) => {
  debug('addWSTag start')
  let {data: {addWSTag}} = await apollo.mutate({
    mutation: gql`
      mutation addWSTag ($tag: WSTagInput!) {
        addWSTag (tag: $tag) {
          uid
          name
          color
          icon
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
      mutation updateWSTag ($uid: String!, $tag: WSTagInput!) {
        updateWSTag (uid: $uid, tag: $tag) {
          uid
          name
          color
          icon
          createdAt
          updatedAt
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
