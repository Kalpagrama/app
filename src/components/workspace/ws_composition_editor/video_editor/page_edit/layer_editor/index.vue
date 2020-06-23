<template lang="pug">
div(
  :class=`{
    'b-60': true,
  }`
  :style=`{
    borderRadius: '10px',
    overflow: 'hidden',
  }`).row.full-width
  div(v-if="storeEditor.layerEditing === layer.id").row.full-width
    layer-frames(:layer="layer" :storePlayer="storePlayer" :storeLayerEditor="storeLayerEditor" :storeEditor="storeEditor")
    .row.full-width.q-px-sm
      layer-progress(:layer="layer" :storePlayer="storePlayer" :storeLayerEditor="storeLayerEditor" :storeEditor="storeEditor")
    layer-actions(:layer="layer" :storePlayer="storePlayer" :storeLayerEditor="storeLayerEditor" :storeEditor="storeEditor")
  //- name editor
  div(
    :style=`{
      position: 'relative',
    }`).row.full-width.justify-center
    q-input(
      :value="layerName"
      @input="layerNameChanged"
      @focus="layerNameFocused"
      @blur="layerNameBlurred"
      filled dense dark color="white"
      :style=`{maxWidth: '600px'}`).full-width
      template(v-slot:prepend)
        small(:style=`{fontSize: '12px'}`).text-grey-5 {{ $time(layer.figuresAbsolute[0].t) }}
      template(v-slot:append)
        small(
          v-if="storeEditor.layerEditing === layer.id"
          :style=`{fontSize: '12px'}`).text-grey-5 {{ $time(layer.figuresAbsolute[1].t) }}
        q-btn(
          v-if="storeEditor.layerEditing !== layer.id"
          @click="layerEditingToggle()"
          flat dense
          :color="storeEditor.layerEditing === layer.id ? 'green' : 'grey-6'"
          :icon="storeEditor.layerEditing === layer.id ? 'check' : 'edit'")
    layer-progress-mini(
      v-if="storeEditor.layerEditing !== layer.id"
      :layer="layer" :storePlayer="storePlayer" :storeLayerEditor="storeLayerEditor" :storeEditor="storeEditor")
  //- footer
  div(v-if="storeEditor.layerEditing === layer.id").row.full-width.q-pa-xs
    q-btn(round flat dense color="red-5" icon="delete_outline" @click="$emit('delete')")
    .col
    q-btn(round flat dense color="grey-3" no-caps @click="$emit('createNode')").q-px-sm Create node
    .col
    q-btn(round flat dense color="green" icon="check" @click="layerEditingToggle()")
</template>

<script>
import layerFrames from './layer_frames'
import layerActions from './layer_actions'
import layerProgress from './layer_progress'
import layerProgressMini from './layer_progress_mini'

export default {
  name: 'layerEditor',
  components: {layerFrames, layerActions, layerProgress, layerProgressMini},
  props: ['layer'],
  inject: ['sidEditor', 'sidPlayer'],
  data () {
    return {
      watcherCurrentTime: null,
      progressPercentRaw: null,
      need_framesLayerCenter: false,
    }
  },
  computed: {
    storeEditor () {
      return window.stores[this.sidEditor]
    },
    storePlayer () {
      return window.stores[this.sidPlayer]
    },
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
    storeLayerEditor () {
      return {
        layerDuration: this.layerDuration,
        layerStart: this.layerStart,
        layerEnd: this.layerEnd,
        // fn
        need_framesLayerCenter: this.need_framesLayerCenter,
        set: (key, val) => {
          this[key] = val
        }
      }
    }
  },
  watch: {
    'storeEditor.layerPlaying': {
      handler (to, from) {
        if (to === this.layer.id) {
          // alert('START WATCH: ' + this.layer.id)
          this.watcherCurrentTime = this.$watch('storePlayer.currentTime', (to, from) => {
            this.$log('storePlayer.currentTime TO', to)
            if (to > this.layerEnd || to < this.layerStart) {
              this.storePlayer.setCurrentTime(this.layerStart)
            }
          })
        }
        else {
          // alert('UNWATCH: ' + this.layer.id)
          if (this.watcherCurrentTime) this.watcherCurrentTime()
        }
      }
    },
  },
  methods: {
    layerCreateNode () {
      this.$log('layerCreateNode')
    },
    layerDelete () {
      this.$log('layerDelete')
    },
    layerNameChanged (e) {
      // this.$log('layerNameChanged', e)
      this.$set(this.layer.spheres, 0, {name: e})
    },
    layerNameFocused (e) {
      // this.$log('layerNameFocused', e)
      this.storeEditor.layerPlaying = this.layer.id
      this.storePlayer.setCurrentTime(this.layerStart)
      this.storePlayer.player.play()
    },
    layerNameBlurred (e) {
      // this.$log('layerNameBlurred', e)
    },
    layerEditingToggle (e) {
      this.$log('layerEditingToggle', e)
      if (this.storeEditor.layerEditing === this.layer.id) {
        this.storeEditor.layerEditing = null
        this.storeEditor.layerPlaying = null
      }
      else {
        this.storeEditor.layerEditing = this.layer.id
        this.storeEditor.layerPlaying = this.layer.id
      }
    },
  },
  mounted () {
    this.$log('mounted')
  }
}
</script>
