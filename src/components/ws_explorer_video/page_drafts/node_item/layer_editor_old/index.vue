<template lang="pug">
.row.full-width
  //- frames: mini editing...
  div(:style=`{position: 'relative', overflow: 'hidden',}`).row.full-width
    transition(appear enter-active-class="animated slideInDown")
      div(v-if="storeEditor.layerEditing === layer.id").row.full-width
        layer-frames(:layer="layer" :storePlayer="storePlayer" :storeLayerEditor="storeLayerEditor" :storeEditor="storeEditor")
        //- editing
        div(:style=`{opacity: editing ? 1 : 1}`).row.full-width
          div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).row.full-width.b-70
            div(
              :class=`{
                'bg-green': storeEditor.layerPlaying === layer.id,
                'b-80': storeEditor.layerPlaying !== layer.id,
              }`
              :style=`{borderRadius: '10px', overflow: 'hidden'}`).row.full-width.items-center.content-center.q-px-xs
              q-btn(
                @click="layerPlay()"
                round flat dense
                :icon="storePlayer.playing ? 'pause' : 'play_arrow'"
                :color="storePlayer.playing ? 'red' : 'white'")
              .col.q-px-xs
                layer-progress(:layer="layer" :storePlayer="storePlayer" :storeLayerEditor="storeLayerEditor" :storeEditor="storeEditor")
              q-btn(
                @click="layerRefresh()"
                round flat dense icon="refresh"
                :color="loop ? 'white' : 'grey-8'")
            div().row.full-width
              div(:style=`{paddingLeft: '40px', paddingRight: '40px'}`).row.full-width
                q-btn(round flat dense color="grey-6" icon="flip" @click="layerSet(0)").q-mr-xs.rotate-180
                q-btn(round flat dense color="grey-6" icon="keyboard_arrow_left" @click="layerForward(0,0)")
                q-btn(round flat dense color="grey-6" icon="keyboard_arrow_right" @click="layerForward(0,1)")
                .col
                q-btn(round flat dense color="grey-6" icon="keyboard_arrow_left" @click="layerForward(1,0)")
                q-btn(round flat dense color="grey-6" icon="keyboard_arrow_right" @click="layerForward(1,1)")
                q-btn(round flat dense color="grey-6" icon="flip" @click="layerSet(1)")
  //- div(
    :style=`{
      position: 'relative', borderRadius: '10px', overflow: 'hidden', order: -1,
    }`).row.full-width.justify-center
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
  props: ['player', 'layer'],
  data () {
    return {
      // watcherCurrentTime: null,
      // progressPercentRaw: null,
      // need_framesLayerCenter: false,
      // editing: false,
      // seekTimeout: null,
      // startForwardTimeout: null,
      // endForwardTimeout: null,
      // loop: true,
    }
  },
  computed: {
    layerStart () {
      return this.layer.figuresAbsolute[0].t
    },
    layerEnd () {
      return this.layer.figuresAbsolute[1].t
    },
    layerDuration () {
      return this.layerEnd - this.layerStart
    },
    // layerProgressMiniShow () {
    //   if (this.storeEditor.compositionPlaying) {
    //     return this.layerIndex === this.storeEditor.layerActive
    //   }
    //   else {
    //     return this.storeEditor.layerPlaying === this.layer.id && !this.storeEditor.layerEditing
    //   }
    // },
    // storeLayerEditor () {
    //   return {
    //     layerDuration: this.layerDuration,
    //     layerStart: this.layerStart,
    //     layerEnd: this.layerEnd,
    //     // fn
    //     need_framesLayerCenter: this.need_framesLayerCenter,
    //     set: (key, val) => {
    //       this[key] = val
    //     }
    //   }
    // }
  },
  watch: {
    'storePlayer.focused': {
      handler (to, from) {
        this.$log('storePlayer.focused TO', to)
        // this.storeEditor.layerPlaying = null
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
            if (to > this.layerEnd || to < this.layerStart) {
              if (this.seekTimeout) {
                clearTimeout(this.seekTimeout)
                this.seekTimeout = null
              }
              else {
                // this.$q.notify('OUTSIDE=' + this.layerStart)
                if (to > this.layerEnd) {
                  if (this.loop) this.storePlayer.setCurrentTime(this.layerStart)
                  else {
                    this.storePlayer.pause()
                    this.loop = true
                  }
                }
                else {
                  this.storePlayer.setCurrentTime(this.layerStart)
                }
              }
              this.seekTimeout = setTimeout(() => {
                clearTimeout(this.seekTimeout)
                this.seekTimeout = null
              }, 1000)
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
    layerPlay () {
      this.$log('layerPlay')
      // this.loop = true
      // this.player.layerPlaying = this.layer.id
      // this.player.playPause()
      this.player.play()
    },
    layerRefresh () {
      this.$log('layerRefresh')
      // this.loop = true
      // this.player.layerPlaying = this.layer.id
      // this.$q.notify('REFRESH===' + this.layerStart)
      this.player.setCurrentTime(this.layerStart)
      this.player.play()
      // this.storeLayerEditor.set('need_framesLayerCenter', true)
    },
    layerSet (index) {
      this.$log('layerSet', index)
      // this.loop = true
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
      // this.storeLayerEditor.set('need_framesLayerCenter', true)
      // this.storeEditor.layerPlaying = this.layer.id
    },
    async layerForward (index, isRight) {
      this.$log('layerForward', index, isRight)
      // play this layer anyway
      this.player.pause()
      // this.storeEditor.layerPlaying = this.layer.id
      // t
      let t = this.layer.figuresAbsolute[index].t + (isRight ? 0.1 : -0.1)
      this.layer.figuresAbsolute[index].t = t
      this.player.setCurrentTime(t)
      // start: play after editing
      if (index === 0) {
        if (this.startForwardTimeout) {
          clearTimeout(this.startForwardTimeout)
          this.startForwardTimeout = null
        }
        this.startForwardTimeout = setTimeout(async () => {
          this.player.play()
        }, 1000)
      }
      // end: go 1.5 sec before start, prevent loop, stop at the end,
      if (index === 1) {
        if (this.endForwardTimeout) {
          clearTimeout(this.endForwardTimeout)
          this.endForwardTimeout = null
        }
        this.endForwardTimeout = setTimeout(async () => {
          this.loop = false
          this.storePlayer.setCurrentTime(t - 1.5)
          this.storePlayer.play()
        }, 1000)
      }
    },
  }
}
</script>
