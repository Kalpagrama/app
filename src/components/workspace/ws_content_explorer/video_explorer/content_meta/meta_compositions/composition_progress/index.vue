<template lang="pug">
div(
  @click="progressClick"
  :style=`{
    position: 'absolute', zIndex: 200,
    left: 0, right: 0, bottom: 0,
  }`
  ).row.full-width
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
      left: width+'%',
      width: '2px',
      pointerEvents: 'none'
    }`).row.full-height.bg-green
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
      opacity: 0.5,
      pointerEvents: 'none',
    }`
    ).row.full-height.bg-green
    small {{ li }}
</template>

<script>
export default {
  name: 'compositionProgress',
  props: ['stateExplorer', 'value'],
  data () {
    return {
      layerActive: 0,
      widthRaw: null,
      currentTimeStop: false
    }
  },
  computed: {
    layersDuration () {
      return this.value.layers.reduce((acc, layer) => {
        let layerDuration = layer.figuresAbsolute[1].t - layer.figuresAbsolute[0].t
        acc += layerDuration
        return acc
      }, 0)
    },
    layersPercents () {
      return this.value.layers.reduce((acc, layer) => {
        let layerDuration = layer.figuresAbsolute[1].t - layer.figuresAbsolute[0].t
        acc.push(layerDuration / this.layersDuration)
        return acc
      }, [])
    },
    layersStats () {
      return this.value.layers.reduce((acc, layer) => {
        let layerDuration = layer.figuresAbsolute[1].t - layer.figuresAbsolute[0].t
        let prev = acc.length > 0 ? acc[acc.length - 1] : 0
        acc.push(prev + (layerDuration / this.layersDuration))
        return acc
      }, [])
    },
    layerActiveStart () {
      return this.value.layers[this.layerActive].figuresAbsolute[0].t
    },
    layerActiveEnd () {
      return this.value.layers[this.layerActive].figuresAbsolute[1].t
    },
    layerActiveDuration () {
      return this.layerActiveEnd - this.layerActiveStart
    },
    width () {
      let layerPercentGone = (this.stateExplorer.currentTime - this.layerActiveStart) / this.layerActiveDuration
      let x = layerPercentGone * this.layersPercents[this.layerActive]
      let add = this.layersStats[this.layerActive] - this.layersPercents[this.layerActive]
      return (add + x) * 100
    }
  },
  watch: {
    'stateExplorer.currentTime': {
      immediate: true,
      handler (to, from) {
        this.$log('currentTime TO', to)
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
    layerActiveSet (index) {
      this.$log('layerActiveSet', index)
      this.layerActive = index
      this.stateExplorer.set('currentTime', this.layerActiveStart)
      this.stateExplorer.player.setCurrentTime(this.layerActiveStart)
    },
    async progressClick (e) {
      // this.$log('progressClick', e)
      let width = e.target.clientWidth
      let left = e.offsetX
      let p = left / width
      this.$log('p', p)
      let i = this.layersStats.findIndex(l => l > p)
      this.$log('i', i)
      let layer = this.value.layers[i]
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
      this.stateExplorer.set('currentTime', t)
      this.stateExplorer.player.setCurrentTime(t)
      await this.$wait(200)
      this.currentTimeStop = false
    }
  }
}
</script>
