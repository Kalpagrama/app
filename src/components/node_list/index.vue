<template lang="pug">
div(:style=`{position: 'relative', paddingTop: '100px', paddingBottom: '100px'}`
  ).row.full-width.items-start.content-start.justify-start.q-px-sm
  q-dialog(v-model="nodeDialogOpened" :maximized="true" full-height)
    div(@click.self="nodeDialogOpened = false").row.fit.items-start.content-start.justify-center.bg-grey-10
      //- div(:style=`{maxWidth: '600px'}`).row.full-width
      node(ctx="explorer" :node="node" :nodeFullReady="nodeFull" :visible="true" :active="true")
  node(
    v-for="(n, ni) in nodes" :key="n.oid" :accessKey="ni"
    v-if="nodesBan ? !nodesBan.includes(n.oid) : true"
    :ctx="'list'"
    :node="n" :index="ni"
    :needFull="ni >= nodeMiddle-0 && ni <= nodeMiddle+1"
    :needFullPreload="!(ni >= nodeMiddle-0 && ni <= nodeMiddle+1) && ni >= nodeMiddle-8 && ni <= nodeMiddle+8"
    :visible="nodeMiddle === ni"
    @open="node = $event[0], nodeFull = $event[1], nodeDialogOpened = true"
    @hide="nodesBan.push(n.oid)"
    @nodeClick="$event => { $emit('nodeClick', $event)}"
    :style=`{borderRadius: '10px', overflow: 'hidden'}`
    v-observe-visibility=`{
      callback: nodeMiddleHandler,
      throttle: throttle,
      intersection: {
        rootMargin: -($q.screen.height/2-10)+'px 0px'
      }
    }`
    ).bg-grey-2.q-mb-xl
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
      nodeMiddle: -1,
      nodeDialogOpened: false,
      nodeFull: null,
      node: null
    }
  },
  computed: {
  },
  methods: {
    nodeMiddleHandler (isVisible, entry) {
      if (isVisible) {
        this.nodeMiddle = parseInt(entry.target.accessKey)
        // this.$log(`np-test: nodeMiddle=${this.nodeMiddle}, throttle=${this.throttle} name=${this.nodes[this.nodeMiddle].name}`)
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
