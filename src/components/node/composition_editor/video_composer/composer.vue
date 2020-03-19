<template lang="pug">
div
  //- header
  div(:style=`{position: 'absolute', zIndex: 900, height: '60px', left: '0px', top: '0px', background: meta.playing ? 'rgba(0,0,0,0.3)' : 'black'}`).row.full-width
    div(:style=`{width: '60px', width: '60px'}`).row.items-center.content-center.justify-center
      q-btn(round flat color="green" icon="menu" @click="drawerToggle()")
    .col.full-height
      .row.fit.items-center.content-center
        span.text-white.text-bold {{ composition.name }}
    div(:style=`{height: '60px'}`).row.items-center.content-center.q-px-md
      q-btn(outline no-caps color="red" @click="$emit('cancel')"
        :style=`{borderRadius: '10px'}`).q-mr-md Close
      q-btn(push no-caps color="green"
        :style=`{borderRadius: '10px'}`)
        span.text-white Done
  //- drawer
  div(
    :style=`{
      position: 'absolute', zIndex: 1000, left: '0px', top: '0px',
      height: 'calc(100% - 0px)',
      width: styles.paddingLeft+'px',
      overflow: 'hidden',
    }`).column.bg-grey-10
    div(:style=`{height: '60px'}`).row.full-width
      div(:style=`{width: '60px', width: '60px'}`).row.items-center.content-center.justify-center
        q-btn(round flat color="green" icon="menu" @click="drawerToggle()")
      .col.full-height
        .row.fit.items-center.content-center
          span.text-white.text-bold Content editor
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
  //- layerEditor
  div(
    :style=`{
      position: 'absolute', bottom: '0px',
      width: 'calc(100% - '+styles.paddingLeft+'px)', right: '0px',
      height: styles.paddingBottom+'px'
    }`).row.bg-black
    //- tint play/pause
    div(
      v-if="tintShow"
      :style=`{position: 'absolute', zIndex: 10000, top: '-155px', height: '155px', background: 'rgba(0,0,0,0.9)'}`).row.full-width
    player-video-progress(
      :player="player" :meta="meta"
      @meta="$parent.$emit('meta', $event)"
      :style=`{position: 'absolute', zIndex: 20000, top: '-90px'}`)
    layer-editor(:layer="layer" :layers="layers" :player="player" :meta="meta" :content="content" @add="layerAdd" @meta="$parent.$emit('meta', $event)"
      :style=`{maxHeight: '70px'}`)
    div(:style=`{height: '200px'}`).row.full-width.justify-center.q-py-sm
      layer(
        :index="meta.layerIndexPlay" :layer="layer" :player="player" :meta="meta"
        @layerNameSetStart="layerNameSetStart"
        @layerDelete="layerDelete"
        @meta="$parent.$emit('meta', $event)"
        :style=`{maxWidth: '500px'}`)
  //- layerAdd
  q-btn(
    round push size="lg" color="green" icon="add" @click="layerAdd()"
    :style=`{position: 'absolute', zIndex: 30000, bottom: styles.paddingBottom+100+'px', right: '50px'}`)
</template>

<script>
import layer from './layers/layer'
import layers from './layers'
import playerVideoProgress from 'components/node/composition/player_video_progress'
import layerEditor from './layer_editor'
import contentInfo from './content_info'

export default {
  name: 'videoComposer_composer',
  components: {layer, layers, playerVideoProgress, layerEditor, contentInfo},
  props: ['composition', 'meta', 'player', 'styles'],
  data () {
    return {
      page: 'layers',
      pages: [
        {id: 'info', name: 'Info'},
        {id: 'layers', name: 'Layers'},
        {id: 'nodes', name: 'Explore nodes'}
      ],
      layerInitialLength: 10,
      tintShow: false
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
  watch: {
    'meta.playing': {
      handler (to, from) {
        this.$log('meta.playing CHANGED', to)
        // if (to === false) {
        //   this.$wait(300).then(() => {
        //     this.tintShow = !this.tintShow
        //   })
        // }
        // else {
        // }
        this.tintShow = !to
      }
    },
    'meta.mode': {
      handler (to, from) {
        this.$log('meta.mode CHANGED', to)
        if (to === 'layer') {
          this.$tween.to(this.styles, 0.4, {paddingBottom: 270})
        }
        if (to !== 'layer' && to !== from) {
          this.$tween.to(this.styles, 0.4, {paddingBottom: 0})
        }
      }
    }
  },
  methods: {
    drawerToggle () {
      this.$log('drawerToggle')
      this.$tween.to(this.styles, 0.4, {paddingLeft: this.styles.paddingLeft === 0 ? 400 : 0})
    },
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
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
