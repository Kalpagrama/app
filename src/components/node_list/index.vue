<template lang="pug">
div(:style=`{position: 'relative'}`).row.full-width.items-start.content-start.justify-start
  node(
    v-for="(n, ni) in nodes" :key="n.oid" :accessKey="ni"
    v-if="nodesBan ? !nodesBan.includes(n.oid) : true"
    :ctx="'inList'"
    :node="n" :index="ni"
    :needFull="ni >= nodeMiddle-1 && ni <= nodeMiddle+1"
    :needFullPreload="!(ni >= nodeMiddle-1 && ni <= nodeMiddle+1) && ni >= nodeMiddle-8 && ni <= nodeMiddle+8"
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
      nodeMiddle: -1
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
