<template lang="pug">
q-layout(containter :style=`{width: width+'px'}`)
  //- q-header(reveal)
  //-   div(:style=`{height: '60px'}`).row.full-width.bg-red
  q-page-container
    node-loader(ref="nodeLoader" mode="feed" :query="query" queryKey="feed" :variables="variables")
      template(v-slot:items=`{items, fetchingMore}`)
        node-feed(:nodes="items" :fetchingMore="fetchingMore" @more="$refs.nodeLoader.fetchMore()")
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
