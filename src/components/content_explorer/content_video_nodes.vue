<template lang="pug">
.column.fit
  div(:style=`{height: '60px'}`).row.full-width.items-center.q-px-sm.bg-grey-1
    q-btn(flat color="grey-9" style=`width: 40px; height: 40px` icon="keyboard_arrow_left" @click="$emit('back')")
    .col
    q-btn(flat color="grey-9" style=`width: 40px; height: 40px` icon="search")
    q-btn(flat color="grey-9" style=`width: 40px; height: 40px` icon="more_vert")
  .col.scroll.q-pt-md.bg-grey-4
    node-list(:nodes="$nodesDistinct(nodes)" @nodeClick="nodeClick")
      template(v-slot:extra=`{node, nodeOver}`)
        small(v-if="nodeOver" :style=`{position: 'absolute', left: '8px', bottom: '4px'}`).text-grey-9 {{nodeTimes(node)}}
</template>

<script>
import nodeList from 'components/node_list'

export default {
  name: 'contentExplorer__contentVideoNodes',
  props: ['node', 'nodeFull', 'content', 'nodes'],
  components: {nodeList},
  data () {
    return {
    }
  },
  methods: {
    nodeClick (n, ni) {
      this.$log('nodeClick')
      this.$emit('nodeClick', n, ni)
    },
    nodeTimes (n) {
      let res = ``
      n.fragmentsPoints.map((f, fi, arr) => {
        res += `${this.$time(f.relativePoints[0]['x'])}-${this.$time(f.relativePoints[1]['x'])}`
        if (fi !== arr.length - 1) res += ',  '
      })
      return res
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
