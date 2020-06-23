<template lang="pug">
div(:style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.b-70
  div(:style=`{position: 'relative', height: '40px'}`).row.full-width
    div(
      @click="progressClick"
      :style=`{
        position: 'absolute', zIndex: 200,
        left: 0, right: 0, bottom: 0,
        borderRadius: $store.state.ui.borderRadius+'px',
        overflow: 'hidden',
      }`
      ).row.fit.items-center.content-center.b-80.cursor-pointer
      //- composition name
      span(
        v-if="false"
        :style=`{userSelect: 'none', pointerEvents: 'none'}`
        ).text-white.text-bold.q-mx-md {{ compositionName }}
      //- progress
      div(
        v-if="true"
        :style=`{
          position: 'absolute', zIndex: 300,
          pointerEvents: 'none',
          userSelect: 'none',
          left: '0px',
          width: width+'%',
          opacity: 0.5,
        }`
        ).row.full-height.bg-white
      //- progress right border
      div(
        :style=`{
          position: 'absolute', zIndex: 301,
          top: '-4px',
          left: width+'%',
          height: 'calc(100% + 8px)',
          width: '3px',
          pointerEvents: 'none',
        }`).row.bg-green
      //- kalpa-debug(
      //-   :options=`{layerActiveStart,layerActiveEnd}`
      //-   :style=`{position: 'absolute', top: 0, zIndex: 9999, pointerEvents: 'none'}`)
        //- kalpa-debug(:options=`{layersStats,width}`)
      //- layers stats
      div(
        v-for="(l,li) in layersStats" :key="li"
        :style=`{
          position: 'absolute', zIndex: 210,
          width: '2px',
          left: l*100+'%',
          opacity: 0.3,
          pointerEvents: 'none',
        }`
        ).row.full-height.bg-white
        //- small {{ li }}
  //- actions
  .row.full-width.q-pa-xs
    q-btn(
      @click="compositionPlayPause()"
      round flat dense
      :color="storePlayer.playing ? 'red' : 'grey-5'"
      :icon="storePlayer.playing ? 'pause' : 'play_arrow'")
    q-btn(round flat dense color="grey-5" icon="keyboard_arrow_left" @click="layerPrev()")
    q-btn(round flat dense color="grey-5" icon="keyboard_arrow_right" @click="layerNext()")
    q-btn(round flat dense color="grey-5" icon="refresh" @click="compositionRefresh()")
    .col
    slot(name="actions")
</template>

<script>
export default {
  name: 'compositionProgress',
  props: ['storeEditor', 'storePlayer', 'composition'],
  data () {
    return {
      layerActive: 0,
      widthRaw: null,
      currentTimeStop: false
    }
  },
  computed: {
    compositionName () {
      let name = this.composition.name
      if (name.length > 0) return name
      else return `${this.$time(this.composition.layers[0].figuresAbsolute[0].t)} - ${this.$time(this.composition.layers[0].figuresAbsolute[1].t)}`
    },
    layersDuration () {
      return this.composition.layers.reduce((acc, layer) => {
        let layerDuration = layer.figuresAbsolute[1].t - layer.figuresAbsolute[0].t
        acc += layerDuration
        return acc
      }, 0)
    },
    layersPercents () {
      return this.composition.layers.reduce((acc, layer) => {
        let layerDuration = layer.figuresAbsolute[1].t - layer.figuresAbsolute[0].t
        acc.push(layerDuration / this.layersDuration)
        return acc
      }, [])
    },
    layersStats () {
      return this.composition.layers.reduce((acc, layer) => {
        let layerDuration = layer.figuresAbsolute[1].t - layer.figuresAbsolute[0].t
        let prev = acc.length > 0 ? acc[acc.length - 1] : 0
        acc.push(prev + (layerDuration / this.layersDuration))
        return acc
      }, [])
    },
    layerActiveStart () {
      return this.composition.layers[this.layerActive].figuresAbsolute[0].t
    },
    layerActiveEnd () {
      return this.composition.layers[this.layerActive].figuresAbsolute[1].t
    },
    layerActiveDuration () {
      return this.layerActiveEnd - this.layerActiveStart
    },
    width () {
      let layerPercentGone = (this.storePlayer.currentTime - this.layerActiveStart) / this.layerActiveDuration
      let x = layerPercentGone * this.layersPercents[this.layerActive]
      let add = this.layersStats[this.layerActive] - this.layersPercents[this.layerActive]
      return (add + x) * 100
    }
  },
  watch: {
    'storePlayer.currentTime': {
      immediate: true,
      handler (to, from) {
        // this.$log('currentTime TO', to)
        // if (!this.active) return
        if (!this.storeEditor.compositionPlaying) return
        if (this.currentTimeStop) return
        if (to > this.layerActiveEnd) {
          // try to find next layerActive
          if (this.layersStats[this.layerActive + 1]) {
            this.layerActiveSet(this.layerActive + 1)
          }
          else {
            this.layerActiveSet(0)
          }
        }
        if (to < this.layerActiveStart) {
          this.layerActiveSet(this.layerActive)
        }
      }
    }
  },
  methods: {
    compositionPlayPause () {
      this.$log('compositionPlayPause')
      if (this.storePlayer.playing) {
        this.storePlayer.player.pause()
        this.compositionPlaying = false
      }
      else {
        this.storePlayer.player.play()
        this.compositionPlaying = true
      }
    },
    layerPrev () {
      this.$log('layerPrev')
      if (this.composition.layers[this.layerActive - 1]) {
        this.layerActiveSet(this.layerActive - 1)
      }
      else {
        this.layerActiveSet(0)
      }
    },
    layerNext () {
      this.$log('layerNext')
      if (this.composition.layers[this.layerActive + 1]) {
        this.layerActiveSet(this.layerActive + 1)
      }
      else {
        this.layerActiveSet(0)
      }
    },
    compositionRefresh () {
      this.$log('compositionRefresh')
      this.layerActiveSet(0)
      this.storePlayer.player.play()
    },
    layerActiveSet (index) {
      this.$log('layerActiveSet', index)
      this.layerActive = index
      this.storePlayer.setCurrentTime(this.layerActiveStart)
    },
    async progressClick (e) {
      // this.$log('progressClick', e)
      let width = e.target.clientWidth
      let left = e.offsetX
      let p = left / width
      this.$log('p', p)
      let i = this.layersStats.findIndex(l => l > p)
      this.$log('i', i)
      let layer = this.composition.layers[i]
      let layerStart = layer.figuresAbsolute[0].t
      let layerDuration = layer.figuresAbsolute[1].t - layer.figuresAbsolute[0].t
      let layerDurationPercent = layerDuration / this.layersDuration
      this.$log('layerDurationPercent', layerDurationPercent)
      let layerPercentStart = i === 0 ? 0 : this.layersStats[i - 1]
      this.$log('layerPercent', layerPercentStart)
      let t = layerStart + ((p - layerPercentStart) * this.layersDuration)
      this.$log('t', t)
      // set
      this.layerActive = i
      this.currentTimeStop = true
      this.storePlayer.setCurrentTime(t)
      await this.$wait(200)
      this.currentTimeStop = false
    }
  },
  mounted () {
    this.$log('mounted')
    this.compositionRefresh()
  }
}
</script>
