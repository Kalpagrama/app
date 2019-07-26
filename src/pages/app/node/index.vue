<template lang="pug">
div(style=`minHeight: 800px`).row.full-width
  div(v-if="mode === 'first'").row.full-width.justify-center.q-pt-md
    node-card(v-if="node" :node="node" :mini="false" :visible="true" :needFull="true" :zIndex="1000")
    div(v-else style=`height: 500px`).row.items-center.justify-center
      q-spinner(:thickness="2" color="primary" size="50px")
  div(v-if="mode === 'second'").row.full-width
    .col.q-pa-md
      node-card(v-if="node" :node="node" :mini="false" :visible="true" :needFull="true")
    .col.bg-grey-3
      div(v-for="(n, ni) in nodes" :key="n.oid").row.full-width.items-center
        span {{n}}
</template>

<script>
import nodeCard from 'components/node/node_card'

export default {
  name: 'pageApp__Node',
  components: { nodeCard },
  props: {},
  data () {
    return {
      mode: 'second',
      node: null,
      nodes: [],
      needFull: true
    }
  },
  methods: {
    async nodeLoad (oid) {
      this.$log('nodeLoad start')
      let {data: {objectList}} = await this.$apollo.query({
        query: gql`
          query objectList ($oid: OID!) {
            objectList(oids: [$oid]) {
              oid
              type
              thumbUrl (preferWidth: 600)
              createdAt
              name
            }
          }
        `,
        variables: {
          oid: oid
        }
      })
      this.$log('nodeLoad done')
      return objectList[0]
    },
    async nodesLoad (oid) {
      this.$log('nodesLoad start')
      let {data: {sphereNodes: {items}}} = await this.$apollo.query({
        query: gql`
          query sphereNodes($oid: OID!) {
            sphereNodes (sphereOid: $oid, pagination: {pageSize: 100}) {
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
  watch: {
    '$route': {
      immediate: true,
      async handler (to, from) {
        if (to.params.oid) {
          this.node = null
          this.node = await this.nodeLoad(to.params.oid)
          this.nodes = []
          // this.nodes = await this.nodesLoad(to.params.oid)
        }
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
