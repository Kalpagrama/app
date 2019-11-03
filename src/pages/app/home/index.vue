<template lang="pug">
q-layout
  q-page-container
    node-loader(ref="nodeLoader" mode="feed" :query="query" queryKey="feed" :variables="variables")
      template(v-slot:items=`{items, fetchingMore}`)
        node-feed(:nodes="items" :fetchingMore="fetchingMore" @more="$refs.nodeLoader.fetchMore()")
  q-footer(reveal).lt-md
    k-menu-horiz(page="home" :colors="['white', 'grey-7']")
</template>

<script>
export default {
  name: 'pageApp__home',
  components: {},
  data () {
    return {
      nodes: [],
      query: gql`
        query feed($pageToken: RawJSON) {
          feed(pagination: {pageSize: 100, pageToken: $pageToken}) {
            count
            totalCount
            nextPageToken
            items {
              oid
              type
              thumbUrl (preferWidth: 600)
              createdAt
              name
              meta {
                ...on MetaNode {
                  layout
                  fragments { uid width height color thumbUrl(preferWidth: 600) }
                }
              }
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

<style lang="stylus">
.q-footer
  background: none !important
</style>
