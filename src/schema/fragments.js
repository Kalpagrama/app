import gql from 'graphql-tag'

const metaFragment = gql`
  fragment metaComposition on MetaComposition {
    thumbUrl(preferWidth: 600)
    height
    width
  }
  fragment metaFragment on Meta {
    type
    ...on MetaNode {
      items{
        oid
        thumbUrl(preferWidth: 600)
      }
      layout
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
  }
`
const wsObjectShortFragment = gql`
  fragment wsObjectShortFragment on ObjectShort {
    type
    oid
    name
    thumbUrl(preferWidth: 600)
    ... on WSObjectShort{
      unique
      wsItemType
    }
  }
`
const objectShortWithMetaFragment = gql`
  ${metaFragment}
  fragment objectShortWithMetaFragment on ObjectShort {
    type
    oid
    name
    thumbUrl(preferWidth: 600)
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
    revision
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
    width
    height
    frameUrls
    contentSource
  }
`
const imageFragment = gql`${objectFragment}
  fragment imageFragment on Image {
    ...objectFragment
    url
    urlOriginal
    width
    height
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
    spheres {...objectShortFragment}
    operation {
      type
      operations {
        type
      }
      items
    }
    layers {
      contentOid
      content {
        oid
        type
        thumbUrl(preferWidth: 600)
        name
        ...on Video {...videoFragment}
        ...on Image {...imageFragment}
      }
      figuresAbsolute{...figureFragment}
      figuresRelative {...figureFragment}
      speed
      spheres {...objectShortFragment}
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
    links{
      name
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
      object {
        oid
        type
        name
        revision
        thumbUrl(preferWidth: 600)
        revision
        ...on WSItem {
          wsItemType
          unique
          rawData
        }
      }
    }
    ... on EventChange{
      subject{... objectShortFragment}
      object{... objectShortWithMetaFragment}
      path
      value
    }
    ... on EventGeneral{
      subject{... objectShortFragment}
      object{... objectShortWithMetaFragment}
    }
    ... on EventRate{
      subject{... objectShortFragment}
      object{... objectShortWithMetaFragment}
      rate
    }
  }
`
const userFragment = gql`
  ${objectShortFragment} ${nodeFragment} ${objectFragment}
  fragment userFragment on User {
    ...objectFragment
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
const objectFullFragment = gql`
  ${compositionFragment} ${videoFragment} ${imageFragment} ${nodeFragment} ${sphereFragment} ${userFragment} ${chainFragment} ${objectFragment}
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

const fragments = {
  eventFragment,
  objectFullFragment,
  userFragment,
  objectShortFragment,
  wsObjectShortFragment,
  objectShortWithMetaFragment,
  nodeFragment,
  sphereFragment
}

export {
  fragments
}
