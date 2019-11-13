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
const WSDraftFragment = gql`
  ${WSFragmentFragment}
  fragment WSDraftFragment on WSDraft {
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
const WSTagFragment = gql`
  fragment WSTagFragment on WSTag {
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

const userFragment = gql`
  fragment userFragment on User {
    oid
    name
    thumbUrl(preferWidth: 600)
    weightVal
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
    author{
      name
    }
  }
`

const fragments = {
  eventFragment,
  contentFragment,
  WSContentFragment,
  WSFragmentFragment,
  WSDraftFragment,
  WSBookmarkFragment,
  WSTagFragment,
  userFragment,
  objectShortFragment,
  nodeFragment
}

export {
  fragments
}
