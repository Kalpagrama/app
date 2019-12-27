<template lang="pug">
div(:style=`{position: 'relative'}`).row.full-width.items-start.content-start.justify-start
  node(
    v-for="(n, ni) in nodes" :key="n.oid" :accessKey="ni"
    v-if="nodesBan ? !nodesBan.includes(n.oid) : true"
    :ctx="'inList'"
    :node="n" :index="ni"
    :priority="ni >= nodeMiddle-1 && ni <= nodeMiddle+1 ? 0 : 1"
    :needFull="ni >= nodeMiddle-8 && ni <= nodeMiddle+8"
    :visible="nodeMiddle === ni"
    @hide="nodesBan.push(n.oid)"
    @nodeClick="$event => $emit('nodeClick', $event)"
    :style=`{}`
    v-observe-visibility=`{
      callback: nodeMiddleHandler,
      throttle: 300,
      intersection: {
        rootMargin: -($q.screen.height/2-1)+'px 0px'
      }
    }`
    ).bg-white.q-mb-lg
</template>

<script>
export default {
  name: 'nodeList',
  props: {
    nodes: {type: Array},
    nodesBan: {type: Array, default () { return [] }}
  },
  data () {
    return {
      nodeHeight: 50,
      nodeMiddle: 0
    }
  },
  computed: {
  },
  methods: {
    nodeMiddleHandler (isVisible, entry) {
      if (isVisible) {
        this.$log('nodeMiddleHandler', entry.target.accessKey)
        this.nodeMiddle = parseInt(entry.target.accessKey)
      }
    },
    nodeClick (n, ni) {
      this.$logD('nodeClick', n, ni)
      this.$emit('nodeClick', n)
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
