<template lang="pug">
div(:style=`{position: 'relative',marginTop: '-10px',paddingTop: '10px',}`).row.full-width.items-start.content-start.b-60
  layer-frames(
    :player="player" :layer="layer"
    :layerStart="layerStart" :layerEnd="layerEnd" :layerDuration="layerDuration"
    :tickFramesLayerCenter="tickFramesLayerCenter"
    @clickInside="framesClickInside"
    @clickOutside="framesClickOutside")
  .row.full-width.q-px-xs
    q-btn(
      @click="playPause()"
      round flat dense
      :icon="player.playing ? 'pause' : 'play_arrow'"
      :color="player.playing ? 'red' : 'white'")
    .col.q-px-xs
      layer-bar(
        :player="player" :layer="layer" :layerStart="layerStart" :layerEnd="layerEnd" :layerDuration="layerDuration"
        :style=`{
          border: active ? '1px solid red' : 'none',
        }`)
    q-btn(
      @click="refresh()"
      round flat dense icon="refresh"
      :color="loop ? 'white' :'red'")
  //- actions
  div(:style=`{paddingLeft: '40px', paddingRight: '40px'}`).row.full-width.q-py-xs
    q-btn(round flat dense color="grey-6" icon="flip" @click="layerSet(0)").rotate-180
    q-btn(round flat dense color="grey-6" icon="keyboard_arrow_left" @click="layerForward(0,0)")
    q-btn(round flat dense color="grey-6" icon="keyboard_arrow_right" @click="layerForward(0,1)")
    .col
    q-btn(round flat dense color="green" icon="add" @click="$emit('layerAdd')")
    .col
    q-btn(round flat dense color="grey-6" icon="keyboard_arrow_left" @click="layerForward(1,0)")
    q-btn(round flat dense color="grey-6" icon="keyboard_arrow_right" @click="layerForward(1,1)")
    q-btn(round flat dense color="grey-6" icon="flip" @click="layerSet(1)")
</template>

<script>
import layerFrames from './layer_frames.vue'
import layerBar from './layer_bar.vue'

export default {
  name: 'layerEditor',
  components: {layerFrames, layerBar},
  props: ['layer', 'player'],
  data () {
    return {
      startForwardTimeout: null,
      endForwardTimeout: null,
      loop: true,
      tickFramesLayerCenter: 0,
      active: true,
    }
  },
  computed: {
    layerStart () {
      return this.layer.figuresAbsolute[0].t
    },
    layerEnd () {
      return this.layer.figuresAbsolute[1].t
    },
    layerDuration () {
      return this.layerEnd - this.layerStart
    }
  },
  watch: {
    'player.currentTime': {
      handler (to, from) {
        if (this.active) {
          this.$log('player.currentTime TO', to)
          // start
          if (to < this.layerStart) {
            this.player.setCurrentTime(this.layerStart)
          }
          // end
          if (to > this.layerEnd) {
            if (this.loop) {
              this.player.setCurrentTime(this.layerStart)
            }
            else {
              this.player.pause()
            }
          }
        }
      }
    }
  },
  methods: {
    framesClickInside () {
      this.$log('framesClickInside')
      this.active = true
    },
    framesClickOutside () {
      this.$log('framesClickOutside')
      this.active = false
    },
    layerSet (index) {
      this.$log('layerSet', index)
      this.active = true
      // check, t for layerStart and layerEnd
      let t = this.player.currentTime
      if (index === 0) {
        if (t >= this.layerEnd) {
          this.$q.notify({type: 'negative', position: 'top', message: 'Cant set t >= layer end !'})
          return
        }
      }
      else {
        if (t <= this.layerStart) {
          this.$q.notify({type: 'negative', position: 'top', message: 'Cant set t <= layer start !'})
          return
        }
      }
      // set value
      this.layer.figuresAbsolute[index].t = t
      // center frames to the layer
      this.tickFramesLayerCenter += 1
    },
    layerForward (index, isRight) {
      this.$log('layerForward', index, isRight)
      this.active = true
      let t = this.layer.figuresAbsolute[index].t + (isRight ? 0.1 : -0.1)
      this.layer.figuresAbsolute[index].t = t
      this.player.pause()
      this.player.setCurrentTime(t)
      // start: play after editing
      if (index === 0) {
        if (this.startForwardTimeout) {
          clearTimeout(this.startForwardTimeout)
          this.startForwardTimeout = null
        }
        this.startForwardTimeout = setTimeout(async () => {
          this.tickFramesLayerCenter += 1
          this.player.play()
        }, 1000)
      }
      // end: go 1.5 sec before start, prevent loop, stop at the end,
      if (index === 1) {
        if (this.endForwardTimeout) {
          clearTimeout(this.endForwardTimeout)
          this.endForwardTimeout = null
        }
        this.endForwardTimeout = setTimeout(async () => {
          this.tickFramesLayerCenter += 1
          // this.loop = false
          this.player.setCurrentTime(t - 1.5)
          this.player.play()
        }, 1000)
      }
    },
    playPause () {
      this.$log('playPause')
      this.active = true
      if (this.player.playing) this.player.pause()
      else this.player.play()
    },
    refresh () {
      this.$log('refresh')
      this.active = true
      this.loop = !this.loop
      this.player.setCurrentTime(this.layerStart)
      this.player.play()
    }
  }
}
</script>
