<template lang="pug">
div(
  :style=`{
    position: 'absolute', zIndex: 1000, bottom: '0px',
    borderRadius: '0px', overflow: 'hidden'
  }`
  ).row.full-width.q-pa-md
  //- actions
  div(
    :style=`{
      opacity: 0.8,
      background: 'rgba(0,0,0,0.4)',
      borderRadius: '10px',
      overflow: 'hidden',
    }`
    ).row
    q-btn(
      round dense flat color="grey-4" @click="playing ? player.pause() : player.play()"
      :icon="playing ? 'pause' : 'play_arrow'"
      :style=`{zIndex: 1400}`)
    q-btn(
      round dense flat color="grey-4" @click="videoForward(0)"
      icon="fast_rewind"
      )
    q-btn(
      flat dense color="grey-4"
      :style=`{
      }`)
      small.text-white.q-mr-sm {{ $time(currentTime) }} /
      small.text-white {{ $time(duration) }}
    q-btn(
      round dense flat color="white" @click="videoForward(1)"
      icon="fast_forward")
    q-btn(
      round dense flat color="grey-4" @click="mutedToggle()"
      :icon="player.muted ? 'volume_off' : 'volume_up'"
      :style=`{zIndex: 1400}`)
  //- bar
  div(
    @click="barClick"
    @mouseenter="mouseOverBar = true"
    @mouseleave="mouseOverBar = false"
    v-touch-pan.mouse.left.right="barDrag"
    :class=`{
      //- 'b-30': mouseOverBar
    }`
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
  name: 'videoControls',
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
    mutedToggle () {
      this.$log('mutedToggle')
      this.player.muted = !this.player.muted
    },
    videoForward (right) {
      // this.$log('videoForward', right)
      let t = this.currentTime
      if (right) {
        t += 10
        if (t > this.duration) t = this.duration
      }
      else {
        t -= 10
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
    let kalpaSound = localStorage.getItem('kalpa_sound')
    this.$log('kalpaSound', kalpaSound)
    if (kalpaSound === true) {
      this.player.muted = false
    }
  },
  beforeDestroy () {
    // this.$log('beforeDestroy')
  }
}
</script>
