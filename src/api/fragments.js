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
      countVotes
      countViews
      countJoints
      countNodes
      countBookmarks
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
    contentProvider
    urlWithFormats{ format url }
    urlOriginal
    duration
    strips
#    contentSource
    relatedContent
    subtitlesRus: subtitles(lang: RUS)
    subtitlesEng: subtitles(lang: ENG)
  }
`
const bookFragment = gql`${objectFragment}
  fragment bookFragment on Book {
    ...objectFragment
    contentProvider
    urlWithFormats{ format url }
#    contentSource
  }
`
const imageFragment = gql`${objectFragment}
  fragment imageFragment on Image {
    ...objectFragment
    contentProvider
    urlWithFormats{ format url }
    urlOriginal
#    contentSource
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
const courseFragment = gql`
    ${objectFragment} ${objectShortFragment} ${figureFragment}
    fragment courseFragment on Course {
        ...objectFragment
        relatedSphereOids
        sphereFromName{...objectShortFragment}
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
            voteHistory{
                date
                essenceOid
                rate
            }
        }
        rev
        paths{
            id
            name
            contents{
                contentOid
                themes{
                    id
                    name
                    figures {...figureFragment}
                    tasks{
                        node {...objectShortFragment}
                        voteAuthor
                    }
                }
            }
        }
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

const objectFullFragment = gql`
    ${compositionFragment} ${videoFragment} ${bookFragment} ${imageFragment} ${essenceFragment}
    ${sphereFragment} ${userFragment} ${objectFragment} ${courseFragment}
    fragment objectFullFragment on Object {
        ...objectFragment
        ...on Video {...videoFragment}
        ...on Book {...bookFragment}
        ...on Image {...imageFragment}
        ...on Essence {... essenceFragment}
        ...on Sphere {... sphereFragment}
        ...on User {... userFragment}
        ...on Composition {...compositionFragment}
        ...on Course {...courseFragment}
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
        internalItemOids
        figuresAbsoluteList{...figureFragment}
        vertexType
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
   courseFragment,
   sphereFragment,
   findResultFragment,
   contentCutFragment,
   commentFragment
}

export {
   fragments
}
