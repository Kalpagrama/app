<template lang="pug">
div(
  :class=`{
    'b-70': active,
  }`
  :style=`{
    borderRadius: '10px',
    overflow: 'hidden',
  }`
  ).row.full-width.items-end
  div(
    v-if="active"
    ).row.full-width
    layer-frames(
      :layer="layer"
      :stateExplorer="stateExplorer"
      :stateLayerEditor="stateLayerEditor")
    layer-progress(
      :layer="layer"
      :stateExplorer="stateExplorer"
      :stateLayerEditor="stateLayerEditor")
    layer-actions(
      :layer="layer"
      :stateExplorer="stateExplorer"
      :stateLayerEditor="stateLayerEditor")
  //- name
  div(
    :style=`{height: '40px'}`
    ).row.full-width
    q-input(
      :value="layerName"
      @input="nameInputChanged"
      @focus="nameInputFocused"
      @blur="nameInputBlurred"
      @keydown.enter="nameInputEntered"
      filled dense dark color="grey-6"
      ).full-width
      template(v-slot:prepend)
        q-btn(
          round flat dense no-caps
          :style=`{color: layer.color}`
          ) {{ $time(layerStart) }}
      template(v-slot:append)
        q-btn(
          @click="active = !active"
          round flat dense
          :color="active ? 'green' : 'grey-6'"
          :icon="active ? 'check' : 'edit'")
</template>

<script>
import layerFrames from './layer_frames'
import layerProgress from './layer_progress'
import layerActions from './layer_actions'

export default {
  name: 'layerEditor',
  components: {layerFrames, layerProgress, layerActions},
  props: ['stateExplorer', 'layer'],
  data () {
    return {
      active: false,
      layerId: null,
    }
  },
  computed: {
    layerName () {
      if (this.layer.spheres.length > 0) return this.layer.spheres[0].name
      else return ''
    },
    layerStart () {
      return this.layer.figuresAbsolute[0].t
    },
    layerEnd () {
      return this.layer.figuresAbsolute[1].t
    },
    layerDuration () {
      return this.layerEnd - this.layerStart
    },
    stateLayerEditor () {
      return {
        layerId: this.layer.id,
        layerStart: this.layerStart,
        layerEnd: this.layerEnd,
        layerDuration: this.layerDuration,
        set: (key, val) => {
          this[key] = val
        }
      }
    }
  },
  methods: {
    nameInputFocused (e) {
      this.$log('nameInputFocused', e)
      this.stateExplorer.set('currentTime', this.stateLayerEditor.layerStart)
      this.stateExplorer.player.setCurrentTime(this.stateLayerEditor.layerStart)
      this.stateExplorer.player.play()
    },
    nameInputBlurred (e) {
      this.$log('nameInputBlurred', e)
    },
    nameInputChanged (e) {
      // this.$log('nameInputChanged', e)
      this.$set(this.layer.spheres, 0, {name: e})
    },
    nameInputEntered (e) {
      this.$log('nameInputEntered', e)
      if (e.ctrlKey) {
        this.$emit('add')
      }
    }
  }
}
</script>
