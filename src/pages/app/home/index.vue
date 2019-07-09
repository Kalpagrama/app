<template lang="pug">
.row.fit.justify-center
  div(style=`maxWidth: 1130px`).row.fit.justify-start.q-px-md
    slot(name="menu")
    div.full-height.q-pa-md
      div(style=`position: relative`).column.fit
        //- body
        .col.scroll
          kFeed(:mini="true" queryDataKey="feed")
    div(style=`width: 200px`).row.full-height.q-py-md
      div(style=`borderRadius: 8px`).row.fit.items-center.justify-center.bg-white
        span Right menu
</template>

<script>
import kMenu from 'pages/app/menu'
import kFeed from 'components/kFeed'

export default {
  name: 'pageApp__Home',
  components: { kMenu, kFeed },
  data () {
    return {
      query: gql`
        query feed {
          feed(type: NEWS, pagination: {pageSize: 10, pageToken: null} filter: {types:[NODE]} ){
            count
            totalCount
            nextPageToken
            items {
              oid
              type
              thumbUrl (preferWidth: 600)
              createdAt
              name
            }
          }
        }
      `,
      variables: {
        oid: this.$store.state.auth.user.oid
      }
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
