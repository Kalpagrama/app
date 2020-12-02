<template lang="pug">
div(
  @click="barClick"
  @mousemove="barMousemove"
  @mouseleave="barMouseleave"
  @mouseenter="barMouseenter"
  v-touch-pan.left.right.prevent.mouse="barPan"
  accessKey="bar-body"
  :style=`{
    position: 'relative', height: '20px', borderRadius: '10px',
  }`).row.full-width.b-50
  slot(name="bar")
  slot(name="bar-current-time" :panning="panning")
  //- volume
  q-btn(
    round flat dense :color="color"
    :style=`{
      position: 'absolute', left: '-40px', top: '-8px', zIndex: 300,
    }`)
    q-icon(
      :name="player.mutedLocal ? 'volume_off' : 'volume_up'"
      :color="player.mutedLocal ? 'red' : color"
      size="20px" @click="player.volumeToggle()")
  //- currentTime/duration
  small(
    :style=`{
      position: 'absolute', zIndex: 300,
      pointerEvents: 'none', left: '8px', top: '2px',
    }`
    ).text-grey-4 {{$time(player.currentTime)}} / {{$time(player.duration)}}
  //- currentTime width/line
  div(
    :style=`{
      position: 'absolute', zIndex: 200, left: '0px', top: '0px',
      width: (player.currentTime/player.duration)*100+'%',
      pointerEvents: 'none',
      borderRadius: '10px 0 0 10px',
    }`
    ).row.full-height.b-80
    //- div(
      :style=`{
        position: 'absolute', zIndex: 2200, right: '-2px', top: '-4px',
        height: 'calc(100% + 8px)',
        width: '4px', borderRadius: '2px', overflow: 'hidden',
        pointerEvents: 'none',
      }`
      ).row.bg-red
  //- currentTime line
  div(
    :style=`{
      position: 'absolute', zIndex: 2100, left: '0px', top: '-4px',
      left: 'calc('+(player.currentTime/player.duration)*100+'% - 2px)',
      width: '4px', borderRadius: '2px', overflow: 'hidden',
      height: 'calc(100% + 8px)',
      pointerEvents: 'none',
    }`
    ).row.bg-red
  //- onMoving over line currentTime
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
  //- onMoving over rect label
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
  //- onPanning line currentTime
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
  //- onPanning rect label
  div(
    v-if="panning"
    :style=`{
      position: 'absolute', zIndex: 9999, top: '-40px',
      left: 'calc('+currentTimePercent+'% - 2px)',
      borderRadius: '10px 10px 10px 0', overflow: 'hidden',
      pointerEvents: 'none',
      userSelect: 'none',
      opacity: 0.9,
    }`
    ).row.text-white.q-pa-sm.bg-red {{ $time(currentTimePercent/100*player.duration) }}
  //- template(v-slot:bar)
    div(
      v-if="player && figures.length > 0"
      :style=`{
        position: 'absolute', zIndex: 2050, pointerEvents: 'none',
        //- borderRadius: '10px', overflow: 'hidden',
      }`
      ).row.fit
      template(v-for="(f,fi) in figures")
        div(
          v-if="f.length === 1"
          :key="fi"
          :style=`{
            position: 'absolute', zIndex: 2050, top: '0px',
            left: f[0].t/player.duration*100+'%',
            width: '2px',
            background: 'rgba(255,255,255, 0.5)',
          }`
          ).row.full-height
        div(
          v-if="f.length === 2"
          :key="fi"
          :style=`{
            position: 'absolute', zIndex: 2050, top: '-2px',
            left: f[0].t/player.duration*100+'%',
            width: (f[1].t-f[0].t)/player.duration*100+'%',
            height: 'calc(100% + 4px)',
            border: '2px solid rgb(76,175,80)',
            borderRadius: '4px',
            background: 'rgba(255,255,255,0.2)',
            pointerEvents: 'none',
          }`
          ).row
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
      this.$log('barClick accessKey', e.target.accessKey)
      if (e.target.accessKey !== 'bar-body') return
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
      this.$log('barMousemove accessKey', e.target.accessKey)
      if (e.target.accessKey !== 'bar-body') return
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
