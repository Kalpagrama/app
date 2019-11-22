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
    small.full-width nodesVisible: {{nodesVisible}}
  //- debug swipes
  q-btn(
    round color="green" icon="keyboard_arrow_up" @click="swipeDown()"
    :style=`{position: 'absolute', zIndex: 1000, bottom: '70px', left: '10px'}`)
  q-btn(
    round color="green" icon="keyboard_arrow_down" @click="swipeUp()"
    :style=`{position: 'absolute', zIndex: 1000, bottom: '70px', right: '10px'}`)
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
        ).row.full-width.items-start.content-start.q-px-xs
        q-resize-observer(ref="onResizeObserver" @resize="onResize")
        node(
          v-for="(n, ni) in nodes" :key="n.oid"
          :ref="`node${n.oid}`"
          @nodeClick="nodeClick(n, ni)"
          :width="width"
          :needFull="nodeActive === ni"
          :noActions="true"
          :noSpheres="true"
          :noTimestamp="true"
          :node="n" :nodeIndex="ni" :lang="ni"
          :active="nodeActive === ni"
          :class=`{
            'cursor-pointer': nodeActive !== ni
          }`
          :style=`{
            zIndex: nodeActive === ni ? 300 : 100,
            borderRadius: '10px', oveflow: 'hidden'}`
          v-observe-visibility=`{
            callback: nodeVisible,
            throttle: 230,
            intersection: {
              threshold: 0.98
            }
          }`).bg-white.q-mt-xl
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
      scrollTimeout: null,
      scrolling: false,
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
      tintOpacity: 0.35,
      nodesVisible: [],
      muted: true
    }
  },
  computed: {
    nodesCount () {
      return this.nodes.length
    }
  },
  methods: {
    nodeVisible (isVisible, entry) {
      if (isVisible) {
        this.$log('nodeVisible', isVisible, entry.target.lang)
        this.nodesVisible.unshift(Number(entry.target.lang))
        if (this.nodesVisible.length > 20) this.nodesVisible.length = 10
      } else {
        // this.$log('nodeVisible', entry.target.lang)
      }
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
      let offsetBottom = clientHeight - offsetTop
      // let scrollTo = offsetTop - (this.$q.screen.height - clientHeight) / 2
      let scrollTo = offsetTop - clientHeight
      this.$log('offsetTop/offsetBottom/clientHeight/scrollTo', offsetTop, offsetBottom, clientHeight, scrollTo)
      this.$tween.to(
        this.$refs.scrollWrapper,
        0.2,
        {
          scrollTop: scrollTo > 0 ? scrollTo : 0,
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
    },
    swipeDown (e) {
      if (this.nodeActive === 0) return
      this.$log('swipeDown', e)
      this.nodeClick(this.nodes[this.nodeActive - 1], this.nodeActive - 1, null)
    },
    onScroll (e) {
      // this.$log('onScroll', e)
      this.scrollTop = e.target.scrollTop
      this.scrollHeight = e.target.scrollHeight
      this.clientHeight = e.target.clientHeight
      this.clientWidth = e.target.clientWidth
      // if (this.scrollTimeout) {
      //   clearInterval(this.scrollTimeout)
      //   this.scrollTimeout = null
      // }
      // this.scrollTimeout = setTimeout(() => {
      //   this.onScrolled()
      // }, 230)
    },
    onScrolled () {
      this.$log('onScrolled')
      // this.nodeClick(this.nodes[this.nodesVisible[0]], this.nodesVisible[0])
    },
    onResize (e) {
      // this.$log('onResize', e)
      // if (this.scrollTop !== 0) this.$refs.scrollWrapper.scrollTop = this.scrollTop
      // TODO: memorize last scroll position
      // wait for all the nodes to load their first previews...
      this.width = e.width
      this.height = e.height
    }
  },
  async mounted () {
    this.$log('mounted')
    if (this.$refs.onResizeObserver) this.$refs.onResizeObserver.trigger()
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
