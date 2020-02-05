<template lang="pug">
div(
  :style=`{position: 'relative', overflow: 'hidden'}`
  ).row.full-width
  div(
    :style=`{position: 'relative', height: '76px'}`
    ).row.full-width.items-center.justify-center
    div(:style=`{position: 'relative'}`).row.fit.items-center.scroll
      .row.no-wrap
        //- div(:style=`{width: '50px'}`).full-height.bg
        //- .row.no-wrap
        //- div(:style=`{width: '50px'}`).bg-red
        .row.no-wrap
          img(
            v-for="(f,fi) in frames" :key="fi" @click="$event => frameClick(f, fi, $event)"
            :src="f" draggable="false"
            :style=`{height: '50px', userSelect: 'none'}`)
        //- div(:style=`{width: '50%'}`).full-height.bg
        //- div(:style=`{height: '100%', width: '50%'}`).bg-green f
        //- div(:style=`{height: '100%', width: '700px'}`).row.bg-red r
        //- div(:style=`{height: '100%', width: '300px'}`).bg-yellow y
    //- span frames
    //- span.bg-red node: {{node.compositions[0].layers[0].figuresAbsolute}}
    q-btn(
      round push color="green" icon="add" @click="layerAdd()"
      :style=`{position: 'absolute', right: '16px', top: '16px'}`)
  .row.full-width.items-start.content-start
    div(
      v-for="(l, li) in  layers" :key="li"
      :style=`{height: '60px'}`
      ).row.full-width
      span.text-white {{ l.figuresAbsolute }}
</template>

<script>
export default {
  name: 'contentVideoExtractor',
  props: ['node', 'player'],
  data () {
    return {
      layerIndex: -1,
      figureIndex: -1
    }
  },
  computed: {
    now () {
      return this.player.now
    },
    layers () {
      return this.node.compositions[0].layers
    },
    layer () {
      if (this.layerIndex >= 0) return this.layers[this.layerIndex]
      else return null
    },
    figures () {
      return this.node.compositions[0].layers[0].figuresAbsolute
    },
    figure () {
      if (this.figureIndex >= 0) {
        return this.figures[this.figureIndex]
      } else {
        return null
      }
    },
    duration () {
      return this.content.duration
    },
    content () {
      return this.node.compositions[0].layers[0].content
    },
    frames () {
      if (this.content.contentSource === 'KALPA') {
        return this.content.frameUrls.filter((f, fi) => {
          // return fi % 2 === 0
          return true
        })
      } else {
        return Math.ceil(this.duration / 10)
      }
    },
    framesCount () {
      if (this.content.contentSource === 'KALPA') {
        return this.frames.length
      } else {
        return this.frames
      }
    },
    frameDuration () {
      return this.duration / this.framesCount
    }
  },
  methods: {
    layerClick () {
      this.$log('layerClick')
    },
    layerAdd (start, end) {
      this.$log('layerAdd')
      let layer = {
        // content: this.content,
        figuresAbsolute: [
          // {t: start || this.now},
          // {t: end || this.now + 10}
        ],
        operation: {
          items: [],
          type: 'CONCAT'
        }
      }
      // this.$set(this.node.compositions[0].layers, this.node.compositions[0].layers.length, layer)
      // this.node.compositions[0].layers.push(layer)
      // this.layers.push(layer)
      let layers = this.node.compositions[0].layers
      this.$log('layers', layers)
      layers.push(layer)
    },
    layerDelete (index) {
      this.$log('layerDelete')
      this.$delete(this.node.compositions[0].layers, index)
    },
    frameClick (f, fi, e) {
      this.$log('frameClick', fi)
      this.$log('layerX', e.layerX)
      let to = (fi * this.frameDuration) + (this.frameDuration / 2)
      this.$log('to', to)
      this.player.setCurrentTime((fi * this.frameDuration) + (this.frameDuration / 2))
      // this.player.currentTime = (fi * this.frameDuration) + (this.frameDuration / 2)
    },
    cutHere () {
      this.$log('cutHere')
      // on cut add layer, or add figure?,
      // when yo want to export figure to independent shit what u do?
      let start = this.player.now
      let end = start + 10 < this.player.duration ? start + 10 : this.player.duration
      // create new composition, or? add layer to composition on the right
      this.$log('start/end', start, end)
      let composition = {
        layers: [
          {
            contentOid: this.content.oid,
            content: this.content,
            figures: [
              {t: start, points: []},
              {t: end + 1, points: []}
            ]
          }
        ],
        operation: {
          items: [0, 1],
          operations: null
        },
        outputType: 'VIDEO'
      }
      this.$log('composition', composition)
    },
    async compositionCreate () {
      this.$log('compositionCreate')
      // let composition = await this.$store.dispatch('workspace/wsCompositionCreate', compositionInput)
      // this.$log('composition', composition)
    }
  },
  mounted () {
    this.$log('mounted')
    // found a container node in ws
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
