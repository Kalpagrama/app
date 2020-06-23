<template lang="pug">
div(
  :class=`{
    'b-60': true,
  }`
  :style=`{
    border: storeEditor.layerEditing === layer.id ? 'none' : storeEditor.layerPlaying === layer.id ? '2px solid green' : 'none',
    borderRadius: '10px',
  }`).row.full-width
  div(v-if="storeEditor.layerEditing === layer.id").row.full-width
    layer-frames(:storePlayer="storePlayer" :stateLayerEditor="stateLayerEditor" :layer="layer")
    //- layer-progress
    div(:style=`{position: 'relative',}`).row.full-width.q-px-sm
      //- tools
      div(:style=`{}`).row.full-width
        q-btn(round flat dense color="white" icon="play_arrow")
        .col
        q-btn(round flat dense color="white" icon="refresh")
      //- bar
      div(:style=`{position: 'relative'}`).row.full-width.q-py-xs
        div(
          :style=`{
            position: 'relative',
            height: '40px', borderRadius: '10px', overflow: 'hidden'
          }`).row.full-width.b-70
        div(
          :style=`{
            position: 'absolute', zIndex: 1000,
            left: '33%',
            top: '0px',
            height: 'calc(100%)',
            width: '4px', borderRadius: '2px',
          }`).row.bg-green
    //- layer-actions
    div.row.full-width
      div(
        :style=`{
        }`
        ).row.full-width.items-center.content-center.q-pa-sm
        q-btn(round flat dense color="white" icon="flip" @click="layerSet(0)").b-70.q-mr-xs.rotate-180
        q-btn-group(flat color="white" :style=`{borderRadius: $store.state.ui.borderRadius+'px'}`)
          q-btn(round flat dense color="white" icon="keyboard_arrow_left" @click="layerForward(0,0)").b-70
          q-btn(round flat dense color="white" icon="keyboard_arrow_right" @click="layerForward(0,1)").b-70
        .col
        q-btn-group(flat color="white" :style=`{borderRadius: $store.state.ui.borderRadius+'px'}`).q-mr-xs
          q-btn(round flat dense color="white" icon="keyboard_arrow_left" @click="layerForward(1,0)").b-70
          q-btn(round flat dense color="white" icon="keyboard_arrow_right" @click="layerForward(1,1)").b-70
        q-btn(round flat dense color="white" icon="flip" @click="layerSet(1)").b-70
  //- name editor
  div(
    :style=`{
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
        //- small(:style=`{fontSize: '12px'}`).text-grey-5 {{ $time(layer.figuresAbsolute[1].t) }}
        q-btn(
          @click="layerEditingToggle()"
          flat dense
          :color="storeEditor.layerEditing === layer.id ? 'green' : 'grey-6'"
          :icon="storeEditor.layerEditing === layer.id ? 'check' : 'edit'")
</template>

<script>
import layerFrames from './layer_frames'

export default {
  name: 'layerEditor',
  components: {layerFrames},
  props: ['layer'],
  inject: ['sidEditor', 'sidPlayer'],
  data () {
    return {
      watcherCurrentTime: null
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
    stateLayerEditor () {
      return {
        layerStart: this.layerStart,
        layerEnd: this.layerEnd
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
    layerSet (index) {
      this.$log('layerSet', index)
      // check, t for layerStart and layerEnd
      let t = this.storePlayer.currentTime
      if (index === 0) {
        if (t >= this.layerEnd) {
          this.$q.notify({type: 'negative', message: 'Cant set t >= layer end !'})
          return
        }
      }
      else {
        if (t <= this.layerStart) {
          this.$q.notify({type: 'negative', message: 'Cant set t <= layer start !'})
          return
        }
      }
      // set value
      this.layer.figuresAbsolute[index].t = t
      // center frames to the layer
      // this.stateLayerEditor.set('need_framesLayerCenter', true)
    },
    layerForward (index, isRight) {
      this.$log('layerForward', index, isRight)
      let t = this.layer.figuresAbsolute[index].t + (isRight ? 0.1 : -0.1)
      this.layer.figuresAbsolute[index].t = t
      this.storePlayer.playPause()
      this.storePlayer.setCurrentTime(t)
    }
  },
  mounted () {
    this.$log('mounted')
  }
}
</script>
