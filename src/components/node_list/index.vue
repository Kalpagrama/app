<template lang="pug">
div(:style=`{position: 'relative', paddingTop: '100px', paddingBottom: '100px'}`
  ).row.full-width.items-start.content-start.justify-start.q-px-xs
  //- node top
  //- div(:style=`{position: 'absolute', top: nodeTop+'px', zIndex: 10000, borderRadius: '10px', overflow: 'hidden'}`).row.full-width.br
  //-   //- div(:style=`{height: '100px'}`).row.full-width.bg-red
  //-   //-   small.full-width nodeMiddle: {{nodeMiddle}}
  //-   //-   small.full-width nodeMiddleOid: {{nodeMiddleOid}}
  //-   composition(v-if="nodeMiddleOid && $refs['node-'+nodeMiddleOid][0].nodeFull" :composition="$refs['node-'+nodeMiddleOid][0].nodeFull.compositions[0]" :visible="true")
  //- node opened dialog
  q-dialog(v-model="nodeDialogOpened" :maximized="true" full-height)
    div(@click.self="nodeDialogOpened = false" :style=`{position: 'relative'}`).row.fit.items-start.content-start.justify-center.bg-grey-10
      //- q-btn(
      //-   round flat color="green" icon="keyboard_arrow_left" @click="nodeDialogOpened = false"
      //-   :style=`{position: 'fixed', top: '16px', left: '16px', zIndex: 2000}`)
      node(ctx="explorer" :node="node" :nodeFullReady="nodeFull" :visible="true" :active="true" layout="opened")
  node(
    v-for="(n, ni) in nodes" :key="n.oid" :accessKey="`${ni}-${n.oid}`"
    v-if="nodesBan ? !nodesBan.includes(n.oid) : true" layout="pip"
    :ref="'node-'+n.oid" :ctx="'list'"
    :node="n" :index="ni"
    :needFull="ni >= nodeMiddle-1 && ni <= nodeMiddle+1"
    :needFullPreload="!(ni >= nodeMiddle-1 && ni <= nodeMiddle+1) && ni >= nodeMiddle-8 && ni <= nodeMiddle+8"
    :visible="ni >= nodeMiddle-1 && ni <= nodeMiddle+1"
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
    ).bg-grey-2
    //- border: nodeMiddle === ni ? '2px solid red' : 'none'
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
  methods: {
    nodeMiddleHandler (isVisible, entry) {
      // this.$log('nodeMiddleHandler')
      if (isVisible) {
        let arr = entry.target.accessKey.split('-')
        let index = arr[0]
        let oid = arr[1]
        this.nodeMiddleOid = oid
        this.nodeMiddle = parseInt(index)
        let nodeRef = this.$refs['node-' + oid][0]
        this.$log('*** nodeRef', nodeRef)
        this.nodeTop = nodeRef.$el.offsetTop
        this.$log('*** nodeTop', this.nodeTop)
        // this.nodeTop = this.nodeMiddle
        // this.$log(`np-test: nodeMiddle=${this.nodeMiddle}, throttle=${this.throttle} name=${this.nodes[this.nodeMiddle].name}`)
      }
    }
  },
  async mounted () {
    this.$log(' mounted')
    // this.throttle = 2000
    // await this.$wait(2000)
    // this.throttle = 300
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
