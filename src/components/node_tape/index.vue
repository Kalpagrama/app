<template lang="pug">
div(:style=`{position: 'relative', oveflow: 'hidden'}`).column.fit
  //- header
  div(v-if="header" :style=`{height: '50px'}`).row.full-width.bg-white
  //- debug
  div(v-if="debug").row.full-width.bg-red
    small.full-width width/height: {{width}}/{{height}}
    small.full-width clientWidth/clientHeight: {{clientWidth}}/{{clientHeight}}
    small.full-width scrollTop/scrollHeight: {{scrollTop}}/{{scrollHeight}}
    small.full-width nodeActive: {{nodeActive}}
  //- debug swipes
  q-btn(
    round color="green" icon="keyboard_arrow_up" @click="swipeDown()"
    :style=`{position: 'absolute', zIndex: 1000, bottom: '70px', left: '10px'}`)
  q-btn(
    round color="green" icon="keyboard_arrow_down" @click="swipeUp()"
    :style=`{position: 'absolute', zIndex: 1000, bottom: '70px', right: '10px'}`)
  //- node active ghost
  nodeTapeNode(
    v-if="node" ref="nodeActive"
    :node="node" :nodeIndex="0"
    :active="true"
    :opened="true"
    :width="width"
    :style=`{
      position: 'absolute',
      zIndex: 10000,
      borderRadius: '10px', overflow: 'hidden',
      top: nodeOffsetHeight+'px'
    }`).bg-white
  //- tint
  div(:style=`{position: 'absolute', zIndex: tintIndex, top: 0, left: 0, pointerEvents: 'none', background: 'rgba(0,0,0,'+tintOpacity+')'}`).row.fit
  //- body scroll
  div(ref="scrollWrapper" @scroll="onScroll"
    v-touch-swipe.mouse.down="swipeDown"
    v-touch-swipe.mouse.up="swipeUp"
    ).col.full-width.scroll
    div.row.full-width.justify-center
      div(
        :style=`{maxWidth: '500px', paddingBottom: $q.screen.height+'px'}`
        ).row.full-width.items-start.content-start
        q-resize-observer(ref="onResizeObserver" @resize="onResize")
        nodeTapeNode(
          v-for="(n, ni) in nodes" :key="n.oid"
          :ref="`node${n.oid}`"
          @nodeClick="nodeClick(n, ni)"
          @nodeName="nodeName(n, ni)"
          :width="width"
          :node="n" :nodeIndex="ni"
          :active="nodeActive === ni"
          :class=`{
            'cursor-pointer': nodeActive !== ni
          }`
          :style=`{
            zIndex: nodeActive === ni ? 300 : 100,
            borderRadius: '10px', oveflow: 'hidden'}`).bg-white.q-mt-xl
</template>

<script>
import nodeTapeNode from './node'

export default {
  name: 'nodeTape',
  components: {nodeTapeNode},
  props: ['nodes'],
  data () {
    return {
      debug: false,
      header: false,
      scrollTop: 0,
      scrollHeight: 0,
      clientWidth: 0,
      clientHeight: 0,
      width: 0,
      height: 0,
      nodeActive: 0,
      node: null,
      nodeTop: 0,
      nodeOffsetTop: 0,
      nodeOffsetHeight: 0,
      nodeClientHeight: 0,
      tintIndex: 200,
      tintOpacity: 0.35
    }
  },
  computed: {
    nodesCount () {
      return this.nodes.length
    }
  },
  methods: {
    nodeName (n, ni, e) {
      this.$log('nodeName')
      let node = this.$refs[`node${n.oid}`][0]
      this.$log('node', node)
      this.nodeClientHeight = node.$el.clientHeight
      this.nodeOffsetTop = node.$el.offsetTop
      this.$log('nodeOffsetTop', this.nodeOffsetTop)
      this.nodeOffsetHeight = node.$el.offsetHeight
      this.$log('nodeOffsetHeight', this.nodeOffsetHeight)
      // set node
      this.node = n
      this.$tween.to(
        this,
        0.2,
        {
          nodeOffsetHeight: 50,
          tintOpacity: 0.9,
          tintIndex: 1000,
          onComplete: () => {
            this.$log('nodeName DONE')
            this.$router.push(`/app/node/${n.oid}`)
          }
        }
      )
    },
    nodeClick (n, ni, e) {
      this.$log('nodeClick', n, ni, e)
      this.node = null
      if (this.nodeActive === ni) return
      this.nodeActive = ni
      this.$log('node', this.$refs[`node${n.oid}`][0].$el.offsetTop)
      let node = this.$refs[`node${n.oid}`][0]
      let offsetTop = node.$el.offsetTop
      let clientHeight = node.$el.clientHeight
      let scrollTo = offsetTop - (this.$q.screen.height - clientHeight) / 2
      this.$tween.to(
        this.$refs.scrollWrapper,
        0.2,
        {
          scrollTop: scrollTo,
          onComplete: () => {
            this.$log('SCROLLED TO', scrollTo)
          }
        }
      )
    },
    swipeUp (e) {
      if (this.nodesCount === this.nodeActive + 1) return
      this.$log('swipeUp', e)
      this.nodeClick(this.nodes[this.nodeActive + 1], this.nodeActive + 1, null)
      // this.nodeActive++
    },
    swipeDown (e) {
      if (this.nodeActive === 0) return
      this.$log('swipeDown', e)
      this.nodeClick(this.nodes[this.nodeActive - 1], this.nodeActive - 1, null)
      // this.nodeActive--
    },
    onScroll (e) {
      // this.$log('onScroll', e)
      this.scrollTop = e.target.scrollTop
      this.scrollHeight = e.target.scrollHeight
      this.clientHeight = e.target.clientHeight
      this.clientWidth = e.target.clientWidth
    },
    onResize (e) {
      this.$log('onResize', e)
      // if (this.scrollTop !== 0) this.$refs.scrollWrapper.scrollTop = this.scrollTop
      this.width = e.width
      this.height = e.height
    }
  },
  async mounted () {
    this.$log('mounted')
    if (this.$refs.onResizeObserver) this.$refs.onResizeObserver.trigger()
    // await this.$wait(500)
    // this.$refs.scrollWrapper.scrollTop = 100
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
