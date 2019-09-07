<template lang="pug">
k-page
  template(v-slot:body)
    node-loader(mode="feed" :query="query" queryKey="feed" :variables="variables")
</template>

<script>
import kPage from 'components/k_page'
import nodeLoader from 'components/node_loader'

export default {
  name: 'pageApp__home',
  components: { kPage, nodeLoader },
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
