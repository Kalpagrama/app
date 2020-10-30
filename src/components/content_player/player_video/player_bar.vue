<template lang="pug">
div(
  @click="barClick"
  @mousemove="barMousemove"
  @mouseleave="barMouseleave"
  @mouseenter="barMouseenter"
  v-touch-pan.left.right.prevent.mouse="barPan"
  :style=`{
    position: 'relative', height: '20px', borderRadius: '10px',
  }`).row.full-width.b-50
  //- contentNodes, we need nodes with first item of this content!
  //- with t, content type video
  div(
    v-if="$store.state.ui.contentNodes"
    :style=`{
      position: 'absolute', zIndex: 9999,
      pointerEvents: 'none',
    }`
    ).row.fit
    div(
      v-for="(f,fi) in $store.state.ui.contentNodes" :key="fi"
      v-if="f.items[0].layers[0].figuresAbsolute[0].t && f.items[0].layers[0].figuresAbsolute[1].t"
      :style=`{
        position: 'absolute', zIndex: 9999,
        top: '0px',
        left: f.items[0].layers[0].figuresAbsolute[0].t/player.duration*100+'%',
        //- width: ((f.items[0].layers[0].figuresAbsolute[1].t-f.items[0].layers[0].figuresAbsolute[0].t)/player.duration)*100+'%',
        width: '2px',
        height: 'calc(100% + 0px)',
        //- border: '2px solid #4caf50',
        borderRadius: '4px',
        pointerEvents: 'none',
        background: 'rgba(255,255,255,0.7)',
      }`
      ).row
      //- TODO: add hover effect on contentNodes...
      //- q-tooltip
        small.text-white.text-bold {{ f.name }}
  //- currentTime width/line
  div(
    :style=`{
      position: 'absolute', zIndex: 200, left: '0px', top: '0px',
      width: (player.currentTime/player.duration)*100+'%',
      pointerEvents: 'none',
      borderRadius: '10px 0 0 10px',
    }`
    ).row.full-height.b-80
    div(
      :style=`{
        position: 'absolute', zIndex: 200, right: '-2px', top: '-4px',
        height: 'calc(100% + 8px)',
        width: '4px', borderRadius: '2px', overflow: 'hidden',
        pointerEvents: 'none',
      }`
      ).row.bg-red
  //- currentTimeMove line
  div(
    v-if="currentTimeMove"
    :style=`{
      position: 'absolute', zIndex: 200, top: '-4px',
      left: 'calc('+(currentTimeMove/player.duration)*100+'% - 2px)',
      height: 'calc(100% + 8px)',
      width: '4px', borderRadius: '2px', overflow: 'hidden',
      pointerEvents: 'none',
      opacity: 0.9,
    }`
    ).row.bg-red
  //- label currentTime moving
  div(
    v-if="currentTimeMove"
    :style=`{
      position: 'absolute', zIndex: 9999, top: '-40px',
      left: 'calc('+(currentTimeMove/player.duration)*100+'% - 2px)',
      borderRadius: '10px 10px 10px 0', overflow: 'hidden',
      pointerEvents: 'none',
      opacity: 0.9,
    }`
    ).row.text-white.q-pa-sm.bg-red {{ $time(currentTimeMove) }}
  //- currentTimePecent panning line
  div(
    v-if="panning"
    :style=`{
      position: 'absolute', zIndex: 200, top: '-4px',
      left: 'calc('+currentTimePercent+'% - 2px)',
      height: 'calc(100% + 8px)',
      width: '4px', borderRadius: '2px', overflow: 'hidden',
      pointerEvents: 'none',
      opacity: 0.9,
    }`
    ).row.bg-red
  //- label panning time
  div(
    v-if="panning"
    :style=`{
      position: 'absolute', zIndex: 9999, top: '-40px',
      left: 'calc('+currentTimePercent+'% - 2px)',
      borderRadius: '10px 10px 10px 0', overflow: 'hidden',
      pointerEvents: 'none',
      opacity: 0.9,
    }`
    ).row.text-white.q-pa-sm.bg-red {{ $time(currentTimePercent/100*player.duration) }}
</template>

<script>
export default {
  name: 'playerBar',
  props: ['player'],
  data () {
    return {
      panning: false,
      currentTimeMove: 0,
      currentTimePercent: null,
      currentTimePanned: 0,
    }
  },
  methods: {
    barClick (e) {
      // this.$log('barClick', e)
      let left = e.layerX
      let width = e.target.clientWidth
      if (left > width) return
      // this.$log('left/width', left, width)
      let t = (left / width) * this.player.duration
      this.$log('t', this.$time(t))
      this.player.events.emit('bar-click', {t: t})
      this.player.setCurrentTime(t)
      this.$wait(400).then(() => {
        this.currentTimeMove = null
      })
    },
    barMouseenter (e) {
      // this.$log('barMouseenter', e)
    },
    barMouseleave (e) {
      // this.$log('barMouseleave', e)
      this.currentTimeMove = null
    },
    barMousemove (e) {
      // this.$log('barMousemove', e)
      let left = e.layerX
      let width = e.target.clientWidth
      // this.$log('left/width', left, width)
      let t = (left / width) * this.player.duration
      this.currentTimeMove = t
    },
    barPan (e) {
      // this.$log('barPan', e)
      if (e.isFirst) {
        this.panning = true
        // this.player.pause()
        let left = e.position.left - this.$el.getBoundingClientRect().left
        this.currentTimePercent = (left / this.$el.clientWidth) * 100
        this.currentTimeMove = null
      }
      if (e.isFinal) {
        this.currentTimePercent = null
        this.currentTimeMove = null
        if (this.currentTimePanned) this.player.setCurrentTime(this.currentTimePanned)
        this.panning = false
      }
      if (!this.currentTimePercent) return
      this.currentTimePercent += (e.delta.x / this.$el.clientWidth) * 100
      let t = (this.currentTimePercent / 100) * this.player.duration
      if (t > 0 && t < this.player.duration) {
        this.currentTimePanned = t
        this.player.setCurrentTime(t)
      }
    }
  }
}
</script>
