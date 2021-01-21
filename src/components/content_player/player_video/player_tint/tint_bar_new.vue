<template lang="pug">
div(
  :style=`{
    position: 'relative',
  }`).row.full-width.q-px-sm
  div(
    :style=`{
      position: 'relative',
      height: '36px',
      opacity: 0.1,
    }`
    ).row.full-width
    //- middle currentTime
    div(
      v-if="zoomed"
      :style=`{
        position: 'absolute', zIndex: 200, left: 'calc(50% + 1px)',
        width: '2px',
        height: '100%',
        pointerEvents: 'none',
      }`
      ).row.bg-red
    //- scroll
    div(
      ref="zoom-wrapper"
      @scroll="zoomWrapperOnScroll"
      :class=`{
        //- br: zoomWrapperScrolling
      }`
      :style=`{
        position: 'absolute', zIndex: 100,
      }`
      ).row.fit.items-center.content-center.scroll.q-py-sm
      .row.no-wrap
        //- left padding
        div(
          @click="zoomed = false"
          :style=`{
            width: leftRightMarginWidth+'px',
            minWidth: leftRightMarginWidth+'px',
            height: heightBar+'px',
          }`
          ).row
        //- middle wrapper
        div(
          ref="minutes-wrapper"
          :style=`{
            position: 'relative',
            height: heightBar+'px',
            overflow: 'visible',
          }`
          ).row.no-wrap
          //- tint
          div(
            v-if="!zoomed"
            @click="tintClick"
            v-touch-pan.mouse.prevent="tintOnPan"
            :style=`{
              position: 'absolute', zIndex: 3000,
            }`
            ).row.fit
          //- figure editor
          transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
            tint-bar-figure(
              v-if="player && player.figure"
              :player="player"
              :convert="convertPxToTime"
              :style=`{
                left: 'calc(' + (player.figure[0].t/player.duration)*100+'% - 6px)',
                width:'calc(' + ((player.figure[1].t-player.figure[0].t)/player.duration)*100+'% + 16px)',
              }`
              @first="zoomWorking = true"
              @final="zoomWorking = false")
          //- figures
          div(
            v-for="(f,fi) in player.figures" :key="fi"
            :style=`{
              position: 'absolute', zIndex: 1000+fi,
              left: (f.figures[0].t/player.duration)*100+'%',
              width: ((f.figures[1].t-f.figures[0].t)/player.duration)*100+'%',
              height: '100%',
              //- background: 'rgba(200,200,200,0.3)',
              background: $rateMeta.find(r => f.node.rate >= r.valueMin && f.node.rate < r.valueMax).colorBackground,
              opacity: 0.2,
            }`
            ).row
          //- currentTime
          transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
            div(
              v-if="!zoomed"
              :style=`{
                position: 'absolute', zIndex: 2000,
                left: (player.currentTime/player.duration)*100+'%',
                height: '100%',
                width: '2px',
                pointerEvents: 'none',
              }`
              ).row.bg-red
          //- minutes
          div(
            v-for="(m,mi) in minCount" :key="mi"
            :style=`{
              zIndex: 101+mi,
              height: heightBar+'px',
              width: (mi === minCount-1) ? minWidth*minDelta+'px' : minWidth+'px',
              minWidth: (mi === minCount-1) ? minWidth*minDelta+'px' : minWidth+'px',
              //- borderLeft: (minWidthMin < 40 && mi !== 0) ?  : '1px solid rgb(200,200,200,0.1)' : 'none',
              borderLeft: (mi !== 0 && (minWidthMin > 40 || zoomed)) ? '1px solid rgb(200,200,200,0.1)' : 'none'
            }`
            ).row
            small(
              v-if="zoomed ? true : minWidthMin > 50"
              :style=`{
                fontSize: '8px',
                marginLeft: mi === 0 ? '8px' : '4px',
              }`).text-grey-6 {{ mi < 60 ? mi + 'm' : $time(mi * 60, true) }}
          //- background
          div(
            :style=`{
              position: 'absolute', zIndex: 100,
              borderRadius: '10px',
            }`
            ).row.fit.b-40
        //- right padding
        div(
          @click="zoomed = false"
          :style=`{
            width: leftRightMarginWidth+'px',
            minWidth: leftRightMarginWidth+'px',
            height: heightBar+'px',
          }`
          ).row
  //- footer
  div(
    :style=`{
      position: 'relative',
    }`
    ).row.full-width.items-center.content-center.q-pl-sm
    //- time
    small.text-grey-6.q-mr-xs {{$time(player.currentTime)}}
    small.text-grey-8 / {{$time(player.duration)}}
    .col
    //- middle: zoomIn/zoomOut
    div(
      :style=`{
        position: 'absolute', zIndex: 100,
        left: 'calc(50% - 10px)',
      }`
      ).row.full-height.items-center.content-center
      q-btn(
        v-if="zoomed"
        @click="zoomOut()"
        round flat dense color="grey-6" size="sm")
        q-icon(name="unfold_less").rotate-90
      q-btn(
        v-if="!zoomed"
        @click="zoomIn()"
        round flat dense color="grey-6" size="sm")
        q-icon(name="unfold_more").rotate-90
    //- right side
    q-btn(
      round flat dense color="grey-6" icon="more_vert" size="sm").q-mr-sm
    q-btn(
      round flat dense color="grey-6" icon="fullscreen" size="sm").q-mr-sm
    slot(name="actions")
</template>

<script>
export default {
  name: 'tintBarNew',
  props: ['player', 'contentKalpa'],
  components: {
    tintBarFigure: () => import('./tint_bar_figure.vue'),
  },
  data () {
    return {
      width: 0,
      height: 0,
      heightBar: 20,
      minWidth: 0,
      zoomed: null,
      zoomWorking: false,
      zoomPercent: null,
      zoomWrapperScrollingTimer: null,
      zoomWrapperScrolling: false,
      zoomWrapperScrollingAuthor: null,
      playerCurrentTimeTimer: null,
      leftRightMarginWidth: 0,
      tintPanning: false,
      tintRect: null,
      convertRect: null,
    }
  },
  computed: {
    minCount () {
      return Math.ceil(this.player.duration / 60)
    },
    minDelta () {
      let p = this.player.duration % 60
      return p / 60
    },
    minWidthMin () {
      // let res = this.width / this.minCount
      // if (res * this.minCount < this.width) {
      //   return this.width / this.minDelta
      // }
      // else {
      //   return res
      // }
      return this.width / this.minCount
    },
    minWidthMax () {
      return this.width * 0.8
    },
    duration () {
      return this.player.duration
    }
  },
  watch: {
    'player.currentTime': {
      async handler (to, from) {
        if (this.zoomWrapperScrolling) return
        if (!this.zoomed) return
        if (this.zoomWorking) return
        this.$log('player.currentTime TO', to)
        let ref = this.$refs['minutes-wrapper']
        let {width} = ref.getBoundingClientRect()
        let scrollLeft = (to / this.player.duration) * width
        this.zoomWrapperScrollingAuthor = 'player'
        this.$refs['zoom-wrapper'].scrollLeft = scrollLeft
        if (this.playerCurrentTimeTimer) {
          clearTimeout(this.playerCurrentTimeTimer)
          this.playerCurrentTimeTimer = null
        }
        this.playerCurrentTimeTimer = setTimeout(() => {
          this.zoomWrapperScrollingAuthor = null
        }, 200)
      }
    },
    zoomed: {
      // immediate: true,
      handler (to, from) {
        this.$log('zoomed TO', to)
        this.zoomWorking = true
        this.$tween.to(this, 0.5, {
          leftRightMarginWidth: to ? this.width / 2 : 0,
          minWidth: to ? this.minWidthMax : this.minWidthMin,
          onCopmplete: async () => {
            this.$log('zoomed onComplete')
            this.zoomWorking = false
          },
          onUpdate: () => {
            if (!this.zoomPercent) return
            // this.$log('zoomed onUpdate')
            let ref = this.$refs['minutes-wrapper']
            let {width} = ref.getBoundingClientRect()
            let scrollLeft = (this.zoomPercent * width)
            // this.$log('zoomed onUpdate scrollLeft', scrollLeft)
            this.$refs['zoom-wrapper'].scrollLeft = scrollLeft
          }
        })
      }
    },
  },
  methods: {
    convertPxToTime (px) {
      // width (300px) ___ player.duration
      // px                t
      if (this.convertRect === null) {
        this.convertRect = this.$refs['minutes-wrapper'].getBoundingClientRect()
      }
      let width = this.convertRect.width
      let t = (px * this.duration) / width
      return t
    },
    setCurrentTime (t) {
      // this.$log('setCurrentTime', t)
      // TODO: handle figures/offset here...
      this.player.setCurrentTime(t)
    },
    zoomWrapperOnScroll (e) {
      // this.$log('zoomWrapperOnScroll', this.zoomWrapperScrollingAuthor)
      if (this.zoomWrapperScrollingTimer) {
        clearTimeout(this.zoomWrapperScrollingTimer)
        this.zoomWrapperScrollingTimer = null
      }
      else {
        this.player.pause()
      }
      this.zoomWrapperScrolling = true
      this.zoomWrapperScrollingTimer = setTimeout(() => {
        this.zoomWrapperScrolling = false
      }, 200)
      // whos first?
      if (this.zoomWorking) return
      if (this.zoomWrapperScrollingAuthor === 'player') return
      // do stuff
      let ref = this.$refs['zoom-wrapper']
      let scrollWidth = ref.scrollWidth - (this.leftRightMarginWidth * 2)
      let scrollLeft = ref.scrollLeft
      let t = (scrollLeft / scrollWidth) * this.player.duration
      // this.$log({scrollWidth: scrollWidth, scrollLeft: scrollLeft, t: t})
      this.player.setCurrentTime(t)
    },
    zoomWrapperOnPan (e) {},
    async zoomIn () {
      this.$log('zoomIn')
      // this.zoomWrapperScrollingAuthor = 'player'
      this.zoomPercent = this.player.currentTime / this.duration
      this.zoomed = true
      // await this.$wait(500)
      // this.zoomWrapperScrollingAuthor = null
      // do someting to save currentPosition...
    },
    async zoomOut () {
      this.$log('zoomOut')
      this.zoomed = false
      this.player.pause()
      // need to save currentTime
      this.zoomWrapperScrollingAuthor = 'player'
      await this.$wait(550)
      this.zoomWrapperScrollingAuthor = null
    },
    tintClick (e) {
      this.$log('tintClick', e)
      let left = e.layerX
      let width = e.target.clientWidth
      this.$log({left, width})
      this.zoomPercent = left / width
      // this.zoomed = !this.zoomed
      let t = this.zoomPercent * this.player.duration
      this.player.setCurrentTime(t)
    },
    tintOnPan (e) {
      // this.$log('tintOnPan', e)
      if (e.isFirst) {
        this.$emit('started')
        this.tintPanning = true
      }
      if (e.isFinal) {
        this.$emit('ended')
        this.tintPanning = false
      }
      // get rect position...
      if (this.tintRect === null) {
        this.tintRect = this.$refs['minutes-wrapper'].getBoundingClientRect()
        // this.tintRectLeft = rect.left
      }
      let left = e.position.left - this.tintRect.left
      let width = this.tintRect.width
      // this.$log('left/width', left, width)
      if (left < 0 || left > width) {
        this.$log('left < 0 || left > width !')
        return
      }
      let t = left / width * this.duration
      // this.$log('t', t)
      this.setCurrentTime(t)
      // this.barClick({layerX: left, target: {clientWidth: width}})
    },
  },
  mounted () {
    this.$log('mounted', this.player.duration)
    // this.zoomed = true
    let {width, height} = this.$refs['zoom-wrapper'].getBoundingClientRect()
    this.$set(this, 'width', width)
    this.$set(this, 'height', height)
    // this.width = width
    // this.height = height
    this.$log('mounted', {minCount: this.minCount, minWidthMin: this.minWidthMin, minWidth: this.minWidth, minWidthMax: this.minWidthMax, width, height})
    // let minCount = Math.ceil(this.player.duration / 60)
    // let minWidthMin = this.width / minCount
    // this.$log({minWidthMin: minWidthMin, minCount: minCount, width: width})
    this.minWidth = this.minWidthMin
  }
}
</script>
