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
          tags {uid name color icon}
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
          nodes {
            uid
            name
            tagUids
            node {
              oid
              type
              name
              author {
                oid
                type
                name
                thumbUrl(preferWidth:600)
              }
              fragments {
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
                uid
                label
                relativePoints { x y z }
                relativeScale
                url
              }
              spheres {oid type name }
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

export const addWSNode = async (state, node) => {
  debug('addWSNode start', node)
  // prepare input
  let input = {
    oid: node.oid,
    name: node.name,
    spheres: node.spheres,
    fragments: node.fragments.map(f => {
      return {
        oid: f.content.oid,
        tags: f.tags || ['other'],
        relativePoints: f.relativePoints,
        relativeScale: f.relativeScale
      }
    }),
    tags: node.tags || ['other']
  }
  let r = await apollo.mutate({
    mutation: gql`
      mutation addWSNode ($node: WSNodeInput!) {
        addWSNode(node: $node)
      }
    `,
    variables: {
      node: input
    }
  })
  debug('r', r)
  // add to store
}

export const deleteWSNode = async (state, node) => {
  debug('deleteWSNode start')
  let r = await apollo.mutate({
    mutation: gql`
      mutation deleteWSNode ($uid: String!)
    `,
    variables: {
      uid: node.uid
    }
  })
  debug('deleteWSNode done', r)
  // delete from the store
}

export const updateWSNode = async (state, node) => {
  debug('updateWSNode start')
  let r = await apollo.mutate({
    mutation: gql`
      mutation updateWSNode ($uid: String!, $node: WSNodeInput!)
    `,
    variables: {
      uid: node.uid,
      node: node
    }
  })
  debug('updateWSNode done', r)
  // TODO: update in state
}

export const addWSContent = async (store, content) => {
  debug('addWSContent start')
  let {data: {addWSContent}} = await apollo.mutate({
    mutation: gql`
      mutation addWSContent ($content: WSContentInput!) {
        addWSContent (content: $content) {
          uid
          urlOriginal
          name
          tagUids
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

export const deleteWSContent = async (store, content) => {
  debug('deleteWSContent start')
  debug('deleteWSContent done')
  // TODO: delete from state
  // return r
}

export const addWSTag = async (store, tag) => {
  debug('addWSTag start')
  let {data: {addWSTag}} = await apollo.mutate({
    mutation: gql`
      mutation addWSTag ($tag: WSTagInput) {
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
}

export const updateWSTag = async (store, tag) => {
  debug('updateWSTag start')
  let {data: {updateWSTag}} = await apollo.mutate({
    mutation: gql`
      mutation updateWSTag ($uid: String!, $tag: WSTagInput) {
        uid
        name
        color
        icon
      }
    `,
    variables: {
      uid: tag.uid,
      tag: tag
    }
  })
  store.commit('updateWSTag', tag)
  debug('updateWSTag done')
}

export const deleteWSTag = async (store, tag) => {
  debug('deleteWSTag start')
  let {data: {deleteWSTag}} = await apollo.mutate({
    mutation: gql`
      mutation deleteWSTag ($uid: String!) {
        uid
      }
    `
  })
  store.commit('deleteWSTag', tag)
  // TODO: delete this tag from all tagUids
  debug('deleteWSTag done')
}
