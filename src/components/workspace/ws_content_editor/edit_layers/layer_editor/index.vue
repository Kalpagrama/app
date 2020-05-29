<template lang="pug">
.column.fit.b-50
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
    layer-frames(v-bind="$props" :layer="meta.layer" :width="width")
  .col.full-width
    layer-actions(v-bind="$props" :layer="meta.layer" :width="width")
    div().row.full-width.q-px-sm
      q-btn(
        @click="layerSpheresEditorOpened = true"
        size="lg" flat color="white" no-caps
        ).b-70 {{ layerName }}
    .row.full-width.q-pa-sm
      ws-sphere(
        v-for="(s,si) in layer.spheres" :key="s.id"
        v-if="si > 0"
        :sphere="s").q-mr-sm.q-mb-sm
  div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).row.full-width.q-pa-sm.b-70
    q-btn(flat color="white" no-caps @click="layerDelete()").b-80 Delete layer
    .col
    q-btn(push color="green" no-caps @click="$emit('close')").q-px-md Save
</template>

<script>
import layerFrames from './layer_frames'
import layerActions from './layer_actions'
import layerSpheres from './layer_spheres'

export default {
  name: 'layerEditor',
  components: {layerFrames, layerActions, layerSpheres},
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
