<template lang="pug">
.column.fit.b-50
  div.row.full-width
    layer-frames(v-bind="$props" :layer="meta.layer" :width="width")
  .col.full-width
    layer-actions(v-bind="$props" :layer="meta.layer" :width="width")
    div().row.full-width.q-px-sm.br
      q-btn(flat color="white" no-caps).b-90 {{ layerName }}
  div().row.full-width.q-pa-sm
    q-btn(flat color="white" no-caps @click="layerDelete()") Delete
    .col
    q-btn(push color="green" no-caps @click="$emit('close')").q-px-md Save
</template>

<script>
import layerFrames from './layer_frames'
import layerActions from './layer_actions'

export default {
  name: 'layerEditor',
  components: {layerFrames, layerActions},
  props: ['editorType', 'player', 'meta', 'composition', 'width'],
  data () {
    return {
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
