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
    thumbWidth
    thumbHeight
    uploadStage
    uploadStageProgress
    createdAt
    deletedAt
    subscriberCnt
    subscribers {...objectShortFragment}
    rev
    countStat{
      countViews
      countJoints
      countNodes
      countShares
      countRemakes
      countSubscribers
      countSubscriptions
      }
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
    strips
    contentProvider
    contentSource
    contentProvider
    relatedContent
    subtitlesRus: subtitles(lang: RUS)
    subtitlesEng: subtitles(lang: ENG)
  }
`
const bookFragment = gql`${objectFragment}
  fragment bookFragment on Book {
    ...objectFragment
    url
    contentProvider
    contentSource
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

const figureFragment = gql`
  fragment figureFragment on Figure {
      t
      points {
          x
          y
      }
      epubCfi
      epubCfiText
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
    url
    contentSource
  }
`
const essenceFragmentLeaf = gql`
  ${objectFragment} ${objectShortFragment} ${videoFragment} ${bookFragment} ${imageFragment} ${sphereFragment} ${userFragment} ${compositionFragment}
  fragment essenceFragmentLeaf on Essence {
    ...objectFragment
    relatedSphereOids  
    sphereFromName{...objectShortFragment}
    rate
    weight
    rateStat {percent, weight, count}
    rateUser
    countVotes
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
        ...on Video {...videoFragment}
        ...on Book {...bookFragment}
        ...on Image {...imageFragment}
        ...on Sphere {... sphereFragment}
        ...on User {... userFragment}
        ...on Composition {...compositionFragment}
    }
    vertices
  }
`
const essenceFragment = gql`
  ${objectFragment} ${objectShortFragment} ${videoFragment} ${bookFragment} ${imageFragment} ${essenceFragmentLeaf} ${sphereFragment} ${userFragment} ${compositionFragment}
  fragment essenceFragment on Essence {
    ...objectFragment
    relatedSphereOids
    sphereFromName{...objectShortFragment}
    rate
    weight
    rateStat {percent, weight, count}
    rateUser
    countVotes
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
        ...on Video {...videoFragment}
        ...on Book {...bookFragment}
        ...on Image {...imageFragment}
        ...on Essence {...essenceFragmentLeaf}
        ...on Sphere {... sphereFragment}
        ...on User {... userFragment}
        ...on Composition {...compositionFragment}
    }
    vertices
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
            relatedSphereOids
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

const objectFullFragment = gql`
    ${compositionFragment} ${videoFragment} ${bookFragment} ${imageFragment} ${essenceFragment}
    ${sphereFragment} ${userFragment} ${objectFragment}
    fragment objectFullFragment on Object {
        ...objectFragment
        ...on Video {...videoFragment}
        ...on Book {...bookFragment}
        ...on Image {...imageFragment}
        ...on Essence {... essenceFragment}
        ...on Sphere {... sphereFragment}
        ...on User {... userFragment}
        ...on Composition {...compositionFragment}
    }
`
const topObjectFragment = gql`${figureFragment}
    fragment topObjectFragment on TopObject {
        oid
        name
        countVotes
        weight
        rate
        votedUserRate
        relatedOids
        figuresAbsoluteList{...figureFragment}
        vertexType
    }
`
const groupFragment = gql`${figureFragment} ${topObjectFragment} ${objectShortFragment}
    fragment groupFragment on Group {
        figuresAbsolute{...figureFragment}
        groupThumbUrl: thumbUrl(preferWidth: 50)
        totalCount
        items{...topObjectFragment ...objectShortFragment}
    }
`

const findResultFragment = gql`
    ${eventFragment} ${topObjectFragment} ${groupFragment} ${objectShortFragment}
    fragment findResultFragment on FindResult {
        count
        totalCount
        nextPageToken
        currentPageToken
        prevPageToken
        ... on EventFindResult { events: items {...eventFragment} }
        ... on ObjectsFindResult { objects: items { ...topObjectFragment ...groupFragment ...objectShortFragment} }
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
   sphereFragment,
   findResultFragment
}

export {
   fragments
}
