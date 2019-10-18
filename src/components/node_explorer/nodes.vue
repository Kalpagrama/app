<template lang="pug">
.column.fit
  .col.scroll
    node-loader(ref="nodeLoader" :query="query" queryKey="nodeNodes" :variables="variables")
      template(v-slot:items=`{items, fetchingMore}`)
        node-feed(:nodes="items" :fetchingMore="fetchingMore" @more="$refs.nodeLoader.fetchMore()")
</template>

<script>
export default {
  name: 'nodeExplorer__nodes',
  props: {
    node: {
      type: Object,
      required: true
    }
  },
  components: {},
  data () {
    return {
      query: gql`
        query feed2 ($oid: OID!, $pageToken: RawJSON) {
          nodeNodes(nodeOid: $oid, pagination: {pageSize: 100, pageToken: $pageToken}, sortStrategy: HOT) {
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
        oid: this.node.oid
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
