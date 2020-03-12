<template lang="pug">
div(:style=`{position: 'relative', paddingTop: '300px', paddingBottom: '300px'}`
  ).row.full-width.items-start.content-start.justify-start.q-px-xs
  node(
    v-for="(n, ni) in nodes" :key="n.oid" :accessKey="`${ni}-${n.oid}`"
    v-if="nodesBan ? !nodesBan.includes(n.oid) : true" layout="pip"
    :ref="'node-'+n.oid" :ctx="'list'"
    :node="n" :index="ni"
    :needFull="ni >= nodeMiddle-0 && ni <= nodeMiddle+1"
    :needFullPreload="!(ni >= nodeMiddle-1 && ni <= nodeMiddle+1) && ni >= nodeMiddle-8 && ni <= nodeMiddle+8"
    :visible="ni >= nodeMiddle-0 && ni <= nodeMiddle+0"
    :active="nodeMiddle === ni"
    @open="node = $event[0], nodeFull = $event[1], nodeDialogOpened = true"
    @hide="nodesBan.push(n.oid)"
    @nodeClick="$event => { $emit('nodeClick', $event)}"
    :style=`{borderRadius: '10px', overflow: 'hidden', marginBottom: '30px', marginTop: '30px'}`
    v-observe-visibility=`{
      callback: nodeMiddleHandler,
      throttle: throttle,
      intersection: {
        rootMargin: -($q.screen.height/2-10)+'px 0px'
      }
    }`
    )
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
      nodeTop: 0,
      nodeMiddleOid: undefined,
      nodeMiddle: -1,
      nodeDialogOpened: false,
      nodeFull: null,
      node: null
    }
  },
  computed: {
  },
  watch: {
    nodeMiddle: {
      handler (to, from) {
        this.$log('nodeMiddle CHANGED', to)
        this.$emit('nodeMiddle', to)
      }
    }
  },
  methods: {
    nodeMiddleHandler (isVisible, entry) {
      // this.$log('nodeMiddleHandler')
      if (isVisible) {
        let arr = entry.target.accessKey.split('-')
        let index = arr[0]
        let oid = arr[1]
        this.nodeMiddleOid = oid
        this.nodeMiddle = parseInt(index)
      }
    }
  },
  async mounted () {
    this.$log(' mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
