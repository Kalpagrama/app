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
      compositions{
        oid
        thumbUrl(preferWidth: 600)
        meta {
          ... on MetaComposition{...metaComposition}
        }
      }
    }
    ...on MetaContent{
      type
      uploadedFileInfo
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

const objectFragment = gql`
  ${metaFragment} ${objectShortFragment}
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
const compositionFragment = gql`
  ${objectFragment} ${objectShortFragment}
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
        name
        ...on Video {
          url
          duration
          frameUrls
          contentSource
        }
        ... on Image {
          url
        }
      }
      figuresAbsolute{...figureFragment}
      figuresRelative {...figureFragment}
      speed
      spheres {...objectShortFragment}
      thumbUrl(preferWidth: 600)
      url
    }
    operation{... operationFragment}
    outputType
    url
  }
`

const videoFragment = gql`
  ${objectFragment}
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
const imageFragment = gql`
  ${objectFragment}
  fragment imageFragment on Image {
    ...objectFragment
    url
    urlOriginal
    width
    height
  }
`
const nodeFragment = gql`
  ${videoFragment} ${imageFragment} ${objectFragment} ${compositionFragment} ${objectShortFragment}
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
    compositions {...compositionFragment}
  }
`
const sphereFragment = gql`
  ${objectFragment}
  fragment sphereFragment on Object {
    ...objectFragment
  }
`
const eventFragment = gql`
  ${videoFragment} ${imageFragment} ${nodeFragment} ${sphereFragment} ${objectShortFragment} ${objectShortWithMetaFragment}
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
        thumbUrl(preferWidth: 600)
        ...on Video {...videoFragment}
        ...on Image {...imageFragment}
        ...on Node {...nodeFragment}
        ...on Sphere {...sphereFragment}
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
      thumbUrl(preferWidth: 600)
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
  ${videoFragment} ${imageFragment} ${nodeFragment} ${sphereFragment} ${userFragment} ${objectFragment}
  fragment objectFullFragment on Object {
    ...objectFragment
    ...on Video {...videoFragment}
    ...on Image {...imageFragment}
    ...on Node {... nodeFragment}
    ...on Sphere {... sphereFragment}
    ...on User {... userFragment}
  }
`

const fragments = {
  eventFragment,
  objectFullFragment,
  userFragment,
  objectShortFragment,
  objectShortWithMetaFragment,
  nodeFragment,
  sphereFragment
}

export {
  fragments
}
