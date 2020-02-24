<template lang="pug">
div(:style=`{position: 'relative', zIndex: 1000}`).row.full-width
  //- layers on progress bar
  div(:style=`{position: 'absolute', zIndex: 1000000, top: '-36px', height: 20+'px', pointerEvents: 'none'}`).row.full-width.q-px-sm
    div(:style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden'}`).row.fit.items-center.content-center.q-px-sm
      div(
        v-for="(l, li) in layers" :key="li"
        v-if="l.figuresAbsolute && l.figuresAbsolute.length > 0"
        :style=`{
          position: 'absolute', zIndex: 200, opacity: li === meta.layerIndex ? 0.9 : 0.5,
          left: (l.figuresAbsolute[0].t/meta.duration)*100+'%',
          width: ((l.figuresAbsolute[1].t-l.figuresAbsolute[0].t)/meta.duration)*100+'%',
          background: $randomColor(li)}`
        ).row.full-height
  layer-editor(:layer="layer" :layers="layers" :player="player" :meta="meta" :content="content" @add="layerAdd" @meta="$parent.$emit('meta', $event)")
  div(v-if="false").row.full-width
    small.text-white.full-width layers: {{layers}}
  //- layers
  div(:style=`{height: $q.screen.height/3+'px'}`).row.full-width
    .col.full-height
      layers(
        mode="edit"
        :composition="composition"
        :layers="layers" :layer="layer" :meta="meta" :player="player"
        @meta="$parent.$emit('meta', $event)")
    div(v-if="false").col.full-height.br
      layers(
        mode="pick"
        :composition="composition"
        :layers="layers" :layer="layer" :meta="meta" :player="player")
</template>

<script>
import layerEditor from './layer_editor'
import layers from './layers'

export default {
  name: 'compositionEditorVideo',
  components: {layerEditor, layers},
  props: ['ctx', 'composition', 'player', 'meta'],
  data () {
    return {
      editorHeight: 0,
      // layerIndex: 0,
      layerIndexPlay: false,
      layerInitialLength: 10,
      layersShow: true,
      layersWidth: 400,
      layersBottom: true,
      mode: 'watch',
      modes: ['watch', 'play', 'layer']
    }
  },
  computed: {
    layers () {
      // return this.composition.layers.filter((l, li) => {
      //   return l.figuresAbsolute.length > 0
      // })
      return this.composition.layers
    },
    layer () {
      if (this.layers[this.meta.layerIndex]) return this.layers[this.meta.layerIndex]
      else return null
    },
    content () {
      if (this.layer) return this.layer.content
      else return null
      // return this.layer.content
      // return this.composition.layers.reduce((acc, val) => {
      //   if (!acc && val.figuresAbsolute.length === 0) acc = val.content
      //   return acc
      // }, null)
    }
  },
  watch: {
    // layer: {
    //   handler (to, from) {
    //     this.$log('layer CHANGED', to)
    //     this.$tween.to(this, 0.5, {editorHeight: to ? 100 : 0})
    //   }
    // },
    // layersShow: {
    //   handler (to, from) {
    //     this.$log('layersShow CHANGED', to)
    //     this.$tween.to(this, 0.5, {layersWidth: to ? 400 : 0})
    //   }
    // }
  },
  methods: {
    layerAdd (start, end) {
      this.$log('layerAdd start/end: ', start, end)
      let from = start || this.meta.now
      let to = end || from + this.layerInitialLength < this.meta.duration ? from + this.layerInitialLength : this.meta.duration
      this.$log('layerAdd from/to: ', from, to)
      // add to first layer figuresAbsolute
      if (this.layers.length === 1 && this.layers[0].figuresAbsolute.length === 0) {
        this.$set(this.composition.layers[0], 'figuresAbsolute', [
          {t: from, points: []},
          {t: to, points: []}
        ])
      }
      // add layer
      else {
        let l = {
          content: this.content,
          figuresAbsolute: [
            {t: from, points: []},
            {t: to, points: []}
          ]
        }
        this.$log('layerAdd layer: ', l)
        this.$set(this.composition, 'layers', [l, ...this.composition.layers])
      }
      this.$parent.$emit('meta', ['mode', 'layer'])
      this.$parent.$emit('meta', ['layerIndexPlay', -1])
      this.$parent.$emit('meta', ['layerIndex', 0])
      this.$log('layerAdd done')
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
