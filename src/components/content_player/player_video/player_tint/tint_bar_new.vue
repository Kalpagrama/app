<template lang="pug">
div(
  :style=`{
    position: 'relative',
    height: '50px',
  }`).row.q-px-sm
  div(
    :style=`{
      position: 'relative',
    }`
    ).row.fit
    //- time
    small(
      :style=`{
        position: 'absolute', zIndex: 200, left: '8px', bottom: '-3px',
        fontSize: '8px',
      }`
      ).text-white {{$time(player.currentTime)}} / {{$time(player.duration)}}
    //- zoom out
    q-btn(
      v-if="zoomed"
      @click="zoomOut()"
      round flat dense color="white" icon="remove_circle_outline" size="sm"
      :style=`{
        position: 'absolute', zIndex: 200, right: '-12px', top: '-12px',
      }`)
    //- tint
    //- div(
      v-if="!zoomed"
      @click="tintClick"
      :style=`{
        position: 'absolute', zIndex: 200,
      }`
      ).row.fit.br
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
            :style=`{
              position: 'absolute', zIndex: 3000,
            }`
            ).row.fit
          //- figure
          div(
            :style=`{
              position: 'absolute', zIndex: 1000,
              top: '-4px', left: '33%',
              width: '10%', height: 'calc(100% + 8px)',
              border: '4px solid rgb(76,175,79)',
              borderRadius: '10px',
            }`
            ).row
          //- figures
          div(
            v-for="(f,fi) in player.figures" :key="fi"
            :style=`{
              position: 'absolute', zIndex: 1000+fi,
              left: (f.figures[0].t/player.duration)*100+'%',
              width: ((f.figures[1].t-f.figures[0].t)/player.duration)*100+'%',
              height: '100%',
              //- background: 'rgba(200,200,200,0.3)',
              background: rateMeta.find(r => f.node.rate >= r.valueMin && f.node.rate < r.valueMax).colorBackground,
              opacity: 0.2,
            }`
            ).row
          //- currentTime
          div(
            v-if="!zoomed"
            :style=`{
              position: 'absolute', zIndex: 2000,
              left: (player.currentTime/player.duration)*100+'%',
              height: '100%',
              width: '2px',
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
              borderLeft: zoomed ? '1px solid rgb(200,200,200,0.1)' : 'none'
            }`
            ).row
            small(
              v-if="zoomed ? true : minWidthMin > 40"
              :style=`{
                fontSize: '8px',
              }`).text-grey-6.q-mx-xs {{ mi < 60 ? mi + 'm' : $time(mi * 60, true) }}
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
</template>

<script>
import { EventApi } from 'src/api/event'

export default {
  name: 'tintBarNew',
  props: ['player', 'contentKalpa'],
  data () {
    return {
      width: 0,
      height: 0,
      heightBar: 24,
      minWidth: 0,
      zoomed: null,
      zoomWorking: false,
      zoomPercent: null,
      zoomWrapperScrollingTimer: null,
      zoomWrapperScrolling: false,
      zoomWrapperScrollingAuthor: null,
      playerCurrentTimeTimer: null,
      leftRightMarginWidth: 0,
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
    rateMeta () {
      return [
        {name: EventApi.verbalizeRate(0.2), value: 0, valueMin: -1, valueMax: 0.2, color: 'rgba(255,26,5,1)', colorBackground: 'rgba(255,26,5,0.5)', order: 5},
        {name: EventApi.verbalizeRate(0.4), value: 0.25, valueMin: 0.2, valueMax: 0.4, color: 'rgba(255,221,2,0.7)', colorBackground: 'rgba(255,221,2,0.5)', order: 4},
        {name: EventApi.verbalizeRate(0.6), value: 0.5, valueMin: 0.4, valueMax: 0.6, color: 'rgba(75,172,79,0.7)', colorBackground: 'rgba(75,172,79,0.5)', order: 3},
        {name: EventApi.verbalizeRate(0.8), value: 0.75, valueMin: 0.6, valueMax: 0.8, color: 'rgba(44,85,179,0.7)', colorBackground: 'rgba(44,85,179,0.5)', order: 2},
        {name: EventApi.verbalizeRate(1), value: 1, valueMin: 0.8, valueMax: 2, color: 'rgba(113,49,164,1)', colorBackground: 'rgba(113,49,164,0.5)', order: 1}
      ]
    },
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
    zoomWrapperOnScroll (e) {
      this.$log('zoomWrapperOnScroll', this.zoomWrapperScrollingAuthor)
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
      this.$log({scrollWidth: scrollWidth, scrollLeft: scrollLeft, t: t})
      this.player.setCurrentTime(t)
    },
    zoomWrapperOnPan (e) {},
    async zoomOut () {
      this.$log('zoomOut')
      this.zoomed = false
      this.player.pause()
      // need to save currentTime
      this.zoomWrapperScrollingAuthor = 'player'
      await this.$wait(500)
      this.zoomWrapperScrollingAuthor = null
    },
    tintClick (e) {
      this.$log('tintClick', e)
      let left = e.layerX
      let width = e.target.clientWidth
      this.$log({left, width})
      this.zoomPercent = left / width
      this.zoomed = !this.zoomed
      let t = this.zoomPercent * this.player.duration
      this.player.setCurrentTime(t)
    },
  },
  mounted () {
    this.$log('mounted', this.player.duration)
    // this.zoomed = true
    let {width, height} = this.$refs['zoom-wrapper'].getBoundingClientRect()
    this.width = width
    this.height = height
    let minCount = Math.ceil(this.player.duration / 60)
    let minWidthMin = this.width / minCount
    this.$log({minWidthMin: minWidthMin, minCount: minCount, width: width})
    this.minWidth = minWidthMin
  }
}
</script>
