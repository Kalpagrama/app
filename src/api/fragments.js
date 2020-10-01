import gql from 'graphql-tag'

const objectShortFragment = gql`
  fragment objectShortFragment on ObjectShort {
    type
    oid
    name
    thumbUrl(preferWidth: 600)
    createdAt
  }
`

const objectShortStatFragment = gql`  ${objectShortFragment}
  fragment objectShortStatFragment on ObjectShortStat {
    ...objectShortFragment
    rate
    weight
    date
    
  }
`

const objectFragment = gql`${objectShortFragment}
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

const userFragment = gql`
  ${objectShortFragment} ${objectFragment}
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
const compositionFragment = gql`${objectFragment} ${videoFragment} ${imageFragment}
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
const nodeFragment = gql`${videoFragment} ${imageFragment} ${objectFragment} ${objectShortFragment} ${compositionFragment}
  fragment nodeFragment on Node {
    ...objectFragment
    sphereFromName{...objectShortFragment}
    rate
    rateUser
    countVotes
    countViews
    countJoints
    countRemakes
    countShares
    countBookmarks
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
    items {
    ...on Composition {...compositionFragment}
    }
    #    jointsWithEmojis{...objectShortJointFragment}
    #    jointsWithSpheres{...objectShortJointFragment}
  }
`
const jointFragment = gql` ${objectFragment} ${videoFragment} ${imageFragment} ${nodeFragment} ${sphereFragment} ${userFragment} ${compositionFragment}
fragment jointFragment on Joint {
  ...objectFragment
  jointType
  leftItem {
    ...on Video {...videoFragment}
    ...on Image {...imageFragment}
    ...on Node {... nodeFragment}
    ...on Sphere {... sphereFragment}
    ...on User {... userFragment}
    ...on Composition {...compositionFragment}
  }
  rightItem {
    ...on Video {...videoFragment}
    ...on Image {...imageFragment}
    ...on Node {... nodeFragment}
    ...on Sphere {... sphereFragment}
    ...on User {... userFragment}
    ...on Composition {...compositionFragment}
  }
  rate
  weight
  rateUser
}
`

const eventFragment = gql`
  ${objectShortFragment}
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
      object{... objectShortFragment}
      path
      value
      matter {reason subscription}
    }
    ... on EventGeneral{
      subject{... objectShortFragment}
      object{... objectShortFragment}
      matter {reason subscription}
    }
    ... on EventObjectCreateDelete{
      subject{... objectShortFragment}
      object{... objectShortFragment}
      sphereOids
      matter {reason subscription}
    }
    ... on EventObjectRate{
      subject{... objectShortFragment}
      object{... objectShortFragment}
      rate
      matter {reason subscription}
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
  ${eventFragment}
  fragment findResultFragment on FindResult {
    count
    totalCount
    nextPageToken
    prevPageToken
    ... on EventFindResult { events {...eventFragment} }
    ... on ObjectsFindResult { objects{oid} }
    ... on WSFindResult { items }
  }
`

const fragments = {
  eventFragment,
  objectFullFragment,
  userFragment,
  dummyUserFragment,
  objectShortFragment,
  objectShortStatFragment,
  nodeFragment,
  sphereFragment,
  findResultFragment
}

export {
  fragments
}
