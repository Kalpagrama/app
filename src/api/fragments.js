import gql from 'graphql-tag'

const metaFragment = gql`
  fragment metaComposition on MetaComposition {
    thumbUrl(preferWidth: 600)
  }
  fragment metaFragment on Meta {
    type
    ...on MetaNode {
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
      layout
      author {
        oid
        type
        name
        thumbUrl(preferWidth: 50)
      }
    }
    ...on MetaContent{
      type
      uploadedInfo
    }
    ... on MetaComposition {...metaComposition}
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

const objectShortWithMetaFragment = gql`
  ${metaFragment}
  fragment objectShortWithMetaFragment on ObjectShort {
    type
    oid
    name
    thumbUrl(preferWidth: 600)
    createdAt
    meta{...metaFragment}
  }
`

const objectFragment = gql`${metaFragment} ${objectShortFragment}
  fragment objectFragment on Object {
    type
    oid
    name
    thumbUrl(preferWidth: 600)
    createdAt
    deletedAt
    subscriberCnt
    subscribers {...objectShortFragment}
    meta{ ...metaFragment}
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
const chainFragment = gql`${videoFragment} ${imageFragment} ${objectFragment} ${objectShortFragment}
  fragment chainFragment on Chain {
    ...objectFragment
    rate
    rateUser
    viewCnt
    author {
      oid
      type
      name
      thumbUrl(preferWidth: 50)
    }
    links{
      leftItem{...objectShortFragment}
      rightItem{...objectShortFragment}
      type
    }
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
  ${objectShortFragment} ${objectShortWithMetaFragment}
  fragment eventFragment on Event {
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
      object{... objectShortWithMetaFragment}
      path
      value
      matter {reason subscription}
    }
    ... on EventGeneral{
      subject{... objectShortFragment}
      object{... objectShortWithMetaFragment}
      matter {reason subscription}
    }
    ... on EventObjectCreateDelete{
      subject{... objectShortFragment}
      object{... objectShortWithMetaFragment}
      sphereOids
      matter {reason subscription}
    }
    ... on EventObjectRate{
      subject{... objectShortFragment}
      object{... objectShortWithMetaFragment}
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
  ${sphereFragment} ${userFragment} ${chainFragment} ${objectFragment}
  fragment objectFullFragment on Object {
    ...objectFragment
    ...on Video {...videoFragment}
    ...on Image {...imageFragment}
    ...on Node {... nodeFragment}
    ...on Sphere {... sphereFragment}
    ...on User {... userFragment}
    ...on Chain {...chainFragment}
    ...on Composition {...compositionFragment}
  }
`

const findResultFragment = gql`
  ${eventFragment} ${objectShortWithMetaFragment}
  fragment findResultFragment on FindResult {
    count
    totalCount
    nextPageToken
    prevPageToken
    ... on EventFindResult { events {...eventFragment} }
    ... on ObjectsFindResult { objects{...objectShortWithMetaFragment} }
    ... on WSFindResult { items }
  }
`

const fragments = {
  eventFragment,
  objectFullFragment,
  userFragment,
  dummyUserFragment,
  objectShortFragment,
  objectShortWithMetaFragment,
  nodeFragment,
  sphereFragment,
  findResultFragment
}

export {
  fragments
}
