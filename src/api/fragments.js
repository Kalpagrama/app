import gql from 'graphql-tag'

const countStatFragment = gql`
  fragment countStatFragment on CountStat {
    countVotes
    countViews
    countJoints
    countNodes
    countBookmarks
    countShares
    countRemakes
    countSubscribers
    countSubscriptions
    countComments
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

const objectShortStatFragment = gql`  ${objectShortFragment}
fragment objectShortStatFragment on ObjectShortStat {
  ...objectShortFragment
  rate
  weight
  date

}
`
const ObjectShortEssenceFragment = gql`  ${objectShortFragment} ${countStatFragment}
fragment ObjectShortEssenceFragment on ObjectShortEssence {
  ...objectShortFragment
  items {...objectShortFragment}
  vertices
  rate
  weight
  countStat{...countStatFragment}
}
`

const objectFragment = gql`${objectShortFragment} ${countStatFragment}
  fragment objectFragment on Object {
    type
    oid
    name
    thumbUrl(preferWidth: 600)
    thumbWidth
    thumbHeight
    uploadStage
    uploadStageProgress
    createdAt
    deletedAt
    subscriberCnt
    subscribers {...objectShortFragment}
    rev
    countStat{...countStatFragment}
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
const videoFragment = gql`${objectFragment} ${objectShortFragment}
  fragment videoFragment on Video {
    ...objectFragment
    commentStat{
            lastComment{...commentFragment}
            topComment{...commentFragment}
            randomComments{...commentFragment}
        }
    contentProvider
    urlWithFormats{ format url }
    urlOriginal
    duration
    strips
    author{...objectShortFragment}
#    contentSource
    relatedContent
    subtitlesRus: subtitles(lang: RUS)
    subtitlesEng: subtitles(lang: ENG)

    payStruct{price}
  }
`
const bookFragment = gql`${objectFragment} ${objectShortFragment}
  fragment bookFragment on Book {
    ...objectFragment
    author{...objectShortFragment}
    commentStat{
            lastComment{...commentFragment}
            topComment{...commentFragment}
            randomComments{...commentFragment}
        }
    contentProvider
    providerInfo
    urlWithFormats{ format url }
    payStruct{price}
  }
`
const imageFragment = gql`${objectFragment} ${objectShortFragment}
  fragment imageFragment on Image {
    ...objectFragment
    author{...objectShortFragment}
    commentStat{
            lastComment{...commentFragment}
            topComment{...commentFragment}
            randomComments{...commentFragment}
        }
    contentProvider
    urlWithFormats{ format url }
    urlOriginal
    payStruct{price}
  }
`

const figureFragment = gql`
  fragment figureFragment on Figure {
    t
    points {
      x
      y
    }
    epubCfi
    epubCfiText
    epubChapterId
    epubTocId
    epubHref
  }
`
const commentFragment = gql`
  fragment commentFragment on Comment {
    id
    createdAt
    author {
      oid
      type
      name
      thumbUrl(preferWidth: 50)
    }
    text
  }
`

const compositionFragment = gql`${objectFragment} ${imageFragment} ${figureFragment}
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
      contentName
      figuresAbsolute{...figureFragment}
    }
    operation{... operationFragment}
    outputType
    urlWithFormats{ format url }
#    contentSource
  }
`
// const essenceFragmentLeaf = gql`
//   ${objectFragment} ${objectShortFragment} ${videoFragment} ${bookFragment} ${imageFragment} ${sphereFragment} ${userFragment} ${compositionFragment}
//   fragment essenceFragmentLeaf on Essence {
//     ...objectFragment
//     relatedSphereOids
//     sphereFromName{...objectShortFragment}
//     rate
//     weight
//     rateStat {percent, weight, count}
//     rateUser
//     author {
//       oid
//       type
//       name
//       thumbUrl(preferWidth: 50)
//     }
//     spheres {
//       oid
//       name
//     }
//     category
//     layout
//     items {
//         ...on Video {...videoFragment}
//         ...on Book {...bookFragment}
//         ...on Image {...imageFragment}
//         ...on Sphere {... sphereFragment}
//         ...on User {... userFragment}
//         ...on Composition {...compositionFragment}
//     }
//     vertices
//   }
// `
const essenceFragment = gql`
  ${objectFragment} ${objectShortFragment} ${videoFragment} ${bookFragment} ${imageFragment} ${sphereFragment} ${userFragment} ${compositionFragment}
  fragment essenceFragment on Essence {
    ...objectFragment
    relatedSphereOids
    sphereFromName{...objectShortFragment}
    rate
    weight
    rateStat {percent, weight, count}
    rateUser
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
    #    items {
    #        ...on Video {...videoFragment}
    #        ...on Book {...bookFragment}
    #        ...on Image {...imageFragment}
    #        ...on Essence {...essenceFragmentLeaf}
    #        ...on Sphere {... sphereFragment}
    #        ...on User {... userFragment}
    #        ...on Composition {...compositionFragment}
    #    }
    itemsShort {
      ...objectShortFragment
    }
    vertices
    scope
  }
`
const nodeFragment = gql`
  ${objectFragment} ${objectShortFragment} ${videoFragment} ${bookFragment} ${imageFragment} ${sphereFragment} ${userFragment} ${compositionFragment} ${commentFragment}
  fragment nodeFragment on Node {
    ...objectFragment
    description
    relatedSphereOids
    sphereFromName{...objectShortFragment}
    rate
    weight
    rateStat {percent, weight, count}
    commentStat{
      lastComment{...commentFragment}
      topComment{...commentFragment}
      randomComments{...commentFragment}
    }
    rateUser
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
    itemsShort {
      ...objectShortFragment
    }
    items {
      ...on Composition {...compositionFragment}
    }
    vertices
    scope
  }
`
const jointFragment = gql`
  ${objectFragment} ${objectShortFragment} ${videoFragment} ${bookFragment} ${imageFragment} ${sphereFragment} ${userFragment} ${compositionFragment}
  fragment jointFragment on Joint {
    ...objectFragment
    relatedSphereOids
    sphereFromName{...objectShortFragment}
    rate
    weight
    rateStat {percent, weight, count}
    rateUser
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
    itemsShort {
      ...objectShortFragment
    }
    items {
      ...on Video {...videoFragment}
      ...on Book {...bookFragment}
      ...on Image {...imageFragment}
      ...on Sphere {... sphereFragment}
      ...on User {... userFragment}
      ...on Composition {...compositionFragment}
      ...on Node {...nodeFragment}
    }
    vertices
    scope
  }
`
const blockFragment = gql`
  ${objectFragment} ${objectShortFragment} ${ObjectShortEssenceFragment}
  fragment blockFragment on Block {
    ...objectFragment
    relatedSphereOids
    sphereFromName{...objectShortFragment}
    rate
    weight
    rateStat {percent, weight, count}
    rateUser
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
    scope
    description
    members{
      createdAt
      name
      oid
      thumbUrl(preferWidth: 600)
      type
      role
    }
    graph {
      joints{...ObjectShortEssenceFragment}
      nodes{...ObjectShortEssenceFragment}
    }
    rev
  }
`

const objectFullFragment = gql`
  ${compositionFragment} ${videoFragment} ${bookFragment} ${imageFragment} ${essenceFragment} ${nodeFragment} ${jointFragment}
  ${sphereFragment} ${userFragment} ${objectFragment} ${blockFragment}
  fragment objectFullFragment on Object {
    ...objectFragment
    ...on Video {...videoFragment}
    ...on Book {...bookFragment}
    ...on Image {...imageFragment}
    ...on Essence {... essenceFragment}
    ...on Node {... nodeFragment}
    ...on Joint {... jointFragment}
    ...on Sphere {... sphereFragment}
    ...on User {... userFragment}
    ...on Composition {...compositionFragment}
    ...on Block {...blockFragment}
  }
`
const topObjectFragment = gql`${figureFragment} ${countStatFragment}
    fragment topObjectFragment on TopObject {
        oid
        type
        name
        authorOid
        countVotes
        weight
        rate
        linkWeight
        linkRate
        votedUserRate
        internalItemOids
        figuresAbsoluteList{...figureFragment}
        vertexType
        countStat {...countStatFragment}
    }
`
const groupFragment = gql`${figureFragment} ${topObjectFragment} ${objectShortFragment}
    fragment groupFragment on Group {
        name
        figuresAbsolute{...figureFragment}
        groupThumbUrl: thumbUrl(preferWidth: 50)
        totalCount
        items{...topObjectFragment ...objectShortFragment}
    }
`
const contentCutFragment = gql`
  fragment contentCutFragment on ContentCut {
    cutId
    #        url
    urlWithFormats{ format url }
    duration
    epubCfi
    epubCfiText
    params
  }
`

const eventFragment = gql`
  ${objectShortFragment} ${objectFullFragment}
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
      rev
      path
      value
      objectFull{...objectFullFragment}
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
      relatedSphereOids
      matter {reason subscription}
    }
    ... on EventCommentCreate{
      subject{... objectShortFragment}
      object{... objectShortFragment}
      comment{
        id
        createdAt
        author {
          oid
          type
          name
          thumbUrl(preferWidth: 50)
        }
        text
      }
      matter {reason subscription}
    }
    ... on EventObjectRate{
      subject{... objectShortFragment}
      object{... objectShortFragment}
      rate
      rateUser
      rateStat {percent, weight, count}
      matter {reason subscription}
    }
  }
`
const eventFragmentWithBatch = gql`
  ${eventFragment}
  fragment eventFragmentWithBatch on Event {
    ...eventFragment
    ... on EventBatch {
      events {...eventFragment}
    }
  }
`

const findResultFragment = gql`
  ${eventFragment} ${topObjectFragment} ${groupFragment} ${objectShortFragment} ${contentCutFragment} ${commentFragment}
  fragment findResultFragment on FindResult {
    totalCount
    nextPageToken
    currentPageToken
    prevPageToken
    ... on EventFindResult { events: items {...eventFragment} }
    ... on ItemsFindResult { objects: items { ...topObjectFragment ...groupFragment ...objectShortFragment ...contentCutFragment ...commentFragment} }
    ... on WSFindResult { items }
  }
`

const fragments = {
  eventFragment,
  eventFragmentWithBatch,
  objectFullFragment,
  userFragment,
  dummyUserFragment,
  objectShortFragment,
  objectShortStatFragment,
  essenceFragment,
  nodeFragment,
  jointFragment,
  blockFragment,
  sphereFragment,
  findResultFragment,
  contentCutFragment,
  commentFragment
}

export {
  fragments
}
