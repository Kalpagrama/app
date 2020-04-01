<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit
  //- div(:style=`{height: '60px'}`).row.full-width.items-center.content-center.q-px-sm
  //-   span.text-white extra explore
  //- header
  transition(appear enter-active-class="animated slideInDown" leave-active-class="animated fadeOut")
    div(
      v-if="headerShow"
      :style=`{position: 'absolute', zIndex: 200, height: '60px', top: '0px'}`
      ).row.full-width.items-center.content-center.bg-grey-10
      small.text-white scrollTop: {{ scrollTop }}
      small.text-white.full-width scrollTopDirection: {{scrollTopDirection}}
      small.text-white.full-width scrollDirection: {{scrollDirection}}
  transition(appear enter-active-class="animated slideInUp" leave-active-class="animated fadeOut")
    div(
      v-if="headerShow"
      :style=`{position: 'absolute', zIndex: 200, height: '60px', bottom: '0px'}`
      ).row.full-width.items-center.content-center.bg-red
      small.text-white scrollTop: {{ scrollTop }}
      small.text-white.full-width scrollTopDirection: {{scrollTopDirection}}
      small.text-white.full-width scrollDirection: {{scrollDirection}}
  div(
    ref="extraExploreScroll"
    :style=`{overflow: scrollOverflow ? 'auto' : 'hidden'}`
    @scroll="onScroll").col.full-width.scroll
    div(v-touch-swipe.mouse.capture="onSwipe").row.fit.justify-center
      div(
        v-for="(c,ci) in 100" :key="ci"
        :style=`{paddingBottom: '60px'}`).row.fit.q-px-xs.q-pt-xs
        div(:style=`{borderRadius: '10px'}`).row.fit.items-start.content-start.bg-grey-9
          //- span.text-white chain {{ ci }}
          img(
            :src="node.meta.compositions[0].thumbUrl" draggable="false"
            :style=`{borderRadius: '10px', overflow: 'hidden', objectFit: 'contain', pointerEvents: 'none'}`).full-width
  .row.full-width
</template>

<script>
export default {
  name: 'nodeExplorer_extraExplore',
  props: ['node'],
  data () {
    return {
      scrollDirection: null,
      scrollTop: 0,
      scrollTopDirection: 0,
      scrollOverflow: false,
      headerShow: false
    }
  },
  watch: {
    scrollDirection: {
      handler (to, from) {
        this.scrollTopDirection = this.scrollTop
        if (to && to === 'up') {
          this.headerShow = true
        }
      }
    }
  },
  methods: {
    onSwipe (e) {
      this.$log('onSwipe', e)
      this.$q.notify('on swipe:' + e.direction)
      let ref = this.$refs.extraExploreScroll
      let to = e.direction === 'up' ? ref.scrollTop + ref.clientHeight : ref.scrollTop - ref.clientHeight
      this.$tween.to(this.$refs.extraExploreScroll, 0.3, {scrollTop: to})
    },
    onScroll (e) {
      // this.$log('onScroll', e)
      let to = e.target.scrollTop
      if (to > this.scrollTop) this.scrollDirection = 'down'
      else this.scrollDirection = 'up'
      this.scrollTop = to
      if (this.scrollDirection === 'down' && to - this.scrollTopDirection > 60) this.headerShow = false
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
