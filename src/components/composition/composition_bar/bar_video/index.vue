<template lang="pug">
.row.full-width.q-py-xs
  div(
    @click="barClick"
    :style=`{
      position: 'relative',
      height: '36px',
      borderRadius: '10px',
    }`
    ).row.full-width.b-60
    div(
      v-for="(l,li) in layersMeta" :key="li"
      :class=`{
        'bg-red': layersPlayed.includes(li),
      }`
      :style=`{
        position: 'relative',
        borderLeft: li === 0 ? 'none' : '2px solid #4caf50',
        width: l.percent*100+'%',
        pointerEvents: 'none',
      }`
      ).row.full-height
      div(
        v-if="player.currentTime >= l.start && player.currentTime <= l.end"
        :style=`{
          position: 'absolute',
          left: ((player.currentTime-l.start)/l.duration)*100+'%',
          height: 'calc(100% + 16px)',
          top: '-8px',
          width: '4px', borderRadius: '2px',
          pointerEvents: 'none',
        }`
        ).row.bg-red
  .row.full-width.q-pa-sm
    q-btn(
      v-if="!compositionPlaying"
      round flat dense color="white" icon="play_arrow" @click="compositionPlay()")
    q-btn(
      v-if="compositionPlaying"
      @click="compositionPlayPause()"
      round flat dense color="white"
      :icon="player.playing ? 'pause' : 'play_arrow'")
    q-btn(
      v-if="compositionPlaying"
      round flat dense color="red" icon="stop" @click="compositionStop()")
    small.text-white layersPlayed {{layersPlayed}}
</template>

<script>
export default {
  name: 'compositionBar_video',
  props: ['player', 'composition', 'contentKalpa'],
  data () {
    return {
      compositionPlaying: false,
      layerPlaying: null,
      layersPlayed: [],
    }
  },
  computed: {
    compositionDuration () {
      return this.composition.layers.reduce((acc, val) => {
        acc += (val.figuresAbsolute[1].t - val.figuresAbsolute[0].t)
        return acc
      }, 0)
    },
    layersMeta () {
      return this.composition.layers.reduce((acc, layer, idx) => {
        let duration = layer.figuresAbsolute[1].t - layer.figuresAbsolute[0].t
        acc.push({
          duration: duration,
          percent: duration / this.compositionDuration,
          start: layer.figuresAbsolute[0].t,
          end: layer.figuresAbsolute[1].t,
        })
        return acc
      }, [])
    },
    layersPercents () {
      return this.layersMeta.reduce((acc, layer, idx, arr) => {
        if (idx === 0) {
          acc.push({
            from: 0,
            to: layer.percent,
            start: layer.start,
            end: layer.end,
            duration: layer.duration,
          })
        }
        else {
          acc.push({
            from: acc[idx - 1].to,
            to: acc[idx - 1].to + layer.percent,
            start: layer.start,
            end: layer.end,
            duration: layer.duration,
          })
        }
        return acc
      }, [])
    }
  },
  watch: {
    'player.currentTime': {
      handler (to, from) {
        if (this.compositionPlaying) {
          this.$log('player.currentTime TO', to)
          let layer = this.composition.layers[this.layerPlaying]
          if (to >= layer.figuresAbsolute[1].t) {
            this.layersPlayed.push(this.layerPlaying)
            // this is not the last layer to play
            if (this.composition.layers[this.layerPlaying + 1]) {
              this.layerPlaying += 1
              let t = this.composition.layers[this.layerPlaying].figuresAbsolute[0].t
              this.player.setCurrentTime(t)
            }
            // this is the last layer to play, and loop, or stop...
            else {
              this.player.pause()
            }
          }
        }
      }
    }
  },
  methods: {
    compositionPlay () {
      this.$log('compositionPlay')
      this.compositionPlaying = true
      this.layerPlaying = 0
      let t = this.composition.layers[0].figuresAbsolute[0].t
      this.player.setCurrentTime(t)
      this.player.play()
    },
    compositionPlayPause () {
      this.$log('compositionPlayPause')
      if (this.player.playing) this.player.pause()
      else this.player.play()
    },
    compositionStop () {
      this.$log('compositionStop')
      this.compositionPlaying = false
      this.layerPlaying = null
      this.layersPlayed = []
    },
    barClick (e) {
      this.$log('barClick', e)
      // TODO: stop composition playing...
      this.compositionStop()
      let left = e.layerX
      let width = e.target.clientWidth
      // if (left > width) return
      this.$log('left/width', left, width)
      let d = left / width
      this.$log('d', d)
      let layer = this.layersPercents.find(l => (l.from < d && l.to > d))
      this.$log('layer', layer)
      if (layer) {
        let layerPercent = layer.to - layer.from
        this.$log('layerPercent', layerPercent)
        let layerWidth = width * layerPercent
        this.$log('layerWidth', layerWidth)
        let layerWidthBefore = width * layer.from
        this.$log('layerWidthBefore', layerWidthBefore)
        let layerDelta = (left - layerWidthBefore) / layerWidth
        this.$log('layerDelta', layerDelta)
        let layerT = (layer.duration * layerDelta) + layer.start
        this.$log('layerT', layerT)
        this.player.setCurrentTime(layerT)
      }
    }
  },
  mounted () {
    this.$log('mounted')
    this.$store.commit('ui/stateSet', ['wsContentLayers', this.composition.layers])
    // TODO: listen to events and stop composition from playing...
  },
  beforeDestroy () {
    this.$store.commit('ui/stateSet', ['wsContentLayers', null])
  }
}
</script>
