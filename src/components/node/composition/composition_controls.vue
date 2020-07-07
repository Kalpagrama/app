<template lang="pug">
div(
  @mouseenter="mouseOverBar = true"
  @mouseleave="mouseOverBar = false"
  :style=`{
    position: 'absolute', zIndex: 2000, bottom: '0px',
    left: '50%',
    marginRight: '-50%',
    transform: 'translate(-50%, 0)',
    borderRadius: '0px', overflow: 'hidden',
  }`
  ).row.full-width.q-pa-md
  //- bar
  div(
    @click="barClick"
    v-touch-pan.mouse.left.right="barDrag"
    :style=`{
      position: 'absolute', zIndex: 1200, bottom: '0px', left: '0px', height: '17px',
      borderRadius: '0px', overflow: 'hidden',
      cursor: 'pointer'
    }`
    ).row.full-width
    div(
      :style=`{
        position: 'absolute', zIndex: 1300,
        left: '0px', bottom: '0px',
        width: barWidth ? barWidth+'%' : (currentTime/duration)*100+'%',
        height: barDragging ? barHeightMax+'px' : barHeight+'px',
        borderRadius: barHeight/2+'px',
        pointerEvents: 'none',
        userSelect: 'none',
        overflow: 'hidden',
      }`).bg-green
</template>

<script>
export default {
  name: 'compositionControls',
  props: ['ctx', 'visible', 'active', 'mini', 'player', 'playing', 'currentTime', 'duration'],
  data () {
    return {
      mouseOverBar: false,
      barHeight: 4,
      barHeightMax: 14,
      barHeightMin: 4,
      barWidth: null,
      barDragging: false
    }
  },
  computed: {
  },
  watch: {
    // visible: {},
    // active: {},
    // mini: {},
    mouseOverBar: {
      handler (to, from) {
        // this.$log('mouseOverBar', to)
        this.$tween.to(this, 0.3, {barHeight: to ? this.barHeightMax : this.barHeightMin})
      }
    }
  },
  methods: {
    setCurrentTime (t) {
      this.player.currentTime = t
    },
    // mutedToggle () {
    //   this.$log('mutedToggle')
    //   let m = !this.player.muted
    //   this.player.muted = m
    //   localStorage.setItem('k_muted', m)
    // },
    videoForward (right) {
      // this.$log('videoForward', right)
      let t = this.currentTime
      if (right) {
        t += 5
        if (t > this.duration) t = this.duration
      }
      else {
        t -= 5
        if (t < 0) t = 0
      }
      this.setCurrentTime(t)
    },
    barDrag (e) {
      // this.$log('barDrag', e)
      if (e.isFirst) {
        this.barDragging = true
        let left = e.evt.layerX || e.position.left
        this.$tween.to(this, 0.3, {barHeight: this.barHeightMax})
        this.barWidth = (left / this.$el.clientWidth) * 100
      }
      if (e.isFinal) {
        this.barDragging = false
        this.$tween.to(this, 0.3, {barHeight: this.barHeightMin})
        this.barWidth = null
      }
      if (!this.barWidth) return
      this.barWidth += (e.delta.x / this.$el.clientWidth) * 100
      let t = (this.barWidth / 100) * this.duration
      if (t > 0) {
        this.setCurrentTime(t)
      }
    },
    barClick (e) {
      // this.$log('barClick', e)
      let width = e.target.clientWidth
      let left = e.offsetX
      let t = (this.duration * left) / width
      this.setCurrentTime(t)
      // tween to
      let tPercentNow = (this.currentTime / this.duration) * 100
      let tPercentNext = (t / this.duration) * 100
      this.barWidth = tPercentNow
      this.$tween.to(this, 0.3, {
        barWidth: tPercentNext,
        barHeight: this.barHeightMin,
        onComplete: () => {
          this.barWidth = null
        }
      })
    }
  },
  mounted () {
    this.$log('mounted')
    // let kMuted = localStorage.getItem('k_muted')
    // this.$log('kMuted', kMuted)
    // if (kMuted !== undefined) {
    //   alert('kMuted' + kMuted)
    //   this.player.muted = kMuted
    // }
  },
  beforeDestroy () {
    // this.$log('beforeDestroy')
  }
}
</script>
