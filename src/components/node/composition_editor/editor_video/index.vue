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
  //- layers
  div(:style=`{position: 'relative', height: $q.screen.height/2+'px'}`).row.full-width
    q-btn(
      round flat color="green" @click="layersContentShow = !layersContentShow"
      :icon="layersContentShow ? 'keyboard_arrow_right' : 'keyboard_arrow_left'"
      :style=`{position: 'absolute', zIndex: 1100, top: '10px', right: '16px'}`)
    .col.full-height
      layers(
        mode="edit"
        :layers="layers" :meta="meta" :player="player"
        @meta="$parent.$emit('meta', $event)")
    div(v-if="layersContentShow").col.full-height
      layers(
        mode="pick"
        :layers="layersContent" :meta="{layerIndex: -1, mode: 'watch'}" :player="player"
        @pick="layerAdd(null,null,$event)")
</template>

<script>
import layerEditor from './layer_editor'
import layers from './layers'

export default {
  name: 'compositionEditorVideo',
  components: {layerEditor, layers},
  props: ['ctx', 'mode', 'composition', 'player', 'meta'],
  data () {
    return {
      layerInitialLength: 10,
      layersContentShow: false,
      layersContent: []
    }
  },
  computed: {
    layers () {
      return this.composition.layers
    },
    layer () {
      if (this.layers[this.meta.layerIndex]) return this.layers[this.meta.layerIndex]
      else return null
    },
    content () {
      return this.layer.content
    }
  },
  watch: {
    layersContentShow: {
      async handler (to, from) {
        this.$log('layersContentShow CHANGED', to)
        if (to) {
          // load content-node container with layers... on THIS content...
          let name = 'CONTENT-' + this.content.oid
          let item = await this.$store.dispatch('workspace/get', { name })
          // TODO save reactivity to update contents from THIS composition
          this.$log('item', JSON.parse(JSON.stringify(item)))
          let layers = item.compositions[0].layers
          this.$log('layers', layers)
          this.layersContent = layers
        }
      }
    }
  },
  methods: {
    layerAdd (start, end, layer) {
      this.$log('layerAdd start/end: ', start, end, layer)
      this.$log('layerAdd layers', this.layers)
      let from = start || this.meta.now
      let to = end || from + this.layerInitialLength < this.meta.duration ? from + this.layerInitialLength : this.meta.duration
      this.$log('layerAdd from/to: ', from, to)
      // ALTER first layer with figuresAbsolute
      // first layer is just a container for the content to play...
      if (this.layers.length === 1 && this.layers[0].figuresAbsolute.length === 0) {
        this.$log('ALTER first layer')
        // this.$set(this.composition.layers[0], 'figuresAbsolute', [
        //   {t: from, points: []},
        //   {t: to, points: []}
        // ])
        let index = 0
        let l = layer || {
          content: this.content,
          figuresAbsolute: [
            {t: from, points: []},
            {t: to, points: []}
          ],
          figuresRelative: [],
          spheres: []
        }
        this.$log('layerAdd layer: ', l)
        this.$set(this.composition.layers, index, l)
        // change meta
        this.$parent.$emit('meta', ['mode', 'layer'])
        this.$parent.$emit('meta', ['layerIndexPlay', index])
        this.$parent.$emit('meta', ['layerIndex', -1])
        this.$parent.$emit('meta', ['layerIndex', index])
      }
      // ADD last layer, push
      else {
        this.$log('ADD last layer')
        let index = this.composition.layers.length
        let l = layer || {
          content: this.content,
          figuresAbsolute: [
            {t: from, points: []},
            {t: to, points: []}
          ],
          figuresRelative: [],
          spheres: []
        }
        this.$log('layerAdd layer: ', l)
        this.$set(this.composition.layers, index, l)
        // change meta
        this.$parent.$emit('meta', ['mode', 'layer'])
        this.$parent.$emit('meta', ['layerIndexPlay', index])
        this.$parent.$emit('meta', ['layerIndex', index])
      }
      this.$log('layerAdd done')
      this.layerAddToWs()
    },
    layerAddToWs () {
      this.$log('layerAddToWs')
      // depends on ctx? on every new layer... we must
      // on every layer update...
      // on every node update... we must iterate over all the layers...
      // no dups, no dups in container, save all good to your named layers... and the name is not unique...
      // unique is figuresAbsolute...
      // move this logic in nodeSaver?
    }
  },
  mounted () {
    // this.$log('mounted')
  },
  beforeDestroy () {
    // this.$log('beforeDestroy')
  }
}
</script>
