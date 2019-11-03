<template lang="pug">
q-layout()
  //- q-header(reveal).bg-secondary
  //-   div(:style=`{height: '60px'}`).row.full-width.items-center.q-px-md
  //-     span header
  q-page-container.bg-grey-2
    node-loader(ref="nodeLoader" mode="feed" :query="query" queryKey="feed" :variables="variables").q-pt-xl
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
      drawer: false,
      miniState: false,
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
    this.$root.$on('page', () => {
      if (this.$refs.kDrawer) this.$refs.kDrawer.toggle()
    })
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
