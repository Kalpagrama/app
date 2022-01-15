<template lang="pug">
.row.full-width.relative-position
  // middle currentTime
  div(
    :style=`{
      position: 'absolute',
      left: 'calc(50% + 0px)',
      top: '9px',
      width: '2px',
      height: heightBar+'px',
      pointerEvents: 'none',
    }`
    ).row.bg-green-10
  // bar
  //- scroll
  div(ref="scroll-bar" @scroll="scrollBarOnScroll").row.full-width.scroll.scroll-disable.q-py-sm.br
    q-resize-observer(@resize="scrollBarWidth = $event.width")
    .row.no-wrap
      //- left padding
      div(
        :style=`{
          width: leftRightMarginWidth+'px',
          minWidth: leftRightMarginWidth+'px',
          height: heightBar+'px',
          pointerEvents: 'none',
        }`
        ).row
      //- middle wrapper
      div(
        ref="minutes-wrapper"
        accessKey="minutes-wrapper"
        v-touch-pan.left.right.mouse="minutesWrapperDrag"
        @click="minutesWrapperClick"
        :style=`{
          position: 'relative',
          height: heightBar+'px',
          overflow: 'visible',
        }`
        ).row.no-wrap
        q-resize-observer(@resize="totalBarWidth = $event.width")
        //- figures editor
        figures-editor(
          v-if="player && player.figures && player.nodeMode === 'edit'"
          :player="player"
          :convert="convertPxToTime"
          @first="skipCurrentTimeChange = true, figureEditing = true"
          @final="skipCurrentTimeChange = false, figureEditing = false").fit.absolute.z-top
        //- minutes
        div(
          v-for="(m,mi) in minuteSectorCount" :key="mi"
          :style=`{
            zIndex: 101+mi,
            height: '100%',
            width: getSectorWidth(mi)+'px',
            minWidth: getSectorWidth(mi)+'px',
            borderLeft: (mi !== 0 ) ? '1px solid rgb(200,200,200,0.1)' : 'none',
            pointerEvents: 'none',
            overflow: 'hidden',
          }`
          ).row
          small(
            :style=`{
              fontSize: '8px',
              marginLeft: mi === 0 ? '8px' : '4px',
            }`).text-grey-6 {{ mi < 60 ? mi + 'm' : $time(mi * 60, true) }}
        //- background
        div(
          :style=`{
            position: 'absolute', zIndex: 100,
            borderRadius: '10px',
            opacity: 0.8,
            pointerEvents: 'none',
          }`
          ).row.fit.b-50
      //- right padding
      div(
        :style=`{
          width: leftRightMarginWidth+'px',
          minWidth: leftRightMarginWidth+'px',
          height: heightBar+'px',
          pointerEvents: 'none',
        }`
        ).row
  // actions
  figures-actions(v-bind="$props")
</template>

<script>
import figuresActions from './figures_actions.vue'
import figuresEditor from './figures_editor.vue'
import nodeFocused from './node_focused.vue'
import { assert } from 'src/system/common/utils'

export default {
  name: 'fragmentEditor',
  props: ['player', 'contentKalpa', 'options'],
  components: {
    figuresActions,
    figuresEditor,
    nodeFocused,
  },
  data () {
    return {
      heightBar: 40,
      skipCurrentTimeChange: false,
      figureEditing: false,
      scrollBarWidth: 0,
      totalBarWidth: 0,
    }
  },
  computed: {
    minuteSectorCount () {
      return Math.ceil(this.player.duration / 60)
    },
    minuteWidth () { // ширина минуты в пикселях
      let minuteWidth = this.scrollBarWidth * 0.8 // минута должна быть чуть меньше экрана
      if (minuteWidth * (this.player.duration / 60) < this.scrollBarWidth) { // если текущий размер минуты * число минут меньше ширины экрана - увеличиваем размер минуты так чтобы они занимали весь экран
        minuteWidth = this.scrollBarWidth / (this.player.duration / 60)
      }
      return Math.ceil(minuteWidth)
    },
    scrollLeft () {
      return (this.player.currentTime / this.player.duration) * this.scrollBarWidth
    },
    leftRightMarginWidth () {
      return this.scrollBarWidth / 2
    }
  },
  watch: {
    'player.currentTime': {
      async handler (to, from) {
        if (this.skipCurrentTimeChange) return
        // this.$log('player.currentTime TO', to)
        let scrollLeft = (to / this.player.duration) * this.totalBarWidth
        this.$gsap.to(this.$refs['scroll-bar'], 0.3, {scrollLeft: scrollLeft})
      }
    },
  },
  methods: {
    getSectorWidth(sectorIndx) {
      assert(sectorIndx < this.minuteSectorCount)
      let sectorSecondCnt = sectorIndx === this.minuteSectorCount - 1 ? this.player.duration % 60 : 60
      assert(sectorSecondCnt <= 60)
      return Math.floor((sectorSecondCnt / 60) * this.minuteWidth)
    },
    convertPxToTime (px, _width) {
      let width = _width || this.totalBarWidth
      let t = (px * this.player.duration) / width
      return t
    },
    scrollBarOnScroll (e) {
      // whos first?
      if (this.skipCurrentTimeChange) return
      // do stuff
      let ref = this.$refs['scroll-bar']
      let scrollWidth = ref.scrollWidth - (this.leftRightMarginWidth * 2)
      let scrollLeft = ref.scrollLeft
      let t = (scrollLeft / scrollWidth) * this.player.duration
      // handle t figureOffset
      if (t < 0) t = 0
      if (t > this.player.duration) t = this.player.duration
      // this.$log({scrollWidth: scrollWidth, scrollLeft: scrollLeft, t: t})
      // setCurrentTime only in figures...
      if (!this.player.figures) return
      if (t >= this.player.figures[0].t && t <= this.player.figures[1].t) {
        this.player.setCurrentTime(t)
        this.figureEditing = false
      }
      else {
        if (t < this.player.figures[0].t) {
          this.player.setCurrentTime(this.player.figures[0].t)
        }
        if (t > this.player.figures[1].t) {
          this.player.setCurrentTime(this.player.figures[1].t)
        }
        this.figureEditing = true
      }
      // this.player.setCurrentTime(t)
      // set figures borders
      // if (!this.player.figures) return
      // if (this.player.figureFocused === 0) {
      //   this.player.figures[0].t = t
      // }
      // else if (this.player.figureFocused === 1) {
      //   this.player.figures[1].t = t
      // }
      // else {
      //   if (t < this.player.figures[0].t) this.player.figures[0].t = t
      //   if (t > this.player.figures[1].t) this.player.figures[1].t = t
      // }
    },
    tintClick (e) {
      // this.$log('tintClick', e)
      let left = e.layerX
      let width = e.target.clientWidth
      this.$log({left, width})
      let currentRelativePosition = left / width
      let t = currentRelativePosition * this.player.duration
      this.$log('t', t)
      this.player.setCurrentTime(t)
    },
    tintOnPan (e) {
      // get rect position...
      let tintRect = this.$refs['minutes-wrapper'].getBoundingClientRect()
      let left = e.position.left - tintRect.left
      let width = this.totalBarWidth
      if (left < 0 || left > width) {
        this.$logT('left < 0 || left > width !')
        return
      }
      let t = left / width * this.player.duration
      this.player.setCurrentTime(t)
    },
    minutesWrapperDrag (e) {
      // this.$log('minutesWrapperDrag', e)
      if (this.figureEditing) return
      if (this.$q.platform.has.touch) return
      this.$refs['scroll-bar'].scrollLeft -= e.delta.x
    },
    minutesWrapperClick (e) {
      this.$log('minutesWrapperClick', e.target.accessKey)
      if (this.player.figureFocused !== null) this.player.setState('figureFocused', null)
      let left = e.layerX
      let width = e.target.clientWidth
      this.$log({left, width})
      let t = this.player.figures[0].t + ((left / width) * (this.player.figures[1].t - this.player.figures[0].t))
      this.$log('t', t)
      this.player.setCurrentTime(t)
      // figures
      if (!this.player.figures) return
      if (t < this.player.figures[0].t) this.player.figures[0].t = t
      if (t > this.player.figures[1].t) this.player.figures[1].t = t
      // scroll
      let scrollLeft = (t / this.player.duration) * this.totalBarWidth
      this.skipCurrentTimeChange = true
      this.$gsap.to(this.$refs['scroll-bar'], 0.3, {
        scrollLeft: scrollLeft,
        onComplete: () => {
          this.skipCurrentTimeChange = false
        }
      })
    }
  },
  mounted () {
    this.$log('mounted')
    // this.scrollBarWidth = this.$refs['scroll-bar'].getBoundingClientRect().width
  }
}
</script>
