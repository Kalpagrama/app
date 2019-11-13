<template lang="pug">
q-layout(containter :style=`{width: width+'px'}` @scroll="onScroll")
  //- q-header(reveal)
  //-   div(:style=`{height: '60px'}`).row.full-width.bg-red
  q-page-container
    node-loader(ref="nodeLoader" mode="feed" :query="query" queryKey="feed" :variables="variables")
      template(v-slot:items=`{items, fetchingMore}`)
        node-feed(ref="nodeFeed" name="Home" :nodes="items" :fetchingMore="fetchingMore" @more="$refs.nodeLoader.fetchMore()")
  q-footer(reveal).lt-sm
    k-menu-horiz(page="home" :colors="['white', 'grey-7']")
</template>

<script>
export default {
  name: 'pageApp__home',
  props: ['width', 'height'],
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
  methods: {
    onScroll (e) {
      // this.$log('onScroll', e)
      if (e.directionChanged) {
        let b = true
        if (e.direction === 'down') b = true
        else b = false
        if (this.$refs.nodeFeed) this.$refs.nodeFeed.scrollDirectionChanged(b)
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
