<template lang="pug">
.row.full-width
  q-dialog(
    v-model="nodeLinkerOpened"
    position="bottom" maximized
    )
    node-finder(
      :node="node"
      :style=`{
        minWidth: Math.min($q.screen.width, 700)+'px',
        maxWidth: Math.min($q.screen.width, 700)+'px',
        height: $q.screen.gt.sm ? 800+'px' : $q.screen.height+'px',
      }`
      @close="nodeFinderOpened = false"
      @item="nodeLinkFound"
      )
  q-btn(
    @click="nodeLinkerOpened = true"
    round flat dense color="grey-9" icon="link")
  q-btn(
    v-for="(l,li) in links" :key="li"
    flat dense color="grey-9").q-px-sm {{ l.id }}
</template>

<script>
export default {
  name: 'nodeLinker',
  components: {
    nodeFinder: () => import('./node_finder.vue'),
  },
  props: ['node', 'n'],
  data () {
    return {
      nodeLinkerOpened: false,
      links: [],
    }
  },
  methods: {
    linksUpdate () {
      this.$log('linksUpdate')
      this.links = this.node.links.filter(l => {
        return l.items.includes(this.n.id)
      })
    },
    nodeLinkFound (item) {
      this.$log('nodeLinkFound', item)
    }
  },
  mounted () {
    this.$log('mounted')
    this.linksUpdate()
  }
}
</script>
