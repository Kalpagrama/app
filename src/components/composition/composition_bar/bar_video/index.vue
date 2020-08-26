<template lang="pug">
.row.full-width.q-py-xs
  div(
    @click="barClick"
    :style=`{
      position: 'relative',
      height: '36px',
      borderRadius: '10px',
    }`
    ).row.full-width.b-60.br
    div(
      v-for="(l,li) in layersMeta" :key="li"
      :style=`{
        position: 'relative',
        borderRight: '2px solid white',
        width: l.percent*100+'%',
        pointerEvents: 'none',
      }`
      ).row.full-height
      div(
        :style=`{
          position: 'absolute',
          left: ((player.currentTime-l.start)/l.duration)*100+'%',
          height: 'calc(100% + 16px)',
          top: '-8px',
          width: '4px', borderRadius: '2px',
          pointerEvents: 'none',
        }`
        ).row.bg-red
</template>

<script>
export default {
  name: 'compositionBar_video',
  props: ['player', 'composition', 'contentKalpa'],
  data () {
    return {
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
          acc.push({from: 0, to: layer.percent})
        }
        else {
          acc.push({
            from: acc[idx - 1].to,
            to: acc[idx - 1].to + layer.percent,
          })
        }
        return acc
      }, [])
    }
  },
  methods: {
    barClick (e) {
      this.$log('barClick', e)
      let left = e.layerX
      let width = e.target.clientWidth
      // if (left > width) return
      this.$log('left/width', left, width)
      let d = left / width
      let layerIndex = this.layersPercents.findIndex(l => (l.from < d && l.to > d))
      this.$log('layerIndex', layerIndex)
      // let t = (left / width) * this.player.duration
      // this.$log('t', this.$time(t))
      // this.player.events.emit('bar-click', {t: t})
      // this.player.setCurrentTime(t)
      // this.$wait(400).then(() => {
      //   this.currentTimeMove = null
      // })
    }
  }
}
</script>
