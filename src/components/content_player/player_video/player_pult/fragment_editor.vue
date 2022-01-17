<template lang="pug">
.row.full-width.relative-position
  // scrollbar
  div(ref="scroll-bar"
    :style=`{ overflowY: 'hidden', overflowX: figureEditing ? 'hidden !important' : 'auto'}`
    @scroll="scrollBarOnScroll"
    ).row.full-width.scroll.scroll-disable.q-py-sm
    q-resize-observer(@resize="scrollBarWidth = $event.width")
    .row.no-wrap
      //- left padding
      div( :style=`{ width: scrollBarWidth / 2 +'px', pointerEvents: 'none'}`).row
      //- middle
      div(
        ref="total-bar"
        accessKey="total-bar"
        v-touch-pan.left.right.mouse="totalBarWrapperDrag"
        @click="totalBarWrapperClick"
        :style=`{ height: heightBar+'px', overflow: 'visible'}`
        ).row.no-wrap.relative-position
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
            height: '100%',
            width: getSectorWidth(mi)+'px',
            borderLeft: (mi !== 0 && mi !== minuteSectorCount-1) ? '1px solid rgb(200,200,200,0.1)' : 'none',
            pointerEvents: 'none',
          }`
          ).row
          small(:style=`{ fontSize: '8px', marginLeft: mi === 0 ? '8px' : '4px'}`).text-grey-6 {{ mi < 60 ? mi + 'm' : $time(mi * 60, true) }}
        //- background
        div(:style=`{ pointerEvents: 'none'}`).row.fit.absolute.b-50.br-10.op-80
        // playHead
        div(:style=`{ position: 'absolute',left: playHeadX + 'px',width: '2px',height: '100%',pointerEvents: 'none'}`).row.bg-green-8.br-5.z-max
      //- right padding
      div(:style=`{ width: scrollBarWidth / 2 + 'px', pointerEvents: 'none'}`).row
  // actions
  figures-actions(v-bind="$props")
</template>

<script>
import figuresActions from './figures_actions.vue'
import figuresEditor from './figures_editor.vue'
import nodeFocused from './node_focused.vue'
import { assert } from 'src/system/common/utils'
import { scroll } from 'quasar'
const { getScrollTarget, getHorizontalScrollPosition, getScrollWidth } = scroll

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
      playHeadX: 0,
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
    }
  },
  watch: {
    'player.currentTime': {
      immediate: true,
      async handler (to, from) {
        this.$gsap.to(this, 0.3, {playHeadX: (this.player.currentTime / this.player.duration) * this.totalBarWidth})
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
      this.scrollGuard()
    },
    totalBarWrapperDrag (e) {
      // this.$logT('totalBarWrapperDrag', e)
      if (this.figureEditing) return
      if (this.$q.platform.has.touch) return
      this.$refs['scroll-bar'].scrollLeft -= e.delta.x
    },
    totalBarWrapperClick (e) {
      this.$logT('totalBarWrapperClick', e.target.accessKey, e)
      if (this.player.figureFocused !== null) this.player.setState('figureFocused', null)
      if (e.target.accessKey === 'figures-editor') {
        let left = e.layerX
        let width = e.target.clientWidth
        this.$log({left, width})
        let t = this.player.figures[0].t + ((left / width) * (this.player.figures[1].t - this.player.figures[0].t))
        this.$log('t', t)
        this.player.setCurrentTime(t)
      } else {
        let t = (e.layerX * this.player.duration) / this.totalBarWidth
        this.player.setCurrentTime(t)
        if (!this.player.figures) return
        if (t < this.player.figures[0].t) this.player.figures[0].t = t
        if (t > this.player.figures[1].t) this.player.figures[1].t = t
      }
    },
    scrollGuard(whole = false) {
      if (!this.ignoreScrollGuard && this.player.figures.length){
        let rangeStart = (this.scrollBarWidth / 2) + ((this.player.figures[0].t * this.totalBarWidth) / this.player.duration)
        let rangeEnd = (this.scrollBarWidth / 2) + ((this.player.figures[1].t * this.totalBarWidth) / this.player.duration)
        let screenStart = getHorizontalScrollPosition(this.$refs['scroll-bar'])
        let screenEnd = screenStart + this.scrollBarWidth
        let scrollLeft = -1
        if (whole && (rangeStart >= screenEnd || rangeEnd <= screenStart)) scrollLeft = rangeStart - this.scrollBarWidth / 10
        else if (rangeStart >= screenEnd) scrollLeft = rangeStart - this.scrollBarWidth
        else if (rangeEnd <= screenStart) scrollLeft = rangeEnd
        if (scrollLeft >= 0) {
          this.ignoreScrollGuard = true
          this.$gsap.to(this.$refs['scroll-bar'], 0.3, {
            scrollLeft: scrollLeft,
            onComplete: () => {
              this.ignoreScrollGuard = false
            }
          })
        }
      }
    }
  },
  mounted () {
    this.$log('mounted')
    this.$wait(300).then(() => {
      this.scrollGuard(true)
    })
  }
}
</script>
