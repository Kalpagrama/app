<template lang="pug">
div(
  :class=`{
    'b-70': active,
  }`
  :style=`{
    borderRadius: $store.state.ui.borderRadius+'px',
    overflow: 'hidden',
  }`
  ).row.full-width.items-end
  //- active layer editor
  div(
    v-if="active"
    ).row.full-width
    layer-frames(
      :layer="layer"
      :statePlayer="statePlayer"
      :stateLayerEditor="stateLayerEditor")
    layer-progress(
      :layer="layer"
      :statePlayer="statePlayer"
      :stateLayerEditor="stateLayerEditor")
    layer-actions(
      :layer="layer"
      :statePlayer="statePlayer"
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
          @click="stateEditor.set('layerEditing', stateEditor.layerEditing ? null : this.layer.id)"
          round flat dense
          :color="stateEditor.layerEditing === layer.id ? 'green' : 'grey-6'"
          :icon="stateEditor.layerEditing === layer.id ? 'check' : 'edit'")
</template>

<script>
import layerFrames from './layer_frames'
import layerProgress from './layer_progress'
import layerActions from './layer_actions'

export default {
  name: 'layerEditor',
  components: {layerFrames, layerProgress, layerActions},
  props: ['layer'],
  inject: ['stateEditor'],
  data () {
    return {
      active: false,
      layerId: null,
      need_framesLayerCenter: false,
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
        // fn
        need_framesLayerCenter: this.need_framesLayerCenter,
        set: (key, val) => {
          this[key] = val
        }
      }
    }
  },
  watch: {
    'statePlayer.currentTime': {
      handler (to, from) {
        // if ()
        // this.$log('statePlayer.currentTime TO', to)
      }
    }
  },
  methods: {
    nameInputFocused (e) {
      this.$log('nameInputFocused', e)
      this.statePlayer.set('currentTime', this.stateLayerEditor.layerStart)
      this.statePlayer.player.setCurrentTime(this.stateLayerEditor.layerStart)
      this.statePlayer.player.play()
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
