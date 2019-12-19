<template lang="pug">
.row.full-width.items-start.content-start.q-px-sm
  node-loader(v-if="sphereOid" ref="nodeLoader" :query="query" :variables="variables" queryKey="sphereNodes")
    template(v-slot:default=`{nodes}`)
      node-list(:nodes="nodes" @nodeClick="nodeClick")
</template>

<script>
export default {
  name: 'userCreatedNodes',
  data () {
    return {
    }
  },
  computed: {
    sphereOid () {
      return this.$store.state.objects.currentUser.oid
    },
    query () {
      return gql`
        query sphereNodesUser ($sphereOid: OID!, $pagination: PaginationInput!, $filter: Filter, $sortStrategy: SortStrategyEnum) {
          sphereNodes (sphereOid: $sphereOid, pagination: $pagination, filter: $filter, sortStrategy: $sortStrategy) {
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
                  fragments { width height thumbUrl(preferWidth: 600) }
                }
              }
            }
          }
        }
      `
    },
    variables () {
      return {
        sphereOid: this.sphereOid,
        pagination: { pageSize: 100 },
        sortStrategy: 'HOT',
        filter: { types: 'NODE' }
      }
    }
  },
  methods: {
    nodeClick (val) {
      this.$log('nodeClick', val)
      this.$router.push('/node/' + val[0].oid)
    }
  },
  mounted () {
    this.$logD('mounted')
  },
  beforeDestroy () {
    this.$logD('beforeDestroy')
  }
}
</script>
