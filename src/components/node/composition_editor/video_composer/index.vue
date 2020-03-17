<template lang="pug">
div
  //- layerAdd
  q-btn(
    round push color="green" icon="add" @click="layerAdd()"
    :style=`{
      position: 'absolute', zIndex: 30000,
      bottom: layoutVertical ? 400+90+10+'px' : 260+10+'px',
      right: layoutVertical ? 10+'px': 450+10+'px'}`)
  //- layerEditor
  div(
    v-if="page === 'layers' && meta.layerIndexPlay >= 0"
    :style=`{
      position: 'absolute', zIndex: 2200, height: '170px',
      bottom: layoutVertical ? '400px' : '0px',
      width: layoutVertical ? '100%' : 'calc(100% - 450px)',
      background: 'rgba(0,0,0,0.9)'
    }`).row
    layer-editor(:layer="layer" :layers="layers" :player="player" :meta="meta" :content="content" @add="layerAdd" @meta="$parent.$emit('meta', $event)")
  //- meta
  div(
    :style=`{
      position: 'absolute', zIndex: 2000,
      height: layoutVertical ? '400px' : '100%',
      width: layoutVertical ? '100%' : '450px',
      right: '0px', bottom: '0px'
    }`).column.bg-grey-10
    div(v-if="true" :style=`{height: '60px'}`).row.full-width.items-center.content-center
      //- q-btn(round flat color="white"
      //-   :icon="isHorizSet ? 'keyboard_arrow_right' : 'keyboard_arrow_down'" @click="isHorizSet = !isHorizSet")
      //- .col
      .col.full-height
        .row.fit.items-center.content-center
          kalpa-buttons(:value="pages" :id="page" idKey="id" @id="page = $event")
    .col.full-width
      content-info(
        v-if="page === 'info'" :content="composition.layers[0].content")
      layers(
        v-if="page === 'layers'" :composition="composition" :layers="layers" :player="player" :meta="meta"
        @meta="$parent.$emit('meta', $event)")
      //- content-nodes()
      //- content-spheres()
</template>

<script>
import contentInfo from './content_info'
import layers from './layers'
import layerEditor from './layer_editor'

export default {
  name: 'videoComposer',
  components: {contentInfo, layers, layerEditor},
  props: ['ctx', 'composition', 'player', 'meta', 'layoutVertical'],
  data () {
    return {
      width: 0,
      height: 0,
      isHorizSet: false,
      page: 'layers',
      pages: [
        {id: 'info', name: 'Info'},
        {id: 'layers', name: 'Layers'},
        {id: 'nodes', name: 'Nodes'},
        {id: 'spheres', name: 'Spheres'}
      ],
      layerInitialLength: 10
    }
  },
  computed: {
    layers () {
      return this.composition.layers
    },
    layer () {
      return this.layers[this.meta.layerIndex]
    },
    content () {
      return this.layer.content
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
    }
  }
}
</script>
