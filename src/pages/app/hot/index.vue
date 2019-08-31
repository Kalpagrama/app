<template lang="pug">
.column.fit.bg-grey-2
  div(body-scroll-lock-ignore).col.full-width.scroll.bg-grey-4
    .row.full-width.items-start.justify-center
      node-loader(mode="feed" :query="query" queryKey="feed" :variables="variables" :style=`{maxWidth: '500px'}`)
</template>

<script>
import nodeLoader from 'components/node_loader'

export default {
  name: 'pageApp__hot',
  components: { nodeLoader },
  data () {
    return {
      nodes: [],
      query: gql`
        query feed($pageToken: RawJSON) {
          feed(type: NEWS, pagination: {pageSize: 10, pageToken: $pageToken} filter: {types:[NODE]} ){
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
