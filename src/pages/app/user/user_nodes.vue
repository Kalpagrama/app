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
    user: {
      immediate: true,
      async handler (to, from) {
        this.$logD('user CHANGED', to)
        this.nodes = await this.nodesLoad(to.oid)
      }
    }
  },
  methods: {
    nodeClick (n, ni) {
      this.$logD('nodeClick', n)
      this.$router.push(`/app/node/${n.oid}`)
    },
    async nodesLoad (oid) {
      this.$logD('nodesLoad start')
      return []
    }
  },
  async mounted () {
    this.$logD('mounted')
  },
  beforeDestroy () {
    this.$logD('beforeDestroy')
  }
}
</script>
