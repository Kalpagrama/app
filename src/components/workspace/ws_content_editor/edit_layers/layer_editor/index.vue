<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit.b-50
  //- layer spheres
  q-dialog(v-model="layerSpheresEditorOpened" position="bottom" @hide="layerSpheresEditorOpened = false")
    layer-spheres(
      :layer="layer"
      @close="layerSpheresEditorOpened = false"
      :style=`{
        maxWidth: $q.screen.xs ? $q.screen.width+'px' : 600+'px',
        maxHeight: $q.screen.xs ? $q.screen.height-60+'px' : $q.screen.height*0.7+'px',
        minHeight: $q.screen.xs ? $q.screen.height-60+'px' : $q.screen.height*0.7+'px',
      }`)
  div.row.full-width
    //- div(:style=`{}`).row.full-width.bg-green.q-pa-sm
    //-   span hello
    layer-frames(v-bind="$props" :layer="meta.layer" :width="width")
    layer-actions(v-bind="$props" :layer="meta.layer" :width="width")
  .col.full-width
    layer-names(v-bind="$props" :layer="meta.layer")
  //- footer
  div(
    :style=`{
      position: 'absolute', zIndex: 2000, bottom: '0px',
      borderRadius: '10px 10px 0 0', overflow: 'hidden'
    }`).row.full-width.items-start.content-start.b-90
    .row.full-width.q-pa-sm
      q-btn(round flat color="white" icon="keyboard_arrow_left").b-100
      .col
      q-btn(round flat color="white" icon="keyboard_arrow_right").b-100
    .row.full-width.q-pa-sm
      q-btn(flat color="white" no-caps @click="layerDelete()").b-100 Delete layer
      .col
      q-btn(push color="green" no-caps @click="$emit('close')").q-px-md Save
</template>

<script>
import layerNames from './layer_names'
import layerFrames from './layer_frames'
import layerActions from './layer_actions'
import layerSpheres from './layer_spheres'

export default {
  name: 'layerEditor',
  components: {layerNames, layerFrames, layerActions, layerSpheres},
  props: ['editorType', 'player', 'meta', 'composition', 'width'],
  data () {
    return {
      layerSpheresEditorOpened: false
    }
  },
  computed: {
    layer () {
      return this.meta.layer
    },
    layerName () {
      if (this.layer.spheres.length > 0) return this.layer.spheres[0].name
      else return 'Set layer name'
    }
  },
  methods: {
    layerDelete () {
      this.$log('layerDelete')
    }
  },
  mounted () {
    this.$log('mounted')
    this.player.meta(['mode', 'layer'])
    // this.player.set
    this.player.play()
  }
}
</script>
