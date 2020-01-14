import gql from 'graphql-tag'

const metaFragment = gql`
  fragment metaFragment on Meta {
    type
    ...on MetaNode {
      fragments {
        width
        height
        thumbUrl(preferWidth: 600)
      }
    }
    ...on MetaContent{
      type
      uploadedFileInfo
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
  ${videoFragment} ${imageFragment} ${objectFragment}
  fragment nodeFragment on Node {
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
    spheres {
      oid
      name
    }
    categories
    layout
    fragments {
      name
      url
      content {
        ...on Video {...videoFragment}
        ...on Image {...imageFragment}
      }
      scale
      cuts {
        name
        color
        thumbUrl(preferWidth: 600)
        points { x y z }
        style
      }
      
    }
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
      objectFull{
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
  ${objectShortFragment} ${nodeFragment} ${eventFragment} ${objectFragment}
  fragment userFragment on User {
    ...objectFragment
    weightVal
    settings
    subscriptions{...objectShortFragment}
    workspace{
      nodes { ...nodeFragment }
      spheres { ...objectShortFragment }
    }
    events{...eventFragment}
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
#    oid
#    type
#    name
#    thumbUrl(preferWidth: 600)
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
