<template lang="pug">
.row.full-width.justify-center.bg-grey-4
  node-feed(queryKey="feed")
  //- node-masonry(:nodes="nodes" @more="more")
</template>

<script>
import nodeFeed from 'components/node_feed'
import nodeMasonry from 'components/node_masonry'

export default {
  name: 'pageApp__Home',
  components: { nodeFeed, nodeMasonry },
  data () {
    return {
      nodes: [],
      query: gql`
        query feed($pageToken: RawJSON) {
          feed(type: NEWS, pagination: {pageSize: 6, pageToken: $pageToken} filter: {types:[NODE]} ){
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
  methods: {
    more () {
      this.$log('more')
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
