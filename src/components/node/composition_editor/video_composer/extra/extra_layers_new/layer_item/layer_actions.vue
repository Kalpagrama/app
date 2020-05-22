<template lang="pug">
div(
  :style=`{height: '70px'}`).row.full-width.items-center.content-center.q-px-sm.br
  q-btn(round flat color="white" icon="play_arrow" @click="layerPlay()").b-110.q-mr-sm
  q-btn(round flat color="white" icon="refresh" @click="layerPlayAgain()").b-110
  .col
  q-btn(round flat color="white" icon="keyboard_arrow_up" @click="layerClose()").b-110
</template>

<script>
export default {
  name: 'layerItem-actions',
  props: ['player', 'meta', 'layer'],
  data () {
    return {
    }
  },
  methods: {
    layerClose () {
      this.$log('layerClose')
      // this.$tween.to(this, 0.5, {height: this.heightNormal})
      this.$emit('meta', ['mode', 'watch'])
      this.$emit('meta', ['layerIndexPlay', -1])
    },
    layerPlay () {
      this.$log('layerPlay')
      this.player.pause()
      this.$emit('meta', ['mode', 'layer'])
      this.$emit('meta', ['layerIndex', this.layerIndex])
      this.$emit('meta', ['layerIndexPlay', this.layerIndex])
      this.player.setCurrentTime(this.layer.figuresAbsolute[0].t)
      this.player.update(this.layer.figuresAbsolute[0].t)
      this.player.play()
    },
    layerPlayAgain () {
      this.$log('layerPlayAgain')
      this.layerPlay()
    },
  }
}
</script>
