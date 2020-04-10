<template lang="pug">
div
  //- header
  div(
    :style=`{
      position: 'absolute', zIndex: 900, height: '60px',
      paddingLeft: $q.screen.width > 800 ? styles.paddingLeft+'px' : 0,
      left: '0px', bottom: '0px', background: meta.playing ? 'rgba(0,0,0,0.3)' : 'black'
    }`).row.full-width.bg-grey-10
    .col.full-height
      .row.fit.items-center.content-center.q-pl-md
        q-btn(outline no-caps color="red" @click="$emit('cancel')"
          :style=`{borderRadius: '10px'}`).q-mr-sm Back
        //- .col
        q-btn(push no-caps color="green" @click="$emit('cancel')"
          :style=`{minWidth: '100px', borderRadius: '10px', overflow: 'hidden'}`)
          span.text-white Save & close
        //- span.text-white {{styles.paddingBottom}}
    div(:style=`{width: '60px', width: '60px'}`).row.items-center.content-center.justify-center
      q-btn(round flat color="green" icon="menu" @click="drawerToggle()")
  //- drawer
  div(
    :style=`{
      position: 'absolute', zIndex: 1000, top: '0px',
      height: 'calc(100% - 0px)',
      width: $q.screen.width > 800 ? '400px' : $q.screen.width-60+'px',
      left: $q.screen.width > 800 ? styles.paddingLeft-400+'px' : drawerWidth-($q.screen.width-60)+'px',
      overflow: 'hidden',
    }`).column.bg-grey-10
    //- div(:style=`{height: '60px', order: 1000}`).row.full-width
    //-   div(:style=`{width: '60px', width: '60px'}`).row.items-center.content-center.justify-center
    //-     q-btn(round flat color="green" icon="menu" @click="drawerToggle()")
    //-   .col.full-height
    //-     .row.fit.items-center.content-center
    //-       span.text-white.text-bold {{ctx === 'contentEditor' ? 'Content editor' : 'Composition editor'}}
    div(v-if="true" :style=`{height: '60px', order: 900}`).row.full-width.items-center.content-center
      //- q-btn(round flat color="white"
      //-   :icon="isHorizSet ? 'keyboard_arrow_right' : 'keyboard_arrow_down'" @click="isHorizSet = !isHorizSet")
      //- .col
      .col.full-height
        .row.fit.items-center.content-center
          kalpa-buttons(:value="pages" :id="page" idKey="id" @id="page = $event")
          .col
          q-btn(flat icon="keyboard_arrow_left" color="white" @click="drawerToggle()"
            :style=`{borderRadius: '10px', height: '36px'}`).q-mb-sm.q-mr-md.bg-grey-9
    .col.full-width
      content-info(
        v-if="page === 'info'" :content="composition.layers[0].content")
      layers(
        v-if="page === 'layers'"
        :ctx="ctx" :composition="composition" :layers="layers" :player="player" :meta="meta"
        @layerClick="layerClick"
        @layerAdd="layerAdd(null, null, $event)"
        @layerDelete="layerDelete"
        @drawerToggle="drawerToggle"
        @meta="$parent.$emit('meta', $event)")
  //- drawer CLOSER
  div(v-if="drawerWidth > 0 && $q.screen.width <= 800" @click="drawerToggle()"
    :style=`{position: 'absolute', zIndex: 950, right: '0px', top: '0px', width: '100%', background: 'rgba(0,0,0,0.8)'}`).row.full-height
  //- layerEditor
  div(
    :style=`{
      position: 'absolute', bottom: '60px',
      width: 'calc(100% - '+styles.paddingLeft+'px)', right: '0px',
      height: styles.paddingBottom-60+'px'
    }`).row.justify-center.items-end.content-end.bg-black
    //- tint play/pause
    div(
      v-if="$q.screen.width > 800 && tintShow"
      :style=`{position: 'absolute', zIndex: 910, top: '-155px', height: '155px', background: 'rgba(0,0,0,0.9)'}`).row.full-width
    //- player-video-progress(
    //-   :player="player" :meta="meta"
    //-   @meta="$parent.$emit('meta', $event)"
    //-   :style=`{position: 'absolute', zIndex: 920, bottom: styles.paddingBottom-70+'px'}`)
    layer-editor(
      v-if="true"
      :layer="layer" :layerIndex="meta.layerIndexPlay" :layers="layers" :player="player" :meta="meta" :content="content" @add="layerAdd" @meta="$parent.$emit('meta', $event)"
      :style=`{maxHeight: '70px'}`)
    div(
      v-if="meta.layerIndexPlay >= 0"
      :style=`{height: '160px'}`).row.full-width.justify-center.q-mb-sm
      div(:style=`{maxWidth: '500px'}`).row.full-width.justify-center
        q-btn(flat dense color="white" icon="keyboard_arrow_left" @click="layerNext(0)"
          :style=`{width: '30px', height: '100%', borderRadius: '10px', overflow: 'hidden'}`).q-mr-xs
        .col.full-height
          layer(
            v-if="layer.figuresAbsolute.length > 0"
            :index="meta.layerIndexPlay" :layer="layer" :player="player" :meta="meta"
            @layerNameSetStart="layerNameSetStart"
            @layerDelete="layerDelete(meta.layerIndexPlay)"
            @meta="$parent.$emit('meta', $event)"
            :style=`{maxWidth: '500px'}`)
        q-btn(flat dense color="white" icon="keyboard_arrow_right" @click="layerNext(1)"
          :style=`{width: '30px', height: '100%', borderRadius: '10px', overflow: 'hidden'}`).q-ml-xs
  //- layerAdd
  q-btn(
    round push size="md" color="green" icon="add" @click="layerAdd()"
    :style=`{position: 'absolute', zIndex: 920, bottom: styles.paddingBottom+4+'px', borderRadius: '50%', right: '10px'}`)
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
  props: ['ctx', 'mode', 'composition', 'meta', 'player', 'styles'],
  data () {
    return {
      page: 'layers',
      pages: [
        {id: 'info', name: 'Info'},
        {id: 'layers', name: 'Layers'},
        {id: 'nodes', name: 'Explore nodes'}
      ],
      layerInitialLength: 10,
      tintShow: false,
      drawerWidth: 0
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
    'meta.layerIndexPlay': {
      handler (to, from) {
        this.$log('meta.mode CHANGED', to)
        this.$tween.to(this.styles, 0.3, {paddingBottom: to >= 0 ? 310 : 70})
      }
    }
  },
  methods: {
    drawerToggle () {
      this.$log('drawerToggle')
      if (this.$q.screen.width > 800) {
        this.$tween.to(this.styles, 0.4, {paddingLeft: this.styles.paddingLeft === 0 ? 400 : 0})
      }
      else {
        this.$tween.to(this, 0.4, {drawerWidth: this.drawerWidth === 0 ? this.$q.screen.width - 60 : 0})
      }
    },
    layerNext (forward) {
      this.$log('layerNext', forward)
      let i = this.meta.layerIndexPlay
      if (forward) i += 1
      else i -= 1
      if (i < 0) i = this.layers.length - 1
      if (i > this.layers.length - 1) i = 0
      this.$parent.$emit('meta', ['layerIndexPlay', i])
    },
    layerClick (index) {
      this.$log('layerClick', index)
      this.$parent.$emit('meta', ['mode', 'layer'])
      this.$parent.$emit('meta', ['layerIndexPlay', index])
      this.$parent.$emit('meta', ['layerIndex', index])
      if (this.$q.screen.width > 800) {
      }
      else {
        this.drawerToggle()
      }
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
    },
    async layerDelete (i) {
      this.$log('layerDelete', i)
      if (!confirm('Delete layer?')) return
      if (this.layers.length > 1) {
        let index = i === 0 ? this.meta.layerIndex + 1 : this.meta.layerIndex - 1
        this.$parent.$emit('meta', ['mode', 'layer'])
        this.$parent.$emit('meta', ['layerIndex', index])
        this.$parent.$emit('meta', ['layerIndexPlay', index])
        this.$parent.$wait(300).then(() => {
          this.$delete(this.layers, i)
        })
      }
      else {
        let layer = {
          content: this.layers[0].content,
          figuresAbsolute: [],
          figuresRelative: [],
          spheres: []
        }
        this.$set(this.layers, 0, layer)
        this.$parent.$emit('meta', ['mode', 'watch'])
        this.$parent.$emit('meta', ['layerIndex', 0])
        this.$parent.$emit('meta', ['layerIndexPlay', -1])
      }
    }
  },
  mounted () {
    this.$log('mounted')
    if (!this.$q.screen.xs) this.drawerToggle()
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
