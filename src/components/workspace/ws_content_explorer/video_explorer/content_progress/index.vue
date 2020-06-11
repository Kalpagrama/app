<template lang="pug">
.row.full-width
  //- tools
  div(
    :style=`{
      order: -1,
      opacity: 0.9,
    }`
    ).row.full-width.q-pb-xs
    q-btn(
      @click="stateExplorer.playing ? stateExplorer.player.pause() : stateExplorer.player.play()"
      round flat dense color="grey-5"
      :icon="stateExplorer.playing ? 'pause' : 'play_arrow'")
    q-btn(
      v-if="stateExplorer.player"
      @click="volumeToggle()"
      round flat dense color="grey-5"
      :icon="stateExplorer.player.muted ? 'volume_off' : 'volume_up'")
    .col
    q-btn(round flat dense color="grey-5" icon="fast_rewind" @click="fast(false)")
    q-btn(flat dense color="grey-4").text-grey-5
      small {{ $time(stateExplorer.currentTime) }}
      small.q-mx-xs /
      small {{ $time(stateExplorer.duration) }}
    q-btn(round flat dense color="grey-5" icon="fast_forward" @click="fast(true)")
    .col
    q-btn(
      @click="$store.commit('ui/stateSet', ['appFullscreen', !$store.state.ui.appFullscreen])"
      round flat dense color="grey-5"
      :icon="$store.state.ui.appFullscreen ? 'fullscreen_exit' : 'fullscreen'"
      )
    q-btn(round flat dense color="grey-5" icon="more_vert")
  //- bar
  div(
    @click="barClick"
    v-touch-pan.mouse.left.right="barDrag"
    @mousemove="barMove"
    @mouseleave="nowHover = null"
    :style=`{
      position: 'relative',
      height: '50px',
      borderRadius: '10px',
      overflow: 'hidden',
    }`
    ).row.full-width.b-70.cursor-pointer
    //- now
    div(
      :style=`{
        position: 'absolute',
        zIndex: 1000,
        width: '3px',
        borderRadius: '1px', overflow: 'hidden',
        left: stateExplorer.currentTime/stateExplorer.duration*100+'%',
        pointerEvents: 'none',
      }`
      ).row.full-height.bg-green
    //- now HOVER
    div(
      v-if="nowHover"
      :style=`{
        position: 'absolute',
        zIndex: 1100,
        width: '3px',
        left: nowHover+'%',
        pointerEvents: 'none'
      }`
      ).row.full-height.bg-green
      small(
        :style=`{
          position: 'absolute', zIndex: 1200,
          top: '0px', left: '-15px',
        }`).text-white {{ $time(nowHoverTime) }}
    //- now WIDTH
    div(
      :style=`{
        position: 'absolute', zIndex: 100,
        left: '0px',
        width: barWidth ? barWidth+'%' : (stateExplorer.currentTime/stateExplorer.duration)*100+'%',
        pointerEvents: 'none',
        opacity: 0.8
      }`
      ).row.full-height.b-100
    //- COMPOSITIONS on th BAR
    //- LAYERS on the BAR
    div(
      v-if="false"
      :style=`{
        position: 'absolute', zIndex: 200,
        top: '0px',
        pointerEvents: 'none',
      }`).row.fit
      div(
        v-for="(l,li) in layers" :key="li"
        :style=`{
          position: 'absolute', zIndex: 300+li,
          left: (l.figuresAbsolute[0].t/stateExplorer.duration)*100+'%',
          width: stateExplorer.layerSelected === l.id ? ((l.figuresAbsolute[1].t-l.figuresAbsolute[0].t)/stateExplorer.duration)*100+'%' :'2px',
          background: stateExplorer.layerSelected === l.id ? l.color : 'white',
          opacity: stateExplorer.layerSelected === l.id ? 1 : 0.5,
        }`
        ).row.full-height
</template>

<script>
export default {
  name: 'contentProgress',
  props: ['statePage', 'stateExplorer'],
  data () {
    return {
      barWidth: null,
      barDragging: false,
      nowHover: null,
      nowHoverTime: 0
    }
  },
  computed: {
    // layers () {
    //   return this.stateExplorer?.contentWs?.layers
    // }
  },
  methods: {
    volumeToggle () {
      this.$log('volumeToggle')
      if (this.stateExplorer.player.muted) this.stateExplorer.player.setMuted(false)
      else this.stateExplorer.player.setMuted(true)
    },
    fast (forward) {
      this.$log('fast', forward)
      let t = this.stateExplorer.currentTime
      if (forward) t += 5
      else t -= 5
      if (t < 0) t = 0
      if (t > this.stateExplorer.duration) t = this.stateExplorer.duration
      this.stateExplorer.set('currentTime', t)
      this.stateExplorer.player.setCurrentTime(t)
    },
    barMove (e) {
      // this.$log('barMove', e.target.clientWidth)
      let left = e.offsetX
      let width = e.target.clientWidth
      this.nowHover = (left / width) * 100
      this.nowHoverTime = (left / width) * this.stateExplorer.duration
    },
    barClick (e) {
      this.$log('barClick', e)
      let width = e.target.clientWidth
      this.$log('width', width)
      let left = e.offsetX
      this.$log('left', left)
      let t = (left / width) * this.stateExplorer.duration
      this.$log('t', t)
      this.stateExplorer.set('currentTime', t)
      this.stateExplorer.player.setCurrentTime(t)
    },
    barDrag (e) {
      // this.$log('barDrag', e)
      if (e.isFirst) {
        this.barDragging = true
        let left = e.evt.layerX || e.position.left
        // this.$log('left', left)
        this.barWidth = (left / this.$el.clientWidth) * 100
      }
      if (e.isFinal) {
        this.barDragging = false
        this.barWidth = null
      }
      if (!this.barWidth) return
      this.barWidth += (e.delta.x / this.$el.clientWidth) * 100
      let t = (this.barWidth / 100) * this.stateExplorer.duration
      // this.$log('t', t)
      if (t >= 0 && t <= this.stateExplorer.duration) {
        this.stateExplorer.set('currentTime', t)
        this.stateExplorer.player.setCurrentTime(t)
      }
    }
  }
}
</script>
