<template lang="pug">
.row.fit.q-pt-md.bg-grey-4
  node-list(:nodes="nodes" @nodeClick="nodeClick").full-width
</template>

<script>
import nodeList from 'components/node_list'
import nodeMasonry from 'components/node_masonry'

export default {
  name: 'userNodes',
  props: {
    user: {type: Object}
  },
  components: {nodeMasonry, nodeList},
  data () {
    return {
      nodes: []
    }
  },
  computed: {
    getRadius () {
      return 8
    },
    getColumns () {
      return Math.round(this.$q.screen.width / 200)
    }
  },
  watch: {
    'user': {
      immediate: true,
      async handler (to, from) {
        this.$log('user CHANGED', to)
        this.nodes = await this.nodesLoad(to.oid)
      }
    }
  },
  methods: {
    nodeClick (n, ni) {
      this.$log('nodeClick', n)
      this.$router.push(`/app/node/${n.oid}`)
    },
    async nodesLoad (oid) {
      this.$log('nodesLoad start')
      let {data: {sphereNodes: {items}}} = await this.$apollo.query({
        query: gql`
          query sphereNodes($oid: OID!) {
            sphereNodes (sphereOid: $oid, pagination: {pageSize: 50}) {
              totalCount
              items {
                oid
                type
                thumbUrl (preferWidth: 600)
                createdAt
                name
              }
              nextPageToken
            }
          }
        `,
        variables: {
          oid: oid
        }
      })
      this.$log('nodesLoad done', items)
      return items
    }
  },
  async mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
