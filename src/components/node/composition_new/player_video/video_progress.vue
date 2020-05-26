<template lang="pug">
div(
  :style=`{
    position: 'absolute', zIndex: 1000, bottom: '0px',
    borderRadius: '10px', overflow: 'hidden',
    background: meta.playing ? 'none' : 'rgb(0,0,0)',
    background: meta.playing ? 'none' : 'linear-gradient(0deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
  }`
  ).row.full-width.q-pa-sm
  //- actions
  q-btn(
    round flat color="white" @click="meta.playing ? player.pause() : player.play()"
    :icon="meta.playing ? 'pause' : 'play_arrow'"
    :style=`{zIndex: 1400}`)
  q-btn(
    round flat color="white" @click="mutedToggle()"
    :icon="meta.muted ? 'volume_off' : 'volume_up'"
    :style=`{zIndex: 1400}`)
  //- bar
  div(
    @click="barClick"
    @mouseenter="mouseOverBar = true"
    @mouseleave="mouseOverBar = false"
    v-touch-pan.mouse.left.right="barDrag"
    :style=`{
      position: 'absolute', zIndex: 1200, bottom: '0px', left: '0px', height: '17px',
      borderRadius: '10px', overflow: 'hidden',
      cursor: 'pointer'
    }`
    ).row.full-width
    div(
      :style=`{
        position: 'absolute', zIndex: 1300,
        left: '0px', bottom: '0px',
        width: barWidth ? barWidth+'%' : (meta.now/meta.duration)*100+'%',
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
  props: ['visible', 'active', 'mini', 'player', 'meta'],
  data () {
    return {
      mouseOverBar: false,
      barHeight: 4,
      barHeightMax: 18,
      barHeightMin: 4,
      barWidth: null,
      barDragging: false
    }
  },
  computed: {},
  watch: {
    visible: {},
    active: {},
    mini: {},
    mouseOverBar: {
      handler (to, from) {
        // this.$log('mouseOverBar', to)
        this.$tween.to(this, 0.3, {barHeight: to ? this.barHeightMax : this.barHeightMin})
      }
    }
  },
  methods: {
    mutedToggle () {
      this.$log('mutedToggle')
    },
    barDrag (e) {
      // this.$log('barDrag', e)
      if (e.isFirst) {
        this.$tween.to(this, 0.3, {barHeight: this.barHeightMax})
        // this.barWidth = (this.meta.now / this.meta.duration) * 100
        this.barWidth = (e.evt.layerX / this.$el.clientWidth) * 100
      }
      if (e.isFinal) {
        this.$tween.to(this, 0.3, {barHeight: this.barHeightMin})
        this.barWidth = null
      }
      this.barWidth += (e.delta.x / this.$el.clientWidth) * 100
      let t = (this.barWidth / 100) * this.meta.duration
      if (t > 0) {
        this.player.setCurrentTime(t)
        this.player.update(t)
      }
      // this.$log('t', t)
      // this.player.setCurrentTime(t)
    },
    barClick (e) {
      // this.$log('barClick', e)
      let width = e.target.clientWidth
      let left = e.offsetX
      let t = (this.meta.duration * left) / width
      this.player.setCurrentTime(t)
      let tPercentNow = (this.meta.now / this.meta.duration) * 100
      let tPercentNext = (t / this.meta.duration) * 100
      this.barWidth = tPercentNow
      this.$tween.to(this, 0.3, {
        barWidth: tPercentNext,
        barHeight: this.barHeightMin,
        onComplete: () => {
          this.barWidth = null
          this.player.update(t)
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
