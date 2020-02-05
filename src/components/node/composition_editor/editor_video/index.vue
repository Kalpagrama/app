<template lang="pug">
.row.fit
  div(:style=`{position: 'relative'}`).col.full-height
    composition(v-if="composition" :composition="composition" @player="player = $event")
      template(v-slot:right)
        q-btn(
          round push color="green" @click="layersShow = !layersShow"
          :icon="layersShow ? 'keyboard_arrow_right' : 'layers'").q-ml-sm
      //- layer editor
      template(v-slot:layerEditor=`{player, now}`)
        //- layer add
        q-btn(
          round push size="lg" color="green" icon="add" @click="layerAdd()"
          :style=`{position: 'absolute', right: '40px', top: '-80px'}`)
        //- layers on progress bar
        div(:style=`{position: 'absolute', zIndex: 200, top: '44px', height: '40px', pointerEvents: 'none'}`).row.full-width.q-px-md
          div(:style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden'}`).row.fit.items-center.content-center.q-px-sm
            div(
              v-for="(l, li) in layers" :key="li"
              v-if="l.figuresAbsolute && l.figuresAbsolute.length > 0"
              :style=`{
                position: 'absolute', zIndex: 200, opacity: li === layerIndex ? 0.9 : 0.5,
                left: (l.figuresAbsolute[0].t/player.duration)*100+'%',
                width: ((l.figuresAbsolute[1].t-l.figuresAbsolute[0].t)/player.duration)*100+'%',
                background: $randomColor(li)}`
              ).row.full-height
        //- layer editor minWidth: ((l.figuresAbsolute[1].t-l.figuresAbsolute[0].t)/player.duration)*100+'%',
        layer-editor(v-if="layer" :player="player" :now="now" :layers="layers" :layer="layer" :layerIndex="layerIndex" :style=`{height: editorHeight+'px'}`)
  //- layers
  div(:style=`{width: layersWidth+'px', overflow: 'hidden', borderLeft: '1px solid #4caf50'}`).row.full-height
    .column.fit
      div(:style=`{height: '60px'}`
        ).row.full-width
        div(:style=`{width: '60px', height: '60px'}`).row.items-center.justify-center
          q-btn(round flat color="green" icon="layers")
        .col.full-height
          .row.fit.items-center.content-center
            span.text-bold.text-green Layers
      div(:style=`{position: 'relative'}`).col.full-width.scroll
        .row.full-width.items-start.content-start.q-pa-md
          div(
            v-for="(l, li) in layers" :key="li" @click="layerClick(l, li)"
            :class=`{'bg-grey-10': li !== layerIndex, 'bg-grey-8': li === layerIndex}`
            :style=`{height: '40px', borderRadius: '10px', overflow: 'hidden'}`
            ).row.full-width.items-center.content-center.q-px-sm.q-mb-sm.cursor-pointer
            div(v-if="l.figuresAbsolute.length > 0").row.fit.items-center.content-center
              span.text-white {{ $time(l.figuresAbsolute[0].t) }}-
              span.text-white {{ $time(l.figuresAbsolute[1].t) }}
</template>

<script>
import composition from 'components/node/composition'
import layerEditor from './layer_editor'

export default {
  name: 'compositionEditorVideo',
  components: {composition, layerEditor},
  props: ['composition', 'content'],
  data () {
    return {
      editorHeight: 0,
      // player: null,
      layerIndex: -1,
      layersShow: true,
      layersWidth: 400
    }
  },
  computed: {
    layers () {
      return this.composition.layers
    },
    layer () {
      if (this.layerIndex >= 0) return this.layers[this.layerIndex]
      else return null
    }
  },
  watch: {
    layer: {
      handler (to, from) {
        this.$log('layer CHANGED', to)
        this.$tween.to(this, 0.5, {editorHeight: to ? 100 : 0})
      }
    },
    layersShow: {
      handler (to, from) {
        this.$log('layersShow CHANGED', to)
        this.$tween.to(this, 0.5, {layersWidth: to ? 400 : 0})
      }
    }
  },
  methods: {
    layerClick (l, li) {
      this.$log('layerClick', l, li)
      this.layerIndex = li
      this.player.setCurrentTime(l.figuresAbsolute[0].t)
    },
    layerPlay () {
      this.$log('layerPlay')
    },
    layerDelete (li) {
      this.$log('layerDelete')
      // TODO: check if the layer is the fucking last??
      if (this.layers.length > 1) {
        this.$delete(this.composition.layers, li)
      }
    },
    layerAdd (start, end) {
      this.$log('layerAdd', start, end)
      // TODO: check layers and find one last, or one first one
      let from = start || this.player.now
      let to = end || from + 30 < this.player.duration ? from + 30 : this.player.duration
      // let to = this.player.duration
      // update first layer without figures, or create a new layer...
      if (this.layers.length === 1 && this.layers[0].figuresAbsolute.length === 0) {
        this.$set(this.composition.layers[0], 'figuresAbsolute', [
          {t: from, points: []},
          {t: to, points: []}
        ])
        this.layerIndex = 0
      } else {
        let l = {
          content: this.content,
          figuresAbsolute: [
            {t: from, points: []},
            {t: to, points: []}
          ]
        }
        this.$set(this.composition, 'layers', [...this.composition.layers, l])
        this.layerIndex = this.layers.length - 1
      }
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
