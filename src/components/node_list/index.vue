<template lang="pug">
div(:style=`{position: 'relative'}`).row.full-width.items-start.content-start.justify-start
  node(
    v-for="(n, ni) in nodes" :key="n.oid" :accessKey="ni"
    v-if="nodesBan ? !nodesBan.includes(n.oid) : true"
    :ctx="'inList'"
    :node="n" :index="ni"
    :needFull="ni >= nodeMiddle-0 && ni <= nodeMiddle+0"
    :needFullPreload="!(ni >= nodeMiddle-0 && ni <= nodeMiddle+0) && ni >= nodeMiddle-8 && ni <= nodeMiddle+8"
    :visible="nodeMiddle === ni"
    @hide="nodesBan.push(n.oid)"
    @nodeClick="$event => $emit('nodeClick', $event)"
    :style=`{}`
    v-observe-visibility=`{
      callback: nodeMiddleHandler,
      throttle: throttle,
      // throttleOptions: {
      //   leading: 'both',
      // },
      intersection: {
        rootMargin: -($q.screen.height/2-10)+'px 0px'
      }
    }`
    ).bg-white.q-mb-lg
</template>

<script>
export default {
  name: 'nodeList',
  props: {
    nodes: {type: Array},
    nodesBan: {type: Array, default () { return [] }},
    throttle: {type: Number, default () { return 300 }}
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
        this.nodeMiddle = parseInt(entry.target.accessKey)
        this.$log(`np-test: nodeMiddle=${this.nodeMiddle}, throttle=${this.throttle} name=${this.nodes[this.nodeMiddle].name}`)
      }
    }
  },
  async mounted () {
    this.$log(' mounted')
    this.throttle = 2000
    await this.$wait(2000)
    this.throttle = 300
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
