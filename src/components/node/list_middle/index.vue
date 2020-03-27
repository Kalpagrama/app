<template lang="pug">
.column.fit
  div(v-if="false" :style=`{height: '60px'}`).row.full-width.justify-center
    div(:style=`{color: 'white', maxWidth: $store.state.ui.maxWidthPage+'px'}`).row.fit.items-center
      span.full-width scrollTop: {{ scrollTop }}
      span.full-width nodeFirstHeight: {{nodeFirstHeight}}
  //- v-touch-swipe.mouse.vertical="onSwipe"
  div(
    ref="nodeListMiddleScroll"
    ).col.full-width.scroll
    .row.full-width.justify-center
      slot(name="header")
      div(
        :style=`{
          maxWidth: $store.state.ui.maxWidthPage+'px',
          paddingTop: paddingTop+'px',
          paddingBottom: paddingBottom+'px'
        }`
        ).row.fit.items-start.content-start.justify-start
        node(
          v-for="(n, ni, nii) in nodes" :key="n.oid" :accessKey="ni"
          v-if="nodesBan ? !nodesBan.includes(n.oid) : true" layout="pip"
          :ref="'node-'+n.oid" :ctx="'list'"
          :node="n" :index="ni"
          :needFull="ni >= nodeMiddle-0 && ni <= nodeMiddle+1"
          :needFullPreload="!(ni >= nodeMiddle-1 && ni <= nodeMiddle+1) && ni >= nodeMiddle-8 && ni <= nodeMiddle+8"
          :visible="ni >= nodeMiddle-0 && ni <= nodeMiddle+0"
          :active="nodeMiddle === ni"
          @height="ni === 0 ? onHeight($event) : 0"
          @tintClick="onSwipe({direction: $event > nodeMiddle ? 'up' : 'down'})"
          :style=`{borderRadius: '10px', overflow: 'hidden', marginBottom: '30px', marginTop: '30px'}`
          v-observe-visibility=`{
            callback: nodeMiddleHandler,
            throttle: throttle,
            intersection: {
              rootMargin: -($q.screen.height/2-10)+'px 0px'
            }
          }`)
</template>

<script>
export default {
  name: 'nodeList',
  props: {
    nodes: {type: Array},
    nodesBan: {type: Array, default () { return [] }},
    throttle: {type: Number, default () { return 200 }}
  },
  data () {
    return {
      nodeMiddle: 0,
      scrollTop: 0,
      paddingTop: 0,
      paddingBottom: 0
    }
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
    nodeMiddleHandler (isVisible, entry, i) {
      if (isVisible) {
        let index
        if (i >= 0) index = i
        else index = parseInt(entry.target.accessKey)
        this.nodeMiddle = index
        // help to swipe to node
        // if (index > 0 && !this.$q.screen.xs) this.onSwipe(null, index)
      }
    },
    onHeight (e) {
      this.$log('onHeight', e)
      this.paddingBottom = this.$refs.nodeListMiddleScroll.clientHeight / 2
      this.paddingTop = 60
      // let nodeFirstRef = this.$refs[`node-${this.nodes[0].oid}`][0]
      // this.$log('OH nodeFirstRef', nodeFirstRef)
      // let nodeFirstOffsetTop = nodeFirstRef.$el.offsetTop
      // this.$log('OH nodeFirstOffsetTop', nodeFirstOffsetTop)
      // let nodeFirstClientHeight = e
      // this.$log('OH nodeFirstClientHeight', nodeFirstClientHeight)
      // let d = (this.$refs.nodeListMiddleScroll.clientHeight - nodeFirstClientHeight) / 2
      // this.$log('OH d', d)
      // if (nodeFirstOffsetTop < d) {
      //   this.$log('OH nodeFirstOffsetTop < d')
      //   this.paddingTop = d
      // }
      // else {
      //   this.$log('OH nodeFirstOffsetTop > d')
      //   // this.paddingTop = nodeFirstOffsetTop - d
      // }
      // this.$log('OH', this.paddingTop)
    },
    onSwipe (e, i) {
      this.$log('onSwipe', e)
      let indexTo = i >= 0 ? i : e.direction === 'up' ? this.nodeMiddle + 1 : this.nodeMiddle - 1
      this.$log('onSwipe indexTo', indexTo)
      if (indexTo < 0 || indexTo > this.nodes.length - 1) return
      let nodeToOid = this.nodes[indexTo].oid
      this.$log('onSwipe nodeToOid', nodeToOid, this.nodes[indexTo].name)
      let nodeToRef = this.$refs[`node-${nodeToOid}`][0]
      this.$log('onSwipe nodeToRef', nodeToRef)
      let nodeToOffsetTop = nodeToRef.$el.offsetTop
      this.$log('onSwipe nodeToOffsetTop', nodeToOffsetTop)
      let nodeToClientHeight = nodeToRef.$el.clientHeight
      this.$log('onSwipe nodeToClientHeight', nodeToClientHeight)
      let scrollToDelta = (this.$refs.nodeListMiddleScroll.clientHeight - nodeToClientHeight) / 2
      this.$log('onSwipe scrollToDelta', scrollToDelta)
      let scrollTo = nodeToOffsetTop - scrollToDelta
      this.$tween.to(this.$refs.nodeListMiddleScroll, 0.4, {scrollTop: scrollTo})
    }
  },
  mounted () {
    window.onkeydown = (e) => {
      if (e.keyCode === 32) {
        this.onSwipe({direction: 'up'})
      }
    }
  }
}
</script>
