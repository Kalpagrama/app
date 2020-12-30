<template lang="pug">
div(
  @click="barClick"
  @mousemove="barMousemove"
  @mouseleave="barMouseleave"
  @mouseenter="barMouseenter"
  v-touch-pan.left.right.prevent.mouse="barPan"
  accessKey="bar-body"
  :style=`{
    position: 'relative', height: '20px', borderRadius: '8px',
  }`).row.full-width.b-50
  //- play/pause
  //- q-btn(
    @click="player.playing ? player.pause() : player.play()"
    round flat dense color="white"
    :icon="player.playing ? 'pause' : 'play_arrow'"
    :style=`{
      position: 'absolute', left: '-44px', bottom: '-6px',
    }`)
  q-btn(
    @click="player.setState('isFullscreen', !player.isFullscreen)"
    round flat dense color="white"
    :icon="player.isFullscreen ? 'fullscreen_exit' : 'fullscreen'"
    :style=`{
      position: 'absolute', left: '-44px', bottom: '-6px',
    }`)
  q-btn(
    round flat dense
    :color="player.mutedLocal ? 'red' : 'white'"
    :style=`{
        position: 'absolute', right: '-44px', bottom: '-6px',
      }`)
    q-icon(
      :name="player.mutedLocal ? 'volume_off' : 'volume_up'"
      :color="player.mutedLocal ? 'red' : 'white'"
      size="20px" @click="volumeToggle()"
      )
  //- actions
  //- div(
    :style=`{
      position: 'absolute', zIndex: 300, top: '-34px', left: '0px',
    }`
    ).row
    //- q-btn(
      round flat dense
      :color="player.mutedLocal ? 'red' : 'white'")
      q-icon(
        :name="player.mutedLocal ? 'volume_off' : 'volume_up'"
        :color="player.mutedLocal ? 'red' : 'white'"
        size="20px" @click="volumeToggle()")
    q-btn(
      @click="player.setState('isFullscreen', !player.isFullscreen)"
      round flat dense color="white"
      :icon="player.isFullscreen ? 'fullscreen_exit' : 'fullscreen'")
  //- currentTime/duration
  small(
    :style=`{
      position: 'absolute', zIndex: 300,
      pointerEvents: 'none', left: '8px', top: '2px',
      userSelect: 'none',
    }`
    ).text-grey-4 {{$time(currentTime)}} / {{$time(duration)}}
  //- currentTime width/line
  div(
    :style=`{
      position: 'absolute', zIndex: 200, left: '0px', top: '0px',
      width: (currentTime/duration)*100+'%',
      pointerEvents: 'none',
      borderRadius: '10px 0 0 10px',
    }`
    ).row.full-height.b-80
  //- currentTime line
  div(
    :style=`{
      position: 'absolute', zIndex: 2100, left: '0px', top: '-5px',
      left: 'calc('+(currentTime/duration)*100+'% - 2px)',
      width: '3px', borderRadius: '1px', overflow: 'hidden',
      height: 'calc(100% + 10px)',
      pointerEvents: 'none',
    }`
    ).row.bg-red
  //- onMoving over line currentTime
  div(
    v-if="currentTimeMove"
    :style=`{
      position: 'absolute', zIndex: 200, top: '-4px',
      left: 'calc('+(currentTimeMove/duration)*100+'% - 2px)',
      height: 'calc(100% + 8px)',
      width: '4px', borderRadius: '2px', overflow: 'hidden',
      pointerEvents: 'none',
      opacity: 0.9,
    }`
    ).row.bg-red
  //- onMoving over rect label
  div(
    v-if="currentTimeMove"
    :style=`{
      position: 'absolute', zIndex: 9999, top: '-40px',
      left: 'calc('+(currentTimeMove/duration)*100+'% - 2px)',
      borderRadius: '10px 10px 10px 0', overflow: 'hidden',
      pointerEvents: 'none',
      opacity: 0.9,
    }`
    ).row.text-white.q-pa-sm.bg-red {{ $time(currentTimeMove) }}
  //- onPanning line currentTime
  div(
    v-if="panning"
    :style=`{
      position: 'absolute', zIndex: 200, top: '-4px',
      left: 'calc('+currentTimePercent+'% - 2px)',
      height: 'calc(100% + 8px)',
      width: '4px', borderRadius: '2px', overflow: 'hidden',
      pointerEvents: 'none',
      opacity: 0.9,
    }`
    ).row.bg-red
  //- onPanning rect label
  div(
    v-if="panning"
    :style=`{
      position: 'absolute', zIndex: 9999, top: '-40px',
      left: 'calc('+currentTimePercent+'% - 2px)',
      borderRadius: '10px 10px 10px 0', overflow: 'hidden',
      pointerEvents: 'none',
      userSelect: 'none',
      opacity: 0.9,
    }`
    ).row.text-white.q-pa-sm.bg-red {{ $time(currentTimePercent/100*duration) }}
  //- POINTS
  div(
    v-if="player && player.points && player.points.length > 0"
    :style=`{
      position: 'absolute', zIndex: 2050, pointerEvents: 'none',
      borderRadius: '10px', pointerEvents: 'none', overflow: 'hidden',
    }`
    ).row.fit
    div(
      v-for="(f,fi) in player.points" :key="fi"
      :style=`{
        position: 'absolute', zIndex: 2050, top: '0px',
        left: f[0].t/duration*100+'%',
        width: '2px',
        background: 'rgba(255,255,255, 0.5)',
        pointerEvents: 'none',
      }`
      ).row.full-height
  //- FIGURES
  div(
    v-if="player && player.figures && player.figures.length > 0"
    :style=`{
      position: 'absolute', zIndex: 2050, pointerEvents: 'none',
      borderRadius: '10px', pointerEvents: 'none',
      //- overflow: 'hidden',
    }`
    ).row.fit
    //- TODO: left and width -3px + 6px etc...
    div(
      v-for="(f,fi) in player.figures" :key="fi"
      :style=`{
        position: 'absolute', zIndex: 2050, top: '-3px',
        left: f[0].t/duration*100+'%',
        width: (f[1].t-f[0].t)/duration*100+'%',
        height: 'calc(100% + 6px)',
        border: '3px solid rgb(76,175,80)',
        borderRadius: '4px',
        background: 'rgba(255,255,255,0.2)',
        pointerEvents: 'none',
      }`
      ).row
</template>

<script>
export default {
  name: 'playerBar',
  props: ['player', 'contentKalpa', 'start', 'end', 'mini'],
  data () {
    return {
      panning: false,
      currentTimeMove: 0,
      currentTimePercent: null,
      currentTimePanned: 0,
    }
  },
  computed: {
    currentTime () {
      if (this.start && this.end) {
        return this.player.currentTime - this.start
      }
      else {
        return this.player.currentTime
      }
    },
    duration () {
      if (this.start && this.end) {
        return this.end - this.start
      }
      else {
        return this.player.duration
      }
    }
  },
  watch: {
    'player.currentTime': {
      handler (to, from) {
        if (this.start && this.end) {
          // this.$log('player.currentTime TO', to, this.end)
          if (to >= this.end) {
            // this.$log('PLAYER TO START start&&end', to, this.end)
            this.setCurrentTime(0)
            this.player.play()
          }
          if (to < this.start) {
            this.setCurrentTime(0)
            // this.player.play()
          }
          if (to === this.start) {
            this.player.play()
          }
        }
        else {
          // this.player.play()
        }
      }
    }
  },
  mounted () {
    if (!this.start || !this.end) {
      this.player.play()
    }
    // TODO: platform handle
    // if (this.$q.platform)
    if (localStorage.getItem('k_volume')) {
      this.player.setState('muted', false)
    }
    else {
      this.player.setState('muted', true)
    }
  },
  methods: {
    volumeToggle () {
      this.$log('volumeToggle')
      if (this.player.muted) {
        this.player.setState('muted', false)
        localStorage.setItem('k_volume', 'on')
      }
      else {
        this.player.setState('muted', true)
        localStorage.removeItem('k_volume')
      }
    },
    setCurrentTime (t) {
      if (this.start && this.end) {
        this.player.setCurrentTime(t + this.start)
      }
      else {
        this.player.setCurrentTime(t)
      }
    },
    barClick (e) {
      // this.$log('barClick', e)
      // this.$log('barClick accessKey', e.target.accessKey)
      if (e.target.accessKey !== 'bar-body') return
      let left = e.layerX
      let width = e.target.clientWidth
      if (left > width) return
      // this.$log('left/width', left, width)
      let t = (left / width) * this.duration
      this.$log('t', this.$time(t))
      this.player.events.emit('bar-click', {t: t})
      this.setCurrentTime(t)
      this.$wait(400).then(() => {
        this.currentTimeMove = null
      })
    },
    barMouseenter (e) {
      // this.$log('barMouseenter', e)
    },
    barMouseleave (e) {
      // this.$log('barMouseleave', e)
      this.currentTimeMove = null
    },
    barMousemove (e) {
      // this.$log('barMousemove', e)
      // this.$log('barMousemove accessKey', e.target.accessKey)
      if (e.target.accessKey !== 'bar-body') return
      let left = e.layerX
      let width = e.target.clientWidth
      // this.$log('left/width', left, width)
      let t = (left / width) * this.duration
      this.currentTimeMove = t
    },
    barPan (e) {
      // this.$log('barPan', e)
      if (e.isFirst) {
        this.panning = true
        // this.player.pause()
        let left = e.position.left - this.$el.getBoundingClientRect().left
        this.currentTimePercent = (left / this.$el.clientWidth) * 100
        this.currentTimeMove = null
      }
      if (e.isFinal) {
        this.currentTimePercent = null
        this.currentTimeMove = null
        if (this.currentTimePanned) this.setCurrentTime(this.currentTimePanned)
        this.panning = false
      }
      if (!this.currentTimePercent) return
      this.currentTimePercent += (e.delta.x / this.$el.clientWidth) * 100
      let t = (this.currentTimePercent / 100) * this.duration
      if (t > 0 && t < this.duration) {
        this.currentTimePanned = t
        this.setCurrentTime(t)
      }
    }
  }
}
</script>
