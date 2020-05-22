<template lang="pug">
div(
  :style=`{
    position: 'relative',
    height: height > 44 ? 44+'px' : height+'px'
  }`
  ).row.full-width.items-center.content-center
  //- name editor
  q-dialog(v-model="layerNameEditorOpened" position="bottom")
    layer-name-editor(
      :layer="layer"
      :style=`{
        maxWidth: $store.state.ui.maxWidthPage+'px',
        minHeight: $q.screen.xs ? $q.screen.height-60+'px' : '500px'
      }`)
  //- tint
  div(
    v-if="height === heightNormal"
    @click="layerClickHeader()"
    :style=`{
      position: 'absolute', zIndex: 200,
    }`
  ).row.fit
  //- minibar
  div(:style=`{position: 'absolute', top: '0px', height: '8px', borderRadius: '4px', overflow: 'hidden', pointerEvents: 'none'}`).row.full-width.b-100
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
    .row.fit.items-center.content-center.q-px-md
      span(@click="layerNameClick()").text-white Layer name
  small.text-white {{ $time(layer.figuresAbsolute[0].t) }} -
  small.text-white.q-mx-xs {{ $time(layer.figuresAbsolute[1].t) }} /
  small.text-white.q-mr-sm {{ $time(layer.figuresAbsolute[1].t-layer.figuresAbsolute[0].t) }}
</template>

<script>
import layerNameEditor from './layer_name_editor'

export default {
  name: 'layerItem-layerHeader',
  components: {layerNameEditor},
  props: ['player', 'meta', 'layer'],
  data () {
    return {
      layerNameEditorOpened: false
    }
  },
  methods: {
    layerNameClick () {
      this.$log('layerNameClick')
      this.layerNameEditorOpened = true
    }
  }
}
</script>
