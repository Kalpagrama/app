<template lang="pug">
.row.full-width.justify-center
  div(:style=`{maxWidth: '500px'}`).row.full-width.q-pt-md
    node-feed(:mini="true" queryKey="feed")
</template>

<script>
import nodeFeed from 'components/node_feed'

export default {
  name: 'pageApp__Home',
  components: { nodeFeed },
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
