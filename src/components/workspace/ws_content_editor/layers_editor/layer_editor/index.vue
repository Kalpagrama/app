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
  //- header
  div(
    v-if="true"
    :style=`{maxHeight: headerMaxHeight+'px', overflow: 'hidden'}`
    ).row.full-width
    layer-frames(v-bind="$props" :layer="statePlayer.layer")
    layer-actions(v-bind="$props" :layer="statePlayer.layer")
  //- body
  div(key="body").col.full-width
    layer-names(v-bind="$props" :layer="statePlayer.layer")
  //- footer
  div(
    v-if="!stateEditor.layerNameFocused"
    :style=`{
      position: 'absolute', zIndex: 2000, bottom: '0px',
      borderRadius: '10px 10px 0 0', overflow: 'hidden'
    }`).row.full-width.items-start.content-start.b-90
    .row.full-width.q-pa-sm
      q-btn(flat round dense color="red" no-caps @click="$emit('close'), $emit('delete')").q-px-sm
        span.text-bold Delete
      .col
        .row.fit.items-center.content-center.justify-center.q-px-sm
          q-btn(round flat dense color="white" icon="keyboard_arrow_left" @click="$emit('prev')").b-100
          q-btn(flat dense color="white" no-caps).b-100.q-mx-sm.q-px-md Play
          q-btn(round flat dense color="white" icon="keyboard_arrow_right" @click="$emit('next')").b-100
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
  props: ['stateEditor', 'player', 'statePlayer'],
  data () {
    return {
      layerSpheresEditorOpened: false,
      headerMaxHeight: 500
    }
  },
  computed: {
    layer () {
      return this.statePlayer.layer
    },
    layerName () {
      if (this.layer.spheres.length > 0) return this.layer.spheres[0].name
      else return 'Set layer name'
    }
  },
  watch: {
    'stateEditor.layerNameFocused': {
      handler (to, from) {
        this.$log('stateEditor.layerNameFocused CHANGED', to)
        this.$tween.to(this, 0.2, {headerMaxHeight: to ? 0 : 500})
      }
    }
  },
  methods: {
    layerDelete () {
      this.$log('layerDelete')
      this.$emit('delete')
    }
  },
  mounted () {
    this.$log('mounted')
    this.statePlayer.set('mode', 'layer')
    this.player.play()
  }
}
</script>
