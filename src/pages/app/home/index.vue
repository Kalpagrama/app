<template lang="pug">
div(:style=`{height: 'calc(var(--vh, 1vh) * 100)'}`).column.full-width.bg-grey-4
  div(body-scroll-lock-ignore).col.scroll
    node-loader(mode="feed" :query="query" queryKey="feed" :variables="variables")
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
                  fragments { uid width height color }
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
