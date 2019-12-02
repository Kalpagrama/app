<template lang="pug">
div(
  v-touch-swipe.down="swipeDown"
  v-touch-swipe.up="swipeUp"
  :style=`{height: '200px', borderRadius: '10px 10px 0 0', overflow: 'hidden'}`).row.full-width.bg-white
  //- v-touch-swipe.right="swipeRight"
  //- v-touch-swipe.left="swipeLeft"
  //- actions
  q-btn(
    round flat icon="menu"
    :style=`{position: 'absolute', zIndex: 2000, top: '10px', left: '10px'}`)
  q-btn(
    round flat icon="add" @click="$emit('create')"
    :style=`{position: 'absolute', zIndex: 2000, top: '10px', right: '10px'}`)
  //- points mini
  div(:style=`{position: 'absolute', zIndex: 1000, top: '0px', height: '63px', pointerEvents: 'none'}`).row.full-width.items-center.justify-center
    div(
      v-for="(p, pi) in points" :key="pi"
      :style=`{width: pi === current ? '30px' : '8px', height: '8px', borderRadius: '4px', overflow: 'hidden', background: $randomColor(pi)}`).q-mr-xs
  //- expand more icon
  q-icon(
    v-if="top === 0" name="expand_less" color="grey-6" size="24px"
    :style=`{position: 'absolute', zIndex: 1000, bottom: '10px', left: 'calc(50% - 12px)'}`)
  //- points list
  div(
    ref="pointsList" @scroll="handleScroll"
    :style=`{position: 'absolute', top: -top+'px', height: '200px'}`).row.full-width.items-center.scroll
    div(:style=`{position: 'relative'}`).row.full-width.items-center.no-wrap
      div(
        v-for="(p, pi) in points" :key="pi" @click="pointClick(p, pi)"
        v-touch-hold.mouse="pointHold(p, pi)"
        :style=`{height: '80px', width: '100%', minWidth: '100%'}`).row.q-pa-sm
        div(
          :style=`{position: 'relative', height: '80px', borderRadius: '10px', overflow: 'hidden'}`
          ).row.full-width.items-center.justify-center.bg-grey-3.q-px-sm
          div(:style=`{position: 'absolute', bottom: '0px', height: '5px', background: $randomColor(pi)}`).row.full-width
          .col
            .row.full-width.justify-center
              //- span {{ pi+1 }}/{{ current }}
              small {{ p }}
  //- point active editor
  div(
    :style=`{position: 'absolute', top: 200-top+'px', height: '200px',
      borderRadius: '10px 10px 0 0'}`
    ).row.full-width.items-center.justify-center
    point-editor(v-if="point" :current="current" :fragment="fragment" :point="point" :frames="frames" :now="now" :duration="duration" :width="width")
</template>

<script>
import pointEditor from './point_editor'

export default {
  name: 'pointsEditor',
  components: {pointEditor},
  props: ['now', 'duration', 'fragment', 'frames', 'width', 'video'],
  data () {
    return {
      top: 0,
      current: 0,
      scrolling: false,
      scrollTimer: null,
      scrollLeft: 0,
      swipeTimer: null
    }
  },
  computed: {
    pointsCount () {
      return this.fragment.relativePoints.length
    },
    points () {
      return this.fragment.relativePoints.filter((p, pi) => {
        return (pi + 1) % 2 !== 0
      })
    }
  },
  watch: {
    scrollLeft: {
      immediate: true,
      handler (to, from) {
        this.current = Math.round(to / this.$q.screen.width)
        this.point = this.points[this.current]
      }
    },
    current: {
      immediate: true,
      handler (to, from) {
        this.$logD('current CHANGED', to)
        let now = this.fragment.relativePoints[to]
        this.$logD('now', now)
      }
    }
  },
  methods: {
    handleScroll (e) {
      if (this.swiping) return
      // this.$logD('handleScroll', e.target.scrollLeft, this.$q.screen.width)
      this.scrolling = true
      this.scrollLeft = e.target.scrollLeft
      if (this.scrollTimer !== null) {
        clearTimeout(this.scrollTimer)
      }
      this.scrollTimer = setTimeout(() => {
        this.scrolling = false
        let k = this.scrollLeft / this.$q.screen.width
        // this.$logD('k', k)
        if (this.$isInteger(k)) {
          // this.$logD('IN position', k)
        } else {
          // this.$logD('NOT in position', k)
          this.$tween.to(this.$refs.pointsList, 0.3, {scrollLeft: this.$q.screen.width * Math.round(k)})
        }
      }, 150)
    },
    pointClick (p, pi) {
      this.$logD('pointClick', p, pi)
      this.swipeUp()
      // show frames line
    },
    pointHold (p) {
      // this.$logD('pointHold', p)
    },
    swipeDown (e) {
      this.$logD('swipeDown', e)
      this.$tween.to(this, 0.4, {top: 0})
    },
    swipeUp (e) {
      this.$logD('swipUp', e)
      this.$tween.to(this, 0.4, {top: 200})
    },
    swipeLeft (e) {
      this.$logD('swipeLeft', e)
      if (this.scrolling || e.duration < 100 || this.current === this.points.length - 1) return
      if (e.duration < 100) return
      this.swiping = true
      this.scrollLeft = this.$q.screen.width * (this.current + 1)
      this.$tween.to(this.$refs.pointsList, 0.3, {scrollLeft: this.scrollLeft})
      if (this.swipeTimer !== null) clearTimeout(this.swipeTimer)
      this.swipeTimer = setTimeout(() => {
        this.swiping = false
      }, 150)
    },
    swipeRight (e) {
      this.$logD('swipeRight', e)
      if (this.scrolling || e.duration < 100 || this.current === 0) return
      this.swiping = true
      this.scrollLeft = this.$q.screen.width * (this.current - 1)
      this.$tween.to(this.$refs.pointsList, 0.3, {scrollLeft: this.scrollLeft})
      if (this.swipeTimer !== null) clearTimeout(this.swipeTimer)
      this.swipeTimer = setTimeout(() => {
        this.swiping = false
      }, 150)
    }
  },
  async mounted () {
    this.$logD('mounted')
    await this.$wait(2000)
    // setInterval(() => {
    //   this.$refs.pointsList.scrollLeft += this.$q.screen.width
    // }, 1000)
  },
  beforeDestroy () {
    this.$logD('beforeDestroy')
  }
}
</script>
