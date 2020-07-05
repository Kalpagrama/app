<template lang="pug">
div(
  :class=`{
    'b-90': storeEditor.layerEditing === layer.id,
  }`
  :style=`{
    position: 'relative',
    borderRadius: '10px',
    overflow: 'hidden',
  }`).row.full-width.b-60
  //- debug
  //- kalpa-debug(
  //-   :options=`{layerPlaying:storeEditor.layerPlaying}`
  //-   :style=`{order: -2}`)
  //- layer close
  q-btn(
    v-if="false && storeEditor.layerEditing === layer.id && composition.layers.length > 1"
    @click="storeEditor.layerEditing = null"
    round flat dense color="green" icon="check"
    :style=`{position: 'absolute', right: '4px', bottom: 0, zIndex: 1000,}`)
  //- layer tune
  q-btn(
    v-if="false && storeEditor.layerEditing === layer.id && true"
    @click="editing = !editing"
    round dense flat icon="tune"
    :color="editing ? 'green' : 'grey-2'"
    :style=`{position: 'absolute', left: '4px', bottom: 0, zIndex: 1000,}`)
  //- frames: mini editing...
  div(:style=`{position: 'relative', overflow: 'hidden',}`).row.full-width
    transition(appear enter-active-class="animated slideInDown")
      div(v-if="storeEditor.layerEditing === layer.id").row.full-width
        layer-frames(:layer="layer" :storePlayer="storePlayer" :storeLayerEditor="storeLayerEditor" :storeEditor="storeEditor")
        //- editing
        div(:style=`{opacity: editing ? 1 : 1}`).row.full-width
          div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).row.full-width.b-70
            div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).row.full-width.items-center.content-center.b-80.q-px-xs
              q-btn(round flat dense color="white" icon="play_arrow")
              .col.q-px-xs
                layer-progress(:layer="layer" :storePlayer="storePlayer" :storeLayerEditor="storeLayerEditor" :storeEditor="storeEditor")
              q-btn(round flat dense color="white" icon="refresh")
            //- layer-actions(:layer="layer" :storePlayer="storePlayer" :storeLayerEditor="storeLayerEditor" :storeEditor="storeEditor")
            div().row.full-width
              div(:style=`{paddingLeft: '40px', paddingRight: '40px'}`).row.full-width
                q-btn(round flat dense color="grey-6" icon="flip").q-mr-xs.rotate-180
                q-btn(round flat dense color="grey-6" icon="keyboard_arrow_left")
                q-btn(round flat dense color="grey-6" icon="keyboard_arrow_right")
                .col
                q-btn(round flat dense color="grey-6" icon="keyboard_arrow_left")
                q-btn(round flat dense color="grey-6" icon="keyboard_arrow_right")
                q-btn(round flat dense color="grey-6" icon="flip")
  //- name editor
  div(
    v-if="composition.layers.length > 1"
    :style=`{
      position: 'relative', borderRadius: '10px', overflow: 'hidden', order: -1,
    }`).row.full-width.justify-center
    q-input(
      :value="layerName"
      @click="layerNameClick"
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
      v-if="layerProgressMiniShow"
      :layer="layer" :storePlayer="storePlayer" :storeLayerEditor="storeLayerEditor" :storeEditor="storeEditor")
</template>

<script>
import layerFrames from './layer_frames'
import layerActions from './layer_actions'
import layerProgress from './layer_progress'
import layerProgressMini from './layer_progress_mini'

export default {
  name: 'layerEditor',
  components: {layerFrames, layerActions, layerProgress, layerProgressMini},
  props: ['composition', 'layer', 'layerIndex'],
  inject: ['sidEditor', 'sidPlayer'],
  data () {
    return {
      watcherCurrentTime: null,
      progressPercentRaw: null,
      need_framesLayerCenter: false,
      editing: false,
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
    layerProgressMiniShow () {
      if (this.storeEditor.compositionPlaying) {
        return this.layerIndex === this.storeEditor.layerActive
      }
      else {
        return this.storeEditor.layerPlaying === this.layer.id && !this.storeEditor.layerEditing
      }
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
    'storePlayer.focused': {
      handler (to, from) {
        this.$log('storePlayer.focused TO', to)
        this.storeEditor.layerPlaying = null
        // alert('storePlayer.focused TO: ' + to)
      }
    },
    'storeEditor.layerPlaying': {
      immediate: true,
      handler (to, from) {
        if (to === this.layer.id) {
          // alert('START WATCH: ' + this.layer.id)
          this.watcherCurrentTime = this.$watch('storePlayer.currentTime', (to, from) => {
            // if (this.storeEditor.compositionPlaying) return
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
    layerNameClick (e) {
      this.$log('layerNameClick', e)
    },
    layerNameFocused (e) {
      // this.$log('layerNameFocused', e)
      this.storeEditor.compositionPlaying = false
      this.storeEditor.layerPlaying = this.layer.id
      this.storePlayer.setCurrentTime(this.layerStart)
      this.storePlayer.player.play()
    },
    layerNameBlurred (e) {
      // this.$log('layerNameBlurred', e)
      // this.storeEditor.compositionPlaying = true
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
