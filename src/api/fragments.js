import gql from 'graphql-tag'

const metaStaticFragment = gql`
  fragment metaStaticCompositionFragment on MetaStaticComposition {
    thumbUrl(preferWidth: 600)
  }
  fragment metaStaticNodeFragment on MetaStaticNode {
    oid
    name
    layout
    author {
      oid
      type
      name
      thumbUrl(preferWidth: 50)
    }
    items{
      oid
      thumbUrl(preferWidth: 600)
      ...on Composition {
        oid
        url
        outputType
        layers {
          contentOid
          figuresAbsolute {
            t
          }
        }
      }
    }
  }
  fragment metaStaticFragment on MetaStatic {
    type
    ...on MetaStaticNode {... metaStaticNodeFragment}
    ... on MetaStaticJoint {
      jointType
      name
      sphereFromName{
        oid
        name
      }
      leftItem {
        type
        oid
        name
        thumbUrl(preferWidth: 600)
        createdAt
        metaStatic{
          ...on MetaStaticNode {... metaStaticNodeFragment}
        }
      }
      rightItem {
        type
        oid
        name
        thumbUrl(preferWidth: 600)
        createdAt
        metaStatic{
          ...on MetaStaticNode {... metaStaticNodeFragment}
        }
      }
    }
    ...on MetaStaticContent{
      type
      uploadedInfo
    }
    ... on MetaStaticComposition {...metaStaticCompositionFragment}
  }
`
const objectShortFragment = gql`
  fragment objectShortFragment on ObjectShort {
    type
    oid
    name
    thumbUrl(preferWidth: 600)
    createdAt
  }
`

const objectShortWithMetaStaticFragment = gql`
  ${metaStaticFragment}
  fragment objectShortWithMetaStaticFragment on ObjectShort {
    type
    oid
    name
    thumbUrl(preferWidth: 600)
    createdAt
    metaStatic{...metaStaticFragment}
  }
`

const objectFragment = gql`${metaStaticFragment} ${objectShortFragment}
  fragment objectFragment on Object {
    type
    oid
    name
    thumbUrl(preferWidth: 600)
    createdAt
    deletedAt
    subscriberCnt
    subscribers {...objectShortFragment}
    rev
  }
`

const sphereFragment = gql`${objectFragment}
  fragment sphereFragment on Object {
    ...objectFragment
  }
`
const videoFragment = gql`${objectFragment}
  fragment videoFragment on Video {
    ...objectFragment
    url
    urlOriginal
    duration
    frameUrls
    contentProvider
    contentSource
    contentProvider
  }
`
const imageFragment = gql`${objectFragment}
  fragment imageFragment on Image {
    ...objectFragment
    url
    urlOriginal
    contentProvider
    contentSource
  }
`
const compositionFragment = gql`${objectFragment} ${objectShortFragment} ${videoFragment} ${imageFragment}
  fragment figureFragment on Figure {
    t
    points {
      x
      y
    }
  }
  fragment operationFragment on LayerOperation{
    type
    items
    operations{
      type
      items
      operations{
        type
        items
        operations{
          type
          items
          operations{
            type
            items
            operations{
              type
              items
              operations{
                type
                items
                operations{
                  type
                  items
                  operations{
                    type
                    items
                    operations{
                      type
                      items
                      operations{
                        type
                        items
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  fragment compositionFragment on Composition {
    ...objectFragment
    operation {
      type
      operations {
        type
      }
      items
    }
    layers {
      contentOid
      figuresAbsolute{...figureFragment}
      figuresRelative {...figureFragment}
      speed
      name
      thumbUrl(preferWidth: 600)
      url
      contentSource
    }
    operation{... operationFragment}
    outputType
    url
    contentSource
  }
`
const jointFragment = gql` ${objectFragment} ${objectShortWithMetaStaticFragment} ${objectShortFragment}
  fragment jointFragment on Joint {
    ...objectFragment
    jointType
    leftItem {...objectShortWithMetaStaticFragment}
    rightItem {...objectShortWithMetaStaticFragment}
    rate
    weight
    rateUser
    viewCnt
    childrenCnt
  }
`
const nodeFragment = gql`${videoFragment} ${imageFragment} ${objectFragment} ${objectShortFragment}
  fragment nodeFragment on Node {
    ...objectFragment
    sphereFromName{...objectShortFragment}
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
    category
    layout
    items {...objectShortFragment}
  }
`

const eventFragment = gql`
  ${objectShortFragment} ${objectShortWithMetaStaticFragment}
  fragment eventFragment on Event {
    id
    createdAt
    type
    ... on EventError{
      operation
      code
      message
      subject{... objectShortFragment}
      object{... objectShortFragment}
    }
    ... on EventProgress{
      oid
      action
      progress
    }
    ... on EventNotice{
      typeNotice
      message
    }
    ... on EventWS{
      wsRevision
      wsItem
    }
    ... on EventObjectUpdate{
      subject{... objectShortFragment}
      object{... objectShortWithMetaStaticFragment}
      path
      value
      matter {reason subscription}
    }
    ... on EventGeneral{
      subject{... objectShortFragment}
      object{... objectShortWithMetaStaticFragment}
      matter {reason subscription}
    }
    ... on EventObjectCreateDelete{
      subject{... objectShortFragment}
      object{... objectShortWithMetaStaticFragment}
      sphereOids
      matter {reason subscription}
    }
    ... on EventObjectRate{
      subject{... objectShortFragment}
      object{... objectShortWithMetaStaticFragment}
      rate
      matter {reason subscription}
    }
  }
`
const userFragment = gql`
  ${objectShortFragment} ${nodeFragment} ${objectFragment}
  fragment userFragment on User {
    ...objectFragment
    username
    weightVal
    settings
    wsRevision
    wsVersion
    subscriptions{...objectShortFragment}
    profile{
      tutorial
      about
      status
      photoUrl
      coverUrl
      city
      country
      dateBirth
      gender
      lang
      nameFirst
      nameFull
      nameSecond
      role
      email
      phone
      password
    }
    sessions{
      token
      ip
      userAgent
    }
  }
`
const dummyUserFragment = gql`
  ${objectShortFragment}
  fragment dummyUserFragment on DummyUser {
    type
    thumbUrl(preferWidth: 600)
    name
    username
    settings
    subscriptions{...objectShortFragment}
    profile{
      tutorial
      about
      status
      photoUrl
      coverUrl
      city
      country
      dateBirth
      gender
      lang
      nameFirst
      nameFull
      nameSecond
      role
      email
      phone
      password
    }
  }
`
const objectFullFragment = gql`
  ${compositionFragment} ${videoFragment} ${imageFragment} ${nodeFragment}
  ${sphereFragment} ${userFragment} ${objectFragment} ${jointFragment}
  fragment objectFullFragment on Object {
    ...objectFragment
    ...on Video {...videoFragment}
    ...on Image {...imageFragment}
    ...on Node {... nodeFragment}
    ...on Sphere {... sphereFragment}
    ...on User {... userFragment}
    ...on Composition {...compositionFragment}
    ...on Joint {...jointFragment}
  }
`

const findResultFragment = gql`
  ${eventFragment} ${objectShortWithMetaStaticFragment}
  fragment findResultFragment on FindResult {
    count
    totalCount
    nextPageToken
    prevPageToken
    ... on EventFindResult { events {...eventFragment} }
    ... on ObjectsFindResult { objects{...objectShortWithMetaStaticFragment} }
    ... on WSFindResult { items }
  }
`

const fragments = {
  eventFragment,
  objectFullFragment,
  userFragment,
  dummyUserFragment,
  objectShortFragment,
  objectShortWithMetaStaticFragment,
  nodeFragment,
  sphereFragment,
  findResultFragment
}

export {
  fragments
}
