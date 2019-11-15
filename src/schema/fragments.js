const contentFragment = gql`
  fragment contentFragment on Object {
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
      frameUrls
    }
    ... on Image {
      url
      urlOriginal
      width
      height
    }
  }
`
const WSContentFragment = gql`
  ${contentFragment}
  fragment WSContentFragment on WSContent {
    uid
    name
    tagUids
    createdAt
    updatedAt
    content {
      ...contentFragment
    }
  }
`
const WSFragmentFragment = gql`
  fragment WSFragmentFragment on WSFragment {
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
      ...contentFragment
    }
  }
  ${contentFragment}
`
const WSNodeFragment = gql`
  ${WSFragmentFragment}
  fragment WSNodeFragment on WSNode {
    uid
    name
    tagUids
    createdAt
    updatedAt
    spheres { oid type name }
    fragments {
      ...WSFragmentFragment
    }
  }
`
const WSBookmarkFragment = gql`
  fragment WSBookmarkFragment on WSBookmark {
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
const WSSphereFragment = gql`
  fragment WSSphereFragment on WSSphere {
    uid
    name
    color
    icon
    createdAt
    updatedAt
  }
`
const eventFragment = gql`
  fragment eventFragment on Event {
    type
    subject{
      oid
      name
      thumbUrl(preferWidth: 600)
    }
    object{
      oid
      name
      thumbUrl(preferWidth: 600)
      meta{
        type
        ...on MetaNode{
          layout
          fragments{
            uid
          }
        }
      }
    }
  }
`
const objectShortFragment = gql`
  fragment objectShortFragment on ObjectShort {
    type
    oid
    name
    thumbUrl(preferWidth: 600)
  }
`
const nodeFragment = gql`
  fragment nodeFragment on Node {
    type
    oid
    name
    thumbUrl(preferWidth: 600)
    rate
    rateUser
    viewCnt
    author {
      oid
      type
      name
      thumbUrl(preferWidth: 50)
    }
    spheres {
      oid
      name
    }
    categories
    fragments {
      uid
      name
      url
      content {
        oid
        type
        name
        thumbUrl(preferWidth: 600)
        ...on Video {
          url
          urlType
          width
          height
          duration
        }
        ...on Image {
          url
        }
      }
      relativePoints { x y z }
      relativeScale
    }
    meta {
      ...on MetaNode {
        layout
        fragments { uid width height color thumbUrl(preferWidth: 600) }
      }
    }
  }
`
const sphereFragment = gql`
  fragment sphereFragment on Object {
    oid
    type
    name
    thumbUrl(preferWidth: 600)
  }
`
const userFragment = gql`
  ${objectShortFragment} ${eventFragment} ${WSNodeFragment} ${WSFragmentFragment} ${WSContentFragment} ${WSBookmarkFragment} ${WSSphereFragment}
  fragment userFragment on User {
    oid
    name
    thumbUrl(preferWidth: 600)
    weightVal
    settings
    subscriptions{...objectShortFragment}
    workspace{
      nodes { ...WSNodeFragment }
      fragments { ...WSFragmentFragment }
      contents { ...WSContentFragment }
      bookmarks { ...WSBookmarkFragment }
      spheres { ...WSSphereFragment }
    }
    events{...eventFragment}
    profile{
      city
      country
      dateBirth
      gender
      lang
      nameFirst
      nameFull
      nameSecond
    }
  }
`
const fragments = {
  eventFragment,
  contentFragment,
  WSContentFragment,
  WSFragmentFragment,
  WSNodeFragment,
  WSBookmarkFragment,
  WSSphereFragment,
  userFragment,
  objectShortFragment,
  nodeFragment,
  sphereFragment
}

export {
  fragments
}
