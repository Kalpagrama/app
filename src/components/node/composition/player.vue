<template lang="pug">
div(:style=`{position: 'absolute', bottom: 'calc(50% + 50px)', zIndex: 1000, color: 'white', height: '50px'}`).row.full-width.bg-green.br
  small(@click="modeClick()").full-width mode: {{ mode }}
</template>

<script>
// on mode play, and watch we ignore the layerIndex
// play one layer,  play all the layers,
// just watch
// video progress may be here, video controller is it u?

export default {
  name: 'compositionPlayer',
  props: ['ctx', 'mode', 'player', 'meta', 'active', 'visible', 'mini', 'layers'],
  data () {
    return {
      // mode: 'play',
      // modes: ['play', 'watch', 'layer'],
      layerIndex: 0
    }
  },
  computed: {
    layer () {
      if (this.layers[this.layerIndex]) return this.layers[this.layerIndex]
      else return null
    },
    layerStart () {
      if (this.mode === 'watch') return false
      else {
        if (this.ctx === 'workspace' || this.ctx === 'editor') return this.layer.figuresAbsolute[0] ? this.layer.figuresAbsolute[0].t : false
        else return this.layer.figuresRelative[0] ? this.layer.figuresRelative[0].t : false
      }
    },
    layerEnd () {
      if (this.mode === 'watch') return false
      else {
        if (this.ctx === 'workspace' || this.ctx === 'editor') return this.layer.figuresAbsolute[1] ? this.layer.figuresAbsolute[1].t : false
        else return this.layer.figuresRelative[1] ? this.layer.figuresRelative[1].t : false
      }
    }
  },
  watch: {
    mini: {
      handler (to, from) {
        this.$log('mini CHANGED', to)
        if (to && this.visible && this.active) {
          this.player.play()
        }
        else {
          this.player.play()
        }
      }
    },
    visible: {
      handler (to, from) {
        this.$log('visible CHANGED', to)
        if (to) {
          // go to start
          let start = 0
          this.player.setCurrentTime(start)
        }
        else {
          this.player.pause()
          // this.player.remove()
        }
      }
    },
    active: {
      handler (to, from) {
        this.$log('active CHANGED', to)
        if (to) {
          this.player.play()
        }
        else {
          this.player.pause()
        }
      }
    },
    'meta.now': {
      handler (to, from) {
        // this.$log('meta.now CHANGED', to)
        // play all the layers of composition, in case it is videos maybe of different contents
        if (this.mode === 'play') {
          if (to >= this.layerEnd) {
            this.player.setCurrentTime(this.layerStart)
          }
          if (to < this.layerStart) {
            this.player.setCurrentTime(this.layerStart + 0.01)
          }
        }
        // just watch the content, dont show the layers shit...
        else if (this.mode === 'watch') {
          // this.player.setCurrentTime(0)
        }
        // play layer only one,
        // where we take the current layer?
        // spin watch?
        else if (this.mode === 'layer') {
          // TODO required layerIndex & layer to loop this layer...
          if (to >= this.layerEnd) {
            this.player.setCurrentTime(this.layerStart)
          }
          if (to < this.layerStart) {
            this.player.setCurrentTime(this.layerStart + 0.01)
            let layerNext = this.layerIndex + 1
            if (this.layers[layerNext]) {
              this.layerIndex = layerNext
            }
            else {
              this.layerIndex = 0
            }
          }
        }
      }
    }
  },
  methods: {
    modeClick () {
      this.$log('modeClick')
      if (this.mode === 'play') this.mode = 'watch'
      else this.mode = 'play'
    },
    layerEnded () {
      // this.$log('*** layerEnded')
      // this.$log('NOW => ', this.layerIndex)
      if (this.mini) return
      if (this.layerIndexPlay >= 0) {
        // this.$log('LAYER PLAY')
        this.$q.notify('layerIndexPlay' + this.layerIndexPlay)
        this.layerIndex = this.layerIndexPlay
      } else {
        // this.$log('LAYER DEFAULT')
        // move to the next layer, this composition player
        let layerTo = this.layerIndex + 1
        if (this.layers[layerTo]) {
          // this.$q.notify('NEXT layer next =>' + layerTo)
          // this.$log('NEXT => ', layerTo)
          this.$set(this, 'layerIndex', layerTo)
          // this.layerIndex = layerTo
        }
        else {
          // this.$log('LAST => 0')
          // TODO depend on mode, play first one or play next composition
          this.$emit('ended')
          // this.$set(this, 'layerIndex', 0)
        }
      }
    }
  }
}
</script>
