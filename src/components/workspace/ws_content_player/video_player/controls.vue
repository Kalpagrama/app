<template lang="pug">
div(
  :style=`{
  }`).row.full-width.items-start.content-start
  //- tools
  div(
    :style=`{
    }`).row.full-width
    q-btn(
      @click="storePlayer.playPause()"
      round flat dense color="white"
      :icon="storePlayer.playing ? 'pause' : 'play_arrow'")
    //- q-btn(
    //-   round flat dense color="grey-2" icon="volume_up")
    .col
    q-btn(
      v-if="$q.screen.width > 370"
      round flat dense color="white" icon="fast_rewind" @click="fast(false)")
      q-tooltip(anchor="top middle" self="center middle") - 5 sec
    q-btn(flat dense color="white")
      small {{ $time(storePlayer.currentTime) }}
      small.q-mx-xs /
      small {{ $time(storePlayer.duration) }}
    q-btn(
      v-if="$q.screen.width > 370"
      round flat dense color="white" icon="fast_forward" @click="fast(true)")
      q-tooltip(anchor="top middle" self="center middle") + 5 sec
    .col
    slot(name="controlsTools")
  //- bar
  div(:style=`{position: 'relative', zIndex: 300}`).row.full-width.q-pt-xs
    div(
      @click="barClick"
      v-touch-pan.mouse.left.right="barDrag"
      @mousemove="barMove"
      @mouseenter="barOver = true"
      @mouseleave="barOver = null, barDragging ? null : barWidth = null"
      :style=`{
        position: 'relative', height: '30px',
        borderRadius: '10px', overflow: 'hidden',
        background: 'rgba(60,60,60,0.5)',
      }`).row.full-width
      //- bar: left
      div(
        :style=`{
          position: 'absolute', zIndex: 1000, top: '0px', left: '0px',
          width: storePlayer.currentTime/storePlayer.duration*100+'%',
          pointerEvents: 'none', userSelect: 'none',
          background: 'rgba(255,255,255,0.4)',
        }`).row.full-height
      //- barl left OVER
      div(
        v-show="barWidth"
        :style=`{
          position: 'absolute', zIndex: 1100, top: '0px', left: '0px',
          width: barWidth+'%',
          pointerEvents: 'none', userSelect: 'none',
          background: 'rgba(255,255,255,0.2)',
        }`
        ).row.full-height
    //- bar: currentTime
    div(
      :style=`{
        position: 'absolute', zIndex: 1100, top: '0px', height: 'calc(30px + 8px)',
        left: storePlayer.currentTime/storePlayer.duration*100+'%',
        width: '4px', borderRadius: '2px', overflow: 'hidden',
        pointerEvents: 'none',
      }`).bg-red
    //- TODO: bar: curerntTime OVER
    slot(name="controls")
</template>

<script>
export default {
  name: 'videoPlayer-controls',
  inject: ['sidPlayer'],
  data () {
    return {
      barClientWidth: 0,
      barWidth: null,
      barDragging: false,
      barOver: false,
      // nowHover: null,
      // nowHoverTime: 0,
    }
  },
  computed: {
    storePlayer () {
      return window.stores[this.sidPlayer]
    }
  },
  methods: {
    volumeToggle () {
      this.$log('volumeToggle')
      if (this.storePlayer.player.muted) this.storePlayer.player.setMuted(false)
      else this.storePlayer.player.setMuted(true)
    },
    fast (forward) {
      // this.$log('fast', forward)
      let t = this.storePlayer.currentTime
      if (forward) t += 5
      else t -= 5
      if (t < 0) t = 0
      if (t > this.storePlayer.duration) t = this.storePlayer.duration
      this.storePlayer.setCurrentTime(t)
      this.$emit('seeked')
    },
    barMove (e) {
      // this.$log('barMove', e)
      let left = e.offsetX
      // this.$log('left', left)
      let width = e.target.clientWidth
      this.barWidth = (left / width) * 100
      // this.$log('width', width)
      // this.nowHover = (left / width) * 100
      // this.nowHoverTime = (left / width) * this.storePlayer.duration
    },
    barClick (e) {
      this.$log('barClick', e)
      let width = e.target.clientWidth
      // this.$log('width', width)
      let left = e.offsetX
      // this.$log('left', left)
      let t = (left / width) * this.storePlayer.duration
      // this.$log('t', t)
      this.storePlayer.setCurrentTime(t)
      this.$emit('seeked')
    },
    barDrag (e) {
      // this.$log('barDrag', e)
      if (e.isFirst) {
        this.barDragging = true
        let left = e.position.left - this.$el.getBoundingClientRect().left
        this.barWidth = (left / this.$el.clientWidth) * 100
      }
      if (e.isFinal) {
        this.barDragging = false
        this.barWidth = null
        this.$emit('seeked')
      }
      if (!this.barWidth) return
      this.barWidth += (e.delta.x / this.$el.clientWidth) * 100
      let t = (this.barWidth / 100) * this.storePlayer.duration
      // this.$log('t', t)
      if (t >= 0 && t <= this.storePlayer.duration) {
        this.storePlayer.setCurrentTime(t)
      }
    }
  }
}
</script>
