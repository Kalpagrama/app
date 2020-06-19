<template lang="pug">
div(
  @mouseenter="mouseOver = true"
  @mouseleave="mouseOver = false"
  :style=`{
    position: 'relative',
    borderRadius: '0px',
    overflow: 'hidden',
    height: '42px',
  }`).row.full-width.items-center.content-center.q-px-sm
  q-btn(
    round @click="layerPlay()"
    :flat="!layerIsPlaying"
    :color="layerIsPlaying ? 'red' : 'white'"
    :icon="layerIsPlaying ? 'pause' : 'play_arrow'").b-110
  div(:style=`{position: 'relative'}`).col.full-height.q-px-sm
    div(:style=`{position: 'relative'}`).row.fit
      div(
        @click="progressClick"
        v-touch-pan.mouse.left.right="progressDrag"
        :style=`{
          position: 'absolute', zIndex: 10000,
          height: '42px',
          borderRadius: $store.state.ui.borderRadius+'px',
          overflow: 'hidden',
        }`
        ).row.full-width.items-center.content-center.b-120.cursor-pointer
        //- progress
        div(
          v-if="stateExplorer.currentTime >= layerStart && stateExplorer.currentTime <= layerEnd"
          :style=`{
            position: 'absolute', zIndex: 1000,
            left: '0px',
            width: progressPercentRaw ? progressPercentRaw+'%' : progressPercent+'%',
            pointerEvents: 'none',
            borderRadius: $store.state.ui.borderRadius+'px',
            overflow: 'hidden',
            background: 'white',
          }`
        ).row.full-height
        //- stats
        div(
          :style=`{
            position: 'absolute', zIndex: 1100,
            bottom: '8px', pointerEvents: 'none',
          }`).row.full-width.q-px-xs
          small(:style=`{borderRadius: $store.state.ui.borderRadius+'px', background: 'rgba(0,0,0,0.0)'}`).q-pa-xs {{$time(layerStart)}}
          .col
            .row.full-width.justify-center
              small(:style=`{borderRadius: $store.state.ui.borderRadius+'px', background: 'rgba(0,0,0,0.0)'}`).q-pa-xs {{ $time(layerEnd - layerStart) }}
          small(:style=`{borderRadius: $store.state.ui.borderRadius+'px', background: 'rgba(0,0,0,0.0)'}`).q-pa-xs {{$time(layerEnd)}}
  q-btn(round flat color="white" icon="refresh" @click="layerPlayAgain()").b-110
</template>

<script>
export default {
  name: 'layerProgress',
  props: ['stateExplorer', 'layer', 'layerIndex'],
  data () {
    return {
      paddingX: 46,
      mouseOver: false,
      progressPercentRaw: null,
      progressHeight: 0,
      layerPlayStarted: false
    }
  },
  computed: {
    progressPercent () {
      return ((this.stateExplorer.currentTime - this.layerStart) / this.layerDuration) * 100
    },
    layerStart () {
      return this.stateExplorer.layer.figuresAbsolute[0].t
    },
    layerEnd () {
      return this.stateExplorer.layer.figuresAbsolute[1].t
    },
    layerDuration () {
      return this.layerEnd - this.layerStart
    },
    layerIsPlaying () {
      return this.stateExplorer.playing
    },
  },
  methods: {
    layerPlay () {
      this.$log('layerPlay')
      this.stateExplorer.set('mode', 'layer')
      if (this.stateExplorer.playing) this.stateExplorer.player.pause()
      else {
        if (!this.layerPlayStarted) {
          this.stateExplorer.set('mode', 'layer')
          this.stateExplorer.set('layerId', this.layer.id)
          this.stateExplorer.player.setCurrentTime(this.layerStart)
          this.stateExplorer.set('currentTime', this.layerStart)
        }
        this.layerPlayStarted = true
        this.stateExplorer.player.play()
      }
    },
    layerPlayAgain () {
      this.$log('layerPlayAgain')
      this.stateExplorer.set('currentTime', this.layerStart)
      this.stateExplorer.player.setCurrentTime(this.layerStart)
      this.stateExplorer.player.play()
    },
    progressClick (e) {
      // this.$log('progressClick', e)
      let width = e.target.clientWidth
      let left = e.offsetX
      let t = ((this.layerDuration * left) / width) + this.layerStart
      this.$log('t', t)
      this.stateExplorer.set('currentTime', t)
      this.stateExplorer.player.setCurrentTime(t)
      // tween to
      let tPercentNow = ((this.stateExplorer.currentTime - this.layerStart) / this.layerDuration) * 100
      let tPercentNext = ((t - this.layerStart) / this.layerDuration) * 100
      this.progressPercentRaw = tPercentNow
      this.$tween.to(this, 0.1, {
        progressPercentRaw: tPercentNext,
        onComplete: () => {
          this.progressPercentRaw = null
          this.stateExplorer.set('currentTime', t)
        }
      })
    },
    progressDrag (e) {
      // this.$log('progressDrag', e)
      let width = this.$el.clientWidth - (58 * 2)
      if (e.isFirst) {
        this.stateExplorer.player.pause()
        this.progressPercentRaw = ((this.stateExplorer.currentTime - this.layerStart) / this.layerDuration) * 100
      }
      if (e.isFinal) {
        // this.$tween.to(this, 0.3, {barHeight: this.barHeightMin})
        // if (this.stateExplorer.playing)
        this.progressPercentRaw = null
        this.stateExplorer.player.play()
      }
      if (!this.progressPercentRaw) return
      this.progressPercentRaw += (e.delta.x / width) * 100
      let t = this.layerStart + (this.progressPercentRaw / 100) * this.layerDuration
      // this.$log('t', t)
      if (t < this.layerStart || t > this.layerEnd) return
      if (t > 0) {
        this.stateExplorer.player.setCurrentTime(t)
        this.stateExplorer.set('currentTime', t)
      }
    }
  }
}
</script>
