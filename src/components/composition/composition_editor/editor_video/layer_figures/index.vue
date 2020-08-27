<template lang="pug">
div(
  :style=`{
    borderRadius: '0 0 10px 10px',
  }`
  ).row.full-width.items-start.content-start.q-pt-xl.b-50
  .row.full-width.items-center.content-center
    q-btn(round flat color="grey-6" @click="layerSet(0)")
      q-icon(name="flip" size="40px" color="grey-7").rotate-180
    .col
      div(
        :style=`{
          position: 'relative', height: '36px',
          borderRadius: '6px',
        }`).row.full-width.b-100
        q-btn(
          @click="layerPlay()"
          round flat dense
          :color="layerPlaying ? 'white' : 'white'"
          :icon="layerPlaying ? 'pause' : 'play_arrow'"
          :style=`{
            position: 'absolute', zIndex: 120,
            left: 'calc(25% - 10px)',
            top: '-40px',
          }`)
        //- layer currentTime line
        //- div(
          :style=`{
            position: 'absolute', zIndex: 120, top: '-8px', height: 'calc(100% + 16px)',
            left: 'calc(25% + '+layerStart-player.currentTime/player.duration*100+'%)',
            width: '4px', borderRadius: '2px',
            pointerEvents: 'none', userSelect: 'none',
          }`
          ).row.bg-red
        //- layer frame of points
        div(
          :style=`{
            position: 'absolute', zIndex: 100,
            top: '-4px',
            left: '25%',
            width: '50%',
            height: 'calc(100% + 8px)',
            borderRadius: '10px',
            border: '4px solid #4caf50',
          }`
          ).row.items-center.content-center.justify-center
          div(
            :style=`{
              position: 'absolute', zIndex: 100, top: '-8px',
              left: 100-(layerEnd-player.currentTime)/layerDuration*100+'%',
              height: 'calc(100% + 16px)',
              width: '4px', borderRadius: '2px',
            }`
            ).bg-red
          span(
            :class=`{
              'text-white': layerDuration <= 60,
              'text-red': layerDuration > 60,
            }`
            :style=`{
              userSelect: 'none',
              pointerEvents: 'none',
            }`
            ) {{ $time(layerDuration) }}
        //- start grabber
        div(
          :style=`{
            position: 'absolute', zIndex: 100,
            left: 'calc(25% - 20px + 4px)',
            height: '36px', width: '36px',
            borderRadius: '50%',
            opacity: 0.3,
          }`
          ).bg-green
        //- end grabber
        div(
          :style=`{
            position: 'absolute', zIndex: 100,
            right: 'calc(25% - 20px + 4px)',
            height: '36px', width: '36px',
            borderRadius: '50%',
            opacity: 0.3
          }`
          ).bg-green
    q-btn(round flat color="grey-7" @click="layerSet(1)")
      q-icon(name="flip" size="40px" color="grey-7")
  .row.full-width
    div(:style=`{paddingLeft: '24%', paddingRight: '24%'}`).row.full-width.q-py-xs
      q-btn(round flat dense color="grey-6" icon="keyboard_arrow_left" @click="layerForward(0,false)")
      q-btn(round flat dense color="grey-6" icon="keyboard_arrow_right" @click="layerForward(0,true)")
      .col
      q-btn(round flat dense color="grey-6" icon="keyboard_arrow_left" @click="layerForward(1,false)")
      q-btn(round flat dense color="grey-6" icon="keyboard_arrow_right" @click="layerForward(1,true)")
</template>

<script>
export default {
  name: 'editorVideo_layerFigures',
  props: ['player', 'layer', 'layerIndex', 'composition', 'isSelected', 'isEditing'],
  data () {
    return {
      layerPlaying: false,
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
    layer: {
      deep: true,
      immediate: true,
      handler (to, from) {
        this.$store.commit('ui/stateSet', ['wsContentLayers', [JSON.parse(JSON.stringify(to))]])
      }
    },
    'player.currentTime': {
      handler (to, from) {
        // if (this.layerPlaying) {
        //   // this.$log('player.currentTime TO', to)
        //   if (to < this.layerStart) {
        //     this.player.setCurrentTime(this.layerStart)
        //   }
        //   if (to > this.layerEnd) {
        //     this.player.pause()
        //     this.layerPlaying = false
        //     // this.player.setCurrentTime(this.layerStart)
        //   }
        // }
      }
    }
  },
  methods: {
    layerSet (pointIndex) {
      this.$log('layerSet', pointIndex)
      let t = this.player.currentTime
      // this.layer.figuresAbsolute[pointIndex] = t
      this.$set(this.layer.figuresAbsolute[pointIndex], 't', t)
      if (pointIndex === 0) {
        this.player.setCurrentTime(t)
        this.player.play()
      }
      if (pointIndex === 1) {
        this.player.setCurrentTime(t - 1)
        this.player.play()
      }
    },
    layerForward (pointIndex, goingForward) {
      this.$log('layerForward', pointIndex, goingForward)
      // this.layerPlaying = false
      let t = this.layer.figuresAbsolute[pointIndex].t
      if (goingForward) t += 0.1
      else t -= 0.1
      this.$log('t', t)
      this.$set(this.layer.figuresAbsolute[pointIndex], 't', t)
      if (pointIndex === 0) {
        this.player.setCurrentTime(t)
        // this.player.play()
      }
      if (pointIndex === 1) {
        this.player.setCurrentTime(t)
        // this.player.setCurrentTime(t - 1)
        // this.player.play()
      }
    },
    layerStop () {
      this.$log('layerStop')
    },
    layerPlay () {
      this.$log('layerPlay')
      if (this.layerPlaying) {
        if (this.player.playing) this.player.pause()
        else this.player.play()
      }
      else {
        this.layerPlaying = true
        let t = this.layer.figuresAbsolute[0].t
        this.player.setCurrentTime(t)
        this.player.play()
      }
    },
    layerLoop () {},
  },
  mounted () {
    // this.$log('mounted')
    // this.layerPlay()
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.$store.commit('ui/stateSet', ['wsContentLayers', null])
  }
}
</script>
