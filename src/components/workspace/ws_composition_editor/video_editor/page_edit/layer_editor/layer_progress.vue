<template lang="pug">
div(:style=`{position: 'relative',}`).row.full-width
  //- tools
  div(:style=`{}`).row.full-width
    q-btn(round flat dense color="white" icon="play_arrow")
    .col
    q-btn(round flat dense color="white" icon="refresh")
  //- bar
  div(:style=`{position: 'relative'}`).row.full-width.q-py-xs
    div(
      @click="progressClick"
      v-touch-pan.mouse.left.right="progressDrag"
      :style=`{
        position: 'relative',
        height: '40px', borderRadius: '10px', overflow: 'hidden'
      }`).row.full-width.b-70
      //- bar: left
      div(
        :style=`{
          position: 'absolute', zIndex: 1100,
          left: '0px',
          width: progressPercentRaw ? progressPercentRaw+'%' : (storePlayer.currentTime-storeLayerEditor.layerStart)/storeLayerEditor.layerDuration*100+'%',
          pointerEvents: 'none',
        }`).row.full-height.b-90
    //- bar: currentTime
    div(
      :style=`{
        position: 'absolute', zIndex: 1200,
        left: (storePlayer.currentTime-storeLayerEditor.layerStart)/storeLayerEditor.layerDuration*100+'%',
        top: '0px',
        height: 'calc(100%)',
        width: '4px', borderRadius: '2px',
        pointerEvents: 'none',
      }`).row.bg-green
</template>

<script>
export default {
  name: 'layerProgress',
  props: ['storePlayer', 'storeLayerEditor', 'storeEditor'],
  data () {
    return {
      progressPercentRaw: null,
    }
  },
  methods: {
    progressClick (e) {
      // this.$log('progressClick', e)
      let width = e.target.clientWidth
      let left = e.offsetX
      let t = ((this.storeLayerEditor.layerDuration * left) / width) + this.storeLayerEditor.layerStart
      this.$log('t', t)
      this.storePlayer.setCurrentTime(t)
      // tween to
      let tPercentNow = ((this.storePlayer.currentTime - this.storeLayerEditor.layerStart) / this.storeLayerEditor.layerDuration) * 100
      let tPercentNext = ((t - this.storeLayerEditor.layerStart) / this.storeLayerEditor.layerDuration) * 100
      this.progressPercentRaw = tPercentNow
      this.$tween.to(this, 0.1, {
        progressPercentRaw: tPercentNext,
        onComplete: () => {
          this.progressPercentRaw = null
          this.storePlayer.setCurrentTime(t)
        }
      })
    },
    progressDrag (e) {
      // this.$log('progressDrag', e)
      if (e.isFirst) {
        this.$log('progressDrag isFirst', e)
        this.storePlayer.player.pause()
        // this.progressPercentRaw = ((this.storePlayer.currentTime - this.storeLayerEditor.layerStart) / this.storeLayerEditor.layerDuration) * 100
        let left = e.position.left - this.$el.getBoundingClientRect().left
        this.progressPercentRaw = (left / this.$el.clientWidth) * 100
      }
      if (e.isFinal) {
        // this.$tween.to(this, 0.3, {barHeight: this.barHeightMin})
        // if (this.stateExplorer.playing)
        this.progressPercentRaw = null
        // this.storePlayer.player.play()
      }
      if (!this.progressPercentRaw) return
      this.progressPercentRaw += (e.delta.x / this.$el.clientWidth) * 100
      let t = this.storeLayerEditor.layerStart + (this.progressPercentRaw / 100) * this.storeLayerEditor.layerDuration
      // this.$log('t', t)
      if (t < this.storeLayerEditor.layerStart || t > this.storeLayerEditor.layerEnd) return
      if (t > 0) {
        this.storePlayer.setCurrentTime(t)
      }
    },
  }
}
</script>
