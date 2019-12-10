import gql from 'graphql-tag'
const objectShortFragment = gql`
  fragment objectShortFragment on ObjectShort {
    type
    oid
    name
    thumbUrl(preferWidth: 600)
  }
`
const objectShortWithMetaFragment = gql`
  fragment objectShortWithMetaFragment on ObjectShort {
    type
    oid
    name
    thumbUrl(preferWidth: 600)
    meta{
      type
      ...on MetaNode{
        layout
        fragments{
          name
        }
      }
    }
  }
`

const videoFragment = gql`
  fragment videoFragment on Video {
    oid
    type
    name
    thumbUrl(preferWidth: 600)
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
  fragment imageFragment on Image {
    oid
    type
    name
    thumbUrl(preferWidth: 600)
    url
    urlOriginal
    width
    height
  }
`
const nodeFragment = gql`
  ${videoFragment} ${imageFragment}
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
      name
      url
      content {
        ...on Video {...videoFragment}
        ...on Image {...imageFragment}
      }
      relativePoints { x y z }
      relativeScale
    }
    meta {
      ...on MetaNode {
        layout
        fragments { 
          width
          height
          color 
          thumbUrl(preferWidth: 600) 
          relativeCuts {
            start
            end
            name
            thumbUrl(preferWidth: 600)
            type
          }
        }
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
    subscriberCnt
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
  ${objectShortFragment} ${nodeFragment} ${eventFragment}
  fragment userFragment on User {
    oid
    name
    thumbUrl(preferWidth: 600)
    weightVal
    settings
    subscribers{...objectShortFragment}
    subscriptions{...objectShortFragment}
    subscribers{...objectShortFragment}
    workspace{
      nodes { ...nodeFragment }
      spheres { ...objectShortFragment }
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
      role
      email
      phone
    }
    sessions{
      token
      ip
      userAgent
    }
  }
`
const objectFragment = gql`
  ${videoFragment} ${imageFragment} ${nodeFragment} ${sphereFragment} ${userFragment}
  fragment objectFragment on Object {
    oid
    type
    name
    thumbUrl(preferWidth: 600)
    ...on Video {...videoFragment}
    ...on Image {...imageFragment}
    ...on Node {... nodeFragment}
    ...on Sphere {... sphereFragment}
    ...on User {... userFragment}
  }
`

const fragments = {
  eventFragment,
  objectFragment,
  userFragment,
  objectShortFragment,
  nodeFragment,
  sphereFragment
}

export {
  fragments
}
