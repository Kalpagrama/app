<template lang="pug">
.row.full-width
  // bar
  div(:style=`{height: barHeight+'px'}`).row.full-width.relative-position
    // middle currentTime
    div(
      :style=`{
        position: 'absolute',
        left: 'calc(50% + 0px)',
        width: '2px',
        top: '0px',
        height: barHeight+'px',
        pointerEvents: 'none',
      }`
      ).row.bg-green-10.z-top
    //- scroll
    div(
      ref="zoom-wrapper"
      @scroll="zoomWrapperOnScroll"
      @mousemove="zoomWrapperMousemove"
      :class=`{
        //- br: zoomWrapperScrolling
      }`
      :style=`{
        position: 'absolute', zIndex: 100,
        overflowY: 'hidden',
        overflowX: figureEditing ? 'hidden !important' : 'auto',
      }`
      ).row.fit.items-center.content-center.scroll.scroll-disable.q-py-sm.br
      q-resize-observer(@resize="zoomWrapperOnResize")
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
        //- @mousemove="minutesWrapperMousemove"
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
          //- figures editor
          transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
            figures-editor(
              v-if="player && player.figures && player.nodeMode === 'edit'"
              :player="player"
              :convert="convertPxToTime"
              @first="zoomWorking = true, figureEditing = true"
              @final="zoomWorking = false, figureEditing = false").fit.absolute.z-top
          //- minutes
          div(
            v-for="(m,mi) in minCount" :key="mi"
            :style=`{
              zIndex: 101+mi,
              //- height: heightBar+'px',
              height: '100%',
              width: (mi === minCount-1) ? minWidth*minDelta+'px' : minWidth+'px',
              minWidth: (mi === minCount-1) ? minWidth*minDelta+'px' : minWidth+'px',
              //- borderLeft: (minWidthMin < 40 && mi !== 0) ?  : '1px solid rgb(200,200,200,0.1)' : 'none',
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
          //- @mouseleave="currentTimeHoverPercent = null"
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
      barHeight: 50,
      barWrapperPaddingX: 5,
      width: 0,
      height: 0,
      heightBar: 20,
      heightBarMin: 20,
      heightBarMax: 40,
      heightWrapper: 50,
      heightWrapperMin: 60,
      heightWrapperMax: 90,
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
      figureEditing: false,
      currentTimeHover: 0,
      currentTimeHoverTimer: null,
      currentTimeHoverTime: null,
      currentTimeHoverPercent: null,
      zoomWrapperMousemoveRect: null,
      minutesWrapperDragging: false,
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
      let minWidthMin = this.width / this.minCount
      let width = 0
      for (let i = 0; i < this.minCount; i++) {
        if (i + 1 === this.minCount) {
          width += minWidthMin * this.minDelta
        }
        else {
          width += minWidthMin
        }
      }
      // this.$log('width/this.width', {width: width, 'this.width': this.width})
      // if we got smaller then width...
      if (width < this.width) {
        return minWidthMin / (width / this.width)
        // return minWidthMin
      }
      else {
        return minWidthMin
      }
    },
    minWidthMax () {
      let minWidthMax = this.width * 0.8
      let width = 0
      for (let i = 0; i < this.minCount; i++) {
        if (i + 1 === this.minCount) {
          width += minWidthMax * this.minDelta
        }
        else {
          width += minWidthMax
        }
      }
      if (width < this.width) {
        return this.minWidthMin
      }
      else {
        return minWidthMax
      }
    },
    minWidthTotal () {
      let width = 0
      for (let i = 0; i < this.minCount; i++) {
        if (i + 1 === this.minCount) {
          width += this.minWidthMin * this.minDelta
        }
        else {
          width += this.minWidthMin
        }
      }
      return width
    },
    duration () {
      return this.player.duration
    }
  },
  watch: {
    'player.currentTime': {
      async handler (to, from) {
        if (this.zoomWrapperScrolling) return
        if (this.zoomWorking) return
        // this.$log('player.currentTime TO', to)
        let ref = this.$refs['minutes-wrapper']
        let {width} = ref.getBoundingClientRect()
        let scrollLeft = (to / this.player.duration) * width
        this.zoomWrapperScrollingAuthor = 'player'
        // this.$refs['zoom-wrapper'].scrollLeft = scrollLeft
        this.$gsap.to(this.$refs['zoom-wrapper'], 0.3, {scrollLeft: scrollLeft})
        if (this.playerCurrentTimeTimer) {
          clearTimeout(this.playerCurrentTimeTimer)
          this.playerCurrentTimeTimer = null
        }
        this.playerCurrentTimeTimer = setTimeout(() => {
          this.zoomWrapperScrollingAuthor = null
        }, 300)
      }
    },
    zoomed: {
      immediate: true,
      handler (to, from) {
        this.$log('zoomed TO', to)
        this.zoomWorking = true
        if (to) this.width += 32
        else this.width -= 32
        this.$gsap.to(this, 0.5, {
          barWrapperPaddingX: to ? 0 : 16,
          leftRightMarginWidth: to ? this.width / 2 : 0,
          minWidth: to ? this.minWidthMax : this.minWidthMin,
          onComplete: async () => {
            this.$log('zoomed onComplete')
            // this.zoomWorking = false
            // set scrollLeft finally...
            await this.$wait(300)
            let ref = this.$refs['minutes-wrapper']
            let {width} = ref.getBoundingClientRect()
            let scrollLeft = (this.zoomPercent * (width))
            // this.$log('zoomed onUpdate scrollLeft', scrollLeft)
            // this.$refs['zoom-wrapper'].scrollLeft = scrollLeft
            // this.zoomWorking = false
            this.$gsap.to(this.$refs['zoom-wrapper'], 0.5, {
              scrollLeft: scrollLeft,
              onComplete: () => {
                this.player.play()
                this.zoomWorking = false
              }
            })
          },
          onUpdate: () => {
            if (!this.zoomPercent) return
            this.$log('zoomed onUpdate')
            let ref = this.$refs['minutes-wrapper']
            let {width} = ref.getBoundingClientRect()
            let scrollLeft = (this.zoomPercent * width)
            // this.$log('zoomed onUpdate scrollLeft', scrollLeft)
            this.$refs['zoom-wrapper'].scrollLeft = scrollLeft
          }
        })
        // this.$gsap.to(this.$refs['zoom-wrapper'], 1, {
        //   scrollLeft:
        // })
      }
    },
  },
  methods: {
    zoomWrapperMousemove (e) {
      // this.$log('zoomWrapperMouseMove', e)
      let rect = this.$refs['minutes-wrapper'].getBoundingClientRect()
      let y = e.clientY
      let x = e.clientX
      // this.$log({y, yMinutes})
      if (y < rect.top || y > rect.bottom || x < rect.left || x > rect.right) {
        this.currentTimeHoverPercent = null
        this.currentTimeHoverTime = null
      }
      else {
        this.currentTimeHoverPercent = (x - rect.left) / rect.width * 100
        this.currentTimeHoverTime = ((x - rect.left) / rect.width) * this.player.duration
      }
    },
    convertPxToTime (px, _width) {
      // width (300px) ___ player.duration
      // px                t
      if (this.convertRect === null) {
        this.convertRect = this.$refs['minutes-wrapper'].getBoundingClientRect()
      }
      let width = _width || this.convertRect.width
      let t = (px * this.duration) / width
      return t
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
        this.figureEditing = false
        this.zoomWrapperScrolling = false
      }, 500)
      // whos first?
      if (this.zoomWorking) return
      if (this.zoomWrapperScrollingAuthor === 'player') return
      // do stuff
      let ref = this.$refs['zoom-wrapper']
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
    zoomWrapperOnPan (e) {},
    tintClick (e) {
      // this.$log('tintClick', e)
      let left = e.layerX
      let width = e.target.clientWidth
      this.$log({left, width})
      this.zoomPercent = left / width
      let t = this.zoomPercent * this.player.duration
      this.$log('t', t)
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
      this.currentTimeHoverPercent = (left / width) * 100
      this.currentTimeHoverTime = (left / width) * this.player.duration
      // this.$log('t', t)
      this.player.setCurrentTime(t)
      // this.barClick({layerX: left, target: {clientWidth: width}})
    },
    zoomWrapperOnResize (e) {
      // this.$log('zoomWrapperOnResize', e)
      this.width = e.width
      this.height = e.height
    },
    minutesWrapperDrag (e) {
      // this.$log('minutesWrapperDrag', e)
      if (this.figureEditing) return
      if (e.isFirst) {
        this.minutesWrapperDragging = true
      }
      if (e.isFinal) {
        this.minutesWrapperDragging = false
      }
      if (this.$q.platform.has.touch) return
      this.$refs['zoom-wrapper'].scrollLeft -= e.delta.x
    },
    minutesWrapperClick (e) {
      this.$log('minutesWrapperClick', e.target.accessKey)
      // if (e.target.accessKey !== 'minutes-wrapper') return
      if (this.player.figureFocused !== null) this.player.setState('figureFocused', null)
      if (e.target.accessKey === 'minutes-wrapper-tint') {
        let left = e.layerX
        let width = e.target.clientWidth
        this.$log('minutesWrapperClick', {left, width})
        let t = (left / width) * this.player.duration
        this.$log('t', t)
        // Handle outside click when nodeFocused
        if (this.player.figures) {
          // let figures = this.player.node.items[0].layers[0].figuresAbsolute
          if (t < this.player.figures[0].t || t > this.player.figures[1].t) {
            // Destroy nodeFocused
            // alert('Destroy nodeFocused here...')
            this.player.setState('node', null)
            this.player.setState('nodeMode', null)
            this.player.setCurrentTime(t)
          }
        }
      }
      if (e.target.accessKey === 'figures-wrapper') {
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
        let ref = this.$refs['minutes-wrapper']
        let {width: widthMinutes} = ref.getBoundingClientRect()
        let scrollLeft = (t / this.player.duration) * widthMinutes
        this.zoomWorking = true
        this.$gsap.to(this.$refs['zoom-wrapper'], 0.3, {
          scrollLeft: scrollLeft,
          onComplete: () => {
            this.zoomWorking = false
          }
        })
      }
    }
  },
  mounted () {
    this.$log('mounted')
    let rect = this.$refs['zoom-wrapper'].getBoundingClientRect()
    this.width = rect.width
    this.minWidth = this.minWidthMin
    this.zoomWrapperScrollingAuthor = 'player'
    this.player.pause()
    this.zoomPercent = this.player.currentTime / this.duration
    this.zoomed = true
    this.zoomWrapperScrollingAuthor = null
    this.$gsap.to(this, 0.5, {
      heightBar: this.heightBarMax,
      heightWrapper: this.heightWrapperMax,
    })
  }
}
</script>
