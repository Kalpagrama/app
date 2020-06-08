<template lang="pug">
div(
  v-if="!mini"
  :style=`{
    position: 'absolute', zIndex: 10000, left: '16px', bottom: '58px',
    borderRadius: '10px', overflow: 'hidden',
    background: 'rgba(0,0,0,0.3)',
  }`
  ).row.items-center.content-center.q-px-sm.q-py-xs
  //- kalpa-debug(:options=`{layerIndex: statePlayer.layerIndex,isFirst: statePlayer.layerIsFirst,isLast:statePlayer.layerIsLast}`)
  //- kalpa-debug(:options=`{active}`)
  q-btn(
    v-if="!statePlayer.layerIsFirst"
    @click="layerPrev()"
    round flat dense color="white" icon="keyboard_arrow_left").q-mr-sm
  span(:style=`{userSelect: 'none'}`).text-white {{ layerName }}
  q-btn(
    v-if="!statePlayer.layerIsLast"
    @click="layerNext()"
    round flat dense color="white" icon="keyboard_arrow_right").q-ml-sm
</template>

<script>
export default {
  name: 'videoController',
  props: ['ctx', 'visible', 'active', 'mini', 'player', 'statePlayer'],
  data () {
    return {
    }
  },
  computed: {
    layerName () {
      if (this.statePlayer.layer && this.statePlayer.layer.spheres.length > 0) {
        return this.statePlayer.layer.spheres[0].name
      }
      else {
        return 'Unnamed layer'
      }
    }
  },
  watch: {
    active: {
      handler (to, from) {
        this.$log('active CHANGED', to)
        alert('videoController active CHANGED: ' + to)
        if (to) {
          this.player.play()
        }
        else {
          this.player.pause()
        }
      }
    },
    'statePlayer.layerId': {
      handler (to, from) {
        this.$log('statePlayer.layerId CHANGED', to)
        if (to !== undefined) {
          this.player.setCurrentTime(this.statePlayer.layerStart)
          this.player.play()
        }
      }
    },
    'statePlayer.mode': {
      handler (to, from) {
        this.$log('statePlayer.mode CHANGED', to)
        if (to === 'layer') {
          // do noting?
        }
        else if (to === 'composition') {
          if (this.ctx === 'workspace') this.statePlayer.set('mode', 'content')
          this.statePlayer.set('layerId', this.statePlayer.layers[0].id)
        }
        else if (to === 'content') {
          // do nothing?
        }
      }
    },
    'statePlayer.now': {
      handler (to, from) {
        // if (this.timeupdateStop) return
        // LAYER
        if (this.statePlayer.mode === 'layer') {
          if (to > this.statePlayer.layerEnd) {
            this.player.setCurrentTime(this.statePlayer.layerStart)
          }
          if (to < this.statePlayer.layerStart) {
            this.player.setCurrentTime(this.statePlayer.layerStart)
          }
        }
        // COMPOSITION
        else if (this.statePlayer.mode === 'composition') {
          if (to > this.statePlayer.layerEnd) {
            this.layerNext()
            // this.player.pause()
            // find next layer or go to first one
            // let layerIndex = this.statePlayer.layers.findIndex(layer => layer.id === this.statePlayer.layerId)
            // this.$log('layerIndex', layerIndex)
            // let layerIndexNext = layerIndex + 1
            // if (this.statePlayer.layers[layerIndexNext]) {
            //   // alert('layer END next')
            //   // this.statePlayer.layerId = this.layers[layerIndexNext].id
            //   this.player.statePlayer(['layerId', this.statePlayer.layers[layerIndexNext].id])
            // }
            // else {
            //   // alert('layer END, again')
            //   this.player.statePlayer(['layerId', this.statePlayer.layers[0].id])
            //   // this.statePlayer.layerId = this.layers[0].id
            //   // this.$emit('ended')
            // }
          }
          if (to < this.statePlayer.layerStart) {
            // alert('to <= this.statePlayer.layerStart')
            // this.player.pause()
            this.player.setCurrentTime(this.statePlayer.layerStart)
          }
        }
        // CONTENT
        else if (this.statePlayer.mode === 'content') {
          // do nothing?
        }
      }
    }
  },
  methods: {
    layerPrev () {
      this.$log('layerPrev')
      if (this.statePlayer.layerIsFirst) return
      let i = this.statePlayer.layerIndex - 1
      let id = this.statePlayer.layers[i].id
      this.statePlayer.set('layerId', id)
    },
    layerNext () {
      this.$log('layerNext')
      if (this.statePlayer.layerIsLast) {
        let i = 0
        let id = this.statePlayer.layers[0].id
        this.statePlayer.set('layerId', id)
      }
      else {
        let i = this.statePlayer.layerIndex + 1
        let id = this.statePlayer.layers[i].id
        this.statePlayer.set('layerId', id)
      }
    }
  }
}
</script>
