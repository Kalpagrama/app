<style lang="sass" scoped>
.layer
  cursor: pointer
  &:hover
    background: rgb(100,100,100)
</style>

<template lang="pug">
div(
  :class=`{
    'b-80': stateExplorer.layerSelected === layer.id,
    'b-70': stateExplorer.layerSelected !== layer.id,
  }`
  :style=`{
    position: 'relative',
    minHeight: '40px',
    borderRadius: '10px',
    overflow: 'hidden'
  }`
  ).row.full-width.items-between.content-between
  //- header
  div(
    :class=`{
      'b-90': stateExplorer.layerSelected === layer.id,
      'b-70': stateExplorer.layerSelected !== layer.id,
    }`
    :style=`{
      position: 'relative',
      height: '40px',
      borderRadius: '10px',
      overflow: 'hidden'
    }`).row.full-width.q-pl-md.layer
    //- progress tint
    div(
      v-if="stateExplorer.layerSelected === layer.id"
      @click="progressClick"
      v-touch-pan.mouse.left.right="progressDrag"
      :style=`{
        position: 'absolute', zIndex: 100,
        left: 0, top: 0, bottom: 0, right: 0,
      }`
      ).row.fit
      //- progress width
      div(
        v-if="stateExplorer.currentTime >= layerStart && stateExplorer.currentTime <= layerEnd"
        :style=`{
          position: 'absolute', zIndex: 200,
          left: '0px',
          width: progressPercentRaw ? progressPercentRaw+'%' : ((stateExplorer.currentTime-layerStart)/layerDuration)*100+'%',
          pointerEvents: 'none',
          borderRadius: '10px',
          overflow: 'hidden',
          opacity: 0.5
        }`
        ).row.full-height.bg-white
    //- layer name
    div(
      @click="layerClick"
      ).col.q-py-sm
      span(:style=`{userSelect: 'none'}`).text-white {{ layerName }}
  //- tools on layerSelected
  div(
    v-if="stateExplorer.layerSelected === layer.id"
    ).row.full-width.items-center.content-center.q-pa-xs
    q-btn(round flat dense color="white" icon="edit" @click="layerEdit()")
    .col
    q-btn(round flat dense color="white" icon="refresh" @click="layerRefresh()")
    q-btn(round flat dense color="green" icon="check" @click="stateExplorer.set('layerSelected', null)")
</template>

<script>
export default {
  name: 'metaLayers-layerItem',
  props: ['stateExplorer', 'layer', 'layerIndex'],
  data () {
    return {
      progressPercentRaw: null
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
  },
  watch: {
  },
  methods: {
    progressClick (e) {
      this.$log('progressClick', e)
      let width = e.target.clientWidth
      let left = e.offsetX
      let t = ((this.layerDuration * left) / width) + this.layerStart
      this.$log('t', t)
      this.stateExplorer.player.setCurrentTime(t)
      this.stateExplorer.set('currentTime', t)
      // tween to
      let tPercentNow = ((this.stateExplorer.currentTime - this.layerStart) / this.layerDuration) * 100
      let tPercentNext = ((t - this.layerStart) / this.layerDuration) * 100
      this.progressPercentRaw = tPercentNow
      this.$tween.to(this, 0.1, {
        progressPercentRaw: tPercentNext,
        onComplete: () => {
          this.progressPercentRaw = null
          this.stateExplorer.set('currentTime', t)
        }
      })
    },
    progressDrag (e) {
      this.$log('progressDrag', e)
      let width = this.$el.clientWidth
      this.$log('width', width)
      if (e.isFirst) {
        let left = e.evt.layerX || e.position.left
        // this.stateExplorer.player.pause()
        // this.progressPercentRaw = ((this.stateExplorer.currentTime - this.layerStart) / this.layerDuration) * 100
        this.progressPercentRaw = (left / width) * 100
      }
      if (e.isFinal) {
        // this.$tween.to(this, 0.3, {barHeight: this.barHeightMin})
        // if (this.statePlayer.playing)
        this.progressPercentRaw = null
        // this.stateExplorer.player.play()
      }
      if (!this.progressPercentRaw) return
      this.progressPercentRaw += (e.delta.x / width) * 100
      let t = this.layerStart + (this.progressPercentRaw / 100) * this.layerDuration
      // this.$log('t', t)
      if (t < this.layerStart || t > this.layerEnd) return
      if (t > 0) {
        this.stateExplorer.player.setCurrentTime(t)
        this.stateExplorer.set('currentTime', t)
      }
    },
    layerEdit () {
      this.$log('layerEdit')
      this.stateExplorer.set('layerSelected', this.layer.id)
      this.stateExplorer.set('layerEditing', this.layer.id)
    },
    layerRefresh () {
      this.$log('layerRefresh')
      this.stateExplorer.player.setCurrentTime(this.layerStart)
      this.stateExplorer.set('currentTime', this.layerStart)
      this.stateExplorer.player.play()
    },
    layerClick () {
      this.$log('layerClick')
      this.stateExplorer.set('layerSelected', this.layer.id)
      this.stateExplorer.player.setCurrentTime(this.layerStart)
      this.stateExplorer.set('currentTime', this.layerStart)
      this.stateExplorer.player.play()
    }
  }
}
</script>
