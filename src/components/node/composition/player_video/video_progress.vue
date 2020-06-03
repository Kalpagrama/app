<template lang="pug">
div(
  :style=`{
    position: 'absolute', zIndex: 1000, bottom: '0px',
    borderRadius: '0px', overflow: 'hidden',
    background: statePlayer.playing ? 'none' : ctx === 'workspace' ? 'rgb(0,0,0)' : 'none',
    background: statePlayer.playing ? 'none' : ctx === 'workspace' ? 'linear-gradient(0deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)' : 'none',
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
      round dense flat color="grey-4" @click="statePlayer.playing ? player.pause() : player.play()"
      :icon="statePlayer.playing ? 'pause' : 'play_arrow'"
      :style=`{zIndex: 1400}`)
    //- stats
    q-btn(
      flat dense color="grey-4"
      :style=`{
      }`)
      small.text-white.q-mr-sm {{ $time(now) }} /
      small.text-white {{ $time(duration) }}
    q-btn(
      round dense flat color="grey-4" @click="mutedToggle()"
      :icon="statePlayer.muted ? 'volume_off' : 'volume_up'"
      :style=`{zIndex: 1400}`)
    q-btn(
      round dense flat color="grey-4" @click="videoForward(0)"
      icon="fast_rewind"
      )
    q-btn(
      round dense flat color="white" @click="videoForward(1)"
      icon="fast_forward")
    q-btn(
      round dense flat color="grey-4" @click="layerAgain()"
      icon="refresh"
      :style=`{order: 1}`)
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
        width: barWidth ? barWidth+'%' : (now/duration)*100+'%',
        height: barHeight+'px',
        borderRadius: barHeight/2+'px',
        pointerEvents: 'none',
        userSelect: 'none',
        overflow: 'hidden',
      }`).bg-green
</template>

<script>
export default {
  name: 'playerVideo-videoProgress',
  props: ['ctx', 'visible', 'active', 'mini', 'player', 'statePlayer'],
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
    duration () {
      if (this.ctx === 'workspace') {
        return this.statePlayer.duration
      }
      else {
        return this.statePlayer.layerEnd - this.statePlayer.layerStart
      }
    },
    now () {
      if (this.ctx === 'workspace') {
        return this.statePlayer.now
      }
      else {
        return this.statePlayer.now - this.statePlayer.layerStart
      }
    },
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
    layerAgain () {
      this.$log('layerAgain')
      this.player.setCurrentTime(this.statePlayer.layerStart)
      this.player.play()
    },
    setCurrentTime (t) {
      t = this.ctx === 'workspace' ? t : t + this.statePlayer.layerStart
      this.player.setCurrentTime(t)
      this.player.update(t)
    },
    mutedToggle () {
      this.$log('mutedToggle')
    },
    videoForward (right) {
      // this.$log('videoForward', right)
      let t = this.now
      if (right) {
        t += 10
        if (t > this.duration) t = this.duration
      }
      else {
        t -= 10
        if (t < 0) t = 0
      }
      this.setCurrentTime(t)
      // this.player.update(t)
    },
    barDrag (e) {
      // this.$log('barDrag', e)
      if (e.isFirst) {
        let left = e.evt.layerX || e.position.left
        // alert('barDrag first' + left)
        if (this.ctx === 'workspace') this.statePlayer.set('mode', 'content')
        this.$tween.to(this, 0.3, {barHeight: this.barHeightMax})
        this.barWidth = (left / this.$el.clientWidth) * 100
      }
      if (e.isFinal) {
        // alert('barDrag final')
        this.$tween.to(this, 0.3, {barHeight: this.barHeightMin})
        this.barWidth = null
      }
      this.barWidth += (e.delta.x / this.$el.clientWidth) * 100
      let t = (this.barWidth / 100) * this.duration
      if (t > 0) {
        this.setCurrentTime(t)
        // this.player.update(t)
      }
      // this.$log('t', t)
      // this.player.setCurrentTime(t)
    },
    barClick (e) {
      // this.$log('barClick', e)
      if (this.ctx === 'workspace') this.statePlayer.set('mode', 'content')
      let width = e.target.clientWidth
      let left = e.offsetX
      let t = (this.duration * left) / width
      this.setCurrentTime(t)
      // tween to
      let tPercentNow = (this.now / this.duration) * 100
      let tPercentNext = (t / this.duration) * 100
      this.barWidth = tPercentNow
      this.$tween.to(this, 0.3, {
        barWidth: tPercentNext,
        barHeight: this.barHeightMin,
        onComplete: () => {
          this.barWidth = null
          // this.player.update(t)
        }
      })
    }
  },
  mounted () {
    // this.$log('mounted')
  },
  beforeDestroy () {
    // this.$log('beforeDestroy')
  }
}
</script>
