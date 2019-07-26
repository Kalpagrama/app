<template lang="pug">
.row.full-width.justify-center.q-pa-sm.bg-grey-4
  div(
    :style=`{columnCount: getColumns, columnFill: 'balance'}`).justify-center.full-width
    div(v-for="(n, ni) in nodes" :key="n.oid" @click="nodeClick(n, ni)"
      :style=`{
        width: '180px', borderRadius: '4px', display: 'inline-block',
        borderTopLeftRadius: '100%'+getRadius+'px', borderTopRightRadius: '100%'+getRadius+'px',
        borderBottomLeftRadius: '100%'+getRadius+'px', borderBottomRightRadius: '100%'+getRadius+'px'}`
      ).q-pa-sm.bg-white.hr.cursor-pointer.q-mb-md
      node(:node="n" style=`width: 100%`)
</template>

<script>
import node from 'components/node'

export default {
  name: 'userNodes',
  props: {
    user: {type: Object}
  },
  components: {node},
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
