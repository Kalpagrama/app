<template lang="pug">
.row.full-width.fit
  //- bar
  div(
    @click="barClick"
    :style=`{
      position: 'relative',
      height: '100%',
      borderRadius: '10px',
      //- border: '2px solid #4caf50',
      ...barStyles,
    }`
    ).row.full-width
    div(
      v-for="(l,li) in layersMeta" :key="li"
      :style=`{
        position: 'relative',
        borderLeft: li === 0 ? 'none' : '2px solid #4caf50',
        borderRadius: '10px',
        width: l.percent*100+'%',
        pointerEvents: 'none',
        background: layersPlayed.includes(li) ? 'rgba(76,175,79, 0.7)' : 'none',
      }`
      ).row.full-height
      //- currentTime width tint
      div(
        v-if="showCurrentTimeTint(li)"
        :style=`{
          position: 'absolute', zIndex: 2000, top: '0px',
          left: '0px',
          width: ((player.currentTime-l.start)/l.duration)*100+'%',
          borderRadius: '8px 0 0 8px',
          background: 'rgba(76,175,79, 0.7)',
        }`
        ).row.full-height
      //- currentTime line
      div(
        v-if="player.currentTime >= l.start && player.currentTime <= l.end"
        :style=`{
          position: 'absolute', zIndex: 9999,
          left: ((player.currentTime-l.start)/l.duration)*100+'%',
          height: 'calc(100% + 8px)',
          top: '-4px',
          width: '4px', borderRadius: '2px',
          pointerEvents: 'none',
        }`
        ).row.bg-red
  //- actions
  div(
    :style=`{
      order: actionsPosition === 'bottom' ? 1 : -1,
    }`
    ).row.full-width.no-wrap
    q-btn(
      v-if="!compositionPlaying"
      @click="compositionPlay()"
      round flat dense color="white" icon="play_arrow")
    q-btn(
      v-if="compositionPlaying"
      @click="compositionPlayPause()"
      round flat dense color="white"
      :icon="player.playing ? 'pause' : 'play_arrow'")
    q-btn(
      v-if="compositionPlaying"
      @click="compositionStop()"
      round flat dense color="red")
      q-icon(name="stop" size="28px" color="red")
    q-btn(
      v-if="compositionPlaying"
      @click="compositionRefresh()"
      round flat dense color="white" icon="refresh"
      :style=`{transform: 'scale(-1, 1)'}`)
    .col
      slot(name="actions")
  //- debug
  div(v-if="showDebug" :style=`{fontSize: '10px'}`).row.full-width.bg-green
    small.text-white layersPlayed {{layersPlayed}}
</template>

<script>
export default {
  name: 'compositionBar_video',
  props: {
    isActive: {
      type: Boolean, default () { return true },
    },
    player: {type: Object, required: true},
    composition: {type: Object, required: true},
    contentKalpa: {type: Object, required: true},
    actionsPosition: {
      type: String,
      default () {
        return 'bottom' // bottom, top
      }
    },
    showDebug: {
      type: Boolean,
      default () {
        return false
      }
    },
    barStyles: {
      type: Object,
      default () {
        return {}
      }
    }
  },
  data () {
    return {
      compositionPlaying: false,
      layerPlaying: null,
      layersPlayed: [],
    }
  },
  computed: {
    layerPlayingObject () {
      if (this.layerPlaying >= 0) return this.composition.layers[this.layerPlaying]
      else return null
    },
    // showCurrentTimeTint () {
    //   // layerPlayingObject && player.currentTime < layerPlayingObject.figuresAbsolute[0].1
    //   if (this.layerPlaying)
    // },
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
          // this.$log('player.currentTime TO', to)
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
              // this.player.pause()
              this.layerPlaying = 0
              this.layersPlayed = []
              let t = this.composition.layers[0].figuresAbsolute[0].t
              this.player.setCurrentTime(t)
            }
          }
        }
      }
    },
    composition: {
      deep: true,
      immediate: true,
      handler (to, from) {
        // this.$log('composition TO', to)
        let _composition = JSON.parse(JSON.stringify(to))
        let fragments = [{name: '', items: [_composition]}]
        this.$store.commit('ui/stateSet', ['contentNodes', fragments])
      }
    }
  },
  methods: {
    showCurrentTimeTint (li) {
      if (li === this.layerPlaying) {
        let start = this.composition.layers[this.layerPlaying].figuresAbsolute[0].t
        let end = this.composition.layers[this.layerPlaying].figuresAbsolute[1].t
        return this.player.currentTime > start && this.player.currentTime < end
      }
      else return false
    },
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
    compositionRefresh () {
      this.$log('compositionRefresh')
      this.layersPlayed = []
      this.compositionPlay()
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
      // this.compositionStop()
      let left = e.layerX
      let width = e.target.clientWidth
      if (left > width) return
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
    },
    playerBarClickHandle () {
      this.$log('playerBarClickHandle')
      this.compositionStop()
    },
    playerEditStartHandle () {
      this.compositionStop()
    },
    playerEditEndHandle () {
      this.$log('playerEditEndHandle')
      this.compositionPlaying = true
    }
  },
  mounted () {
    this.$log('mounted')
    this.player.events.on('bar-click', this.playerBarClickHandle)
    this.player.events.on('edit-start', this.playerEditStartHandle)
    this.player.events.on('edit-end', this.playerEditEndHandle)
    this.compositionPlay()
  },
  beforeDestroy () {
    this.$store.commit('ui/stateSet', ['contentNodes', null])
    this.player.events.off('bar-click', this.playerBarClickHandle)
    this.player.events.off('edit-start', this.playerEditStartHandle)
    this.player.events.off('edit-end', this.playerEditEndHandle)
  }
}
</script>
