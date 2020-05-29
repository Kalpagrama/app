<style lang="sass" scoped>
.layer-tint
  cursor: pointer
  &:hover
    background: rgba(150,150,150,0.4) !important
</style>

<template lang="pug">
div(
  :style=`{
    position: 'relative',
    height: 50+'px'
  }`
  ).row.full-width.items-center.content-center
  //- editor
  q-dialog(v-model="layerNameEditorOpened" position="bottom")
    layer-editor(
      :layer="layer"
      @cancel="layerNameEditorOpened = false"
      :style=`{
        maxWidth: $store.state.ui.maxWidthPage+'px',
        minHeight: $q.screen.xs ? $q.screen.height-60+'px' : '500px'
      }`)
  //- tint
  div(
    v-if="meta.layerId !== layer.id"
    @click="layerTintClick()"
    :style=`{
      position: 'absolute', zIndex: 200,
    }`
    ).row.fit.layer-tint
  //- minibar
  div(
    v-if="editorType === 'content'"
    :style=`{
      position: 'absolute', top: '0px', height: '8px',
      borderRadius: '4px', overflow: 'hidden', pointerEvents: 'none'
    }`).row.full-width.b-100
    div(
      :style=`{
        position: 'absolute', top: '0px', zIndex: 100,
        left: (layer.figuresAbsolute[0].t/meta.duration)*100+'%',
        width: ((layer.figuresAbsolute[1].t-layer.figuresAbsolute[0].t)/meta.duration)*100+'%',
        borderRadius: '4px', overflow: 'hidden',
        background: layer.color,
        pointerEvents: 'none',
        height: '8px',
      }`
      ).row
  //- body
  .col.full-height
    .row.fit.items-center.content-center.q-px-sm
      q-btn(
        v-if="layerNameShow"
        @click="layerNameClick()"
        flat no-caps color="white"
        :class=`{
          'b-110': layer.spheres.length === 0
        }`).b-110 {{ layerName }}
  //- stats: start,end,total
  small.text-white {{ $time(layer.figuresAbsolute[0].t) }} -
  small.text-white.q-mx-xs {{ $time(layer.figuresAbsolute[1].t) }} /
  small.text-white.q-mr-md {{ $time(layer.figuresAbsolute[1].t-layer.figuresAbsolute[0].t) }}
</template>

<script>
import layerEditor from './layer_editor'

export default {
  name: 'layerItem-layerHeader',
  components: {layerEditor},
  props: ['editorType', 'player', 'meta', 'layer', 'mode'],
  data () {
    return {
      layerNameEditorOpened: false
    }
  },
  computed: {
    layerNameShow () {
      if (this.layer.spheres.length > 0) return true
      else return this.mode === 'edit'
    },
    layerName () {
      if (this.layer.spheres.length > 0) {
        return this.layer.spheres[0].name
      }
      else {
        return 'Set layer name'
      }
    },
    layerStart () {
      return this.layer.figuresAbsolute[0].t
    }
  },
  methods: {
    layerTintClick () {
      this.$log('layerTintClick')
      this.player.meta(['layerId', this.layer.id])
      this.player.meta(['mode', 'layer'])
      this.player.setCurrentTime(this.layerStart)
      this.player.update(this.layerStart)
      this.player.play()
      this.$emit('mode', 'edit')
    },
    layerNameClick () {
      this.$log('layerNameClick')
      this.layerNameEditorOpened = true
    }
  }
}
</script>
