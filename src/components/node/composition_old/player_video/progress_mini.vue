<template lang="pug">
.row.full-width
  div(
    @mouseenter="mouseIsOver = true" @mouseleave="mouseIsOver = false"
    @click="progressClick"
    :class=`{
      'bg-black': ctx === 'workspace' && !mouseIsOver,
      'bg-grey-10': ctx === 'workspace' && mouseIsOver,
    }`
    :style=`{position: 'relative', height: '16px', borderRadius: '10px', overflow: 'hidden'}`
    ).row.full-width.cursor-pointer
    div(
      :style=`{
        position: 'absolute', bottom: '0px', zIndex: 30000, left: '0px',
        width: progressWidth,
        height: progressHeight+'px',
        borderRadius: progressHeight/2+'px',
        overflow: 'hidden',
        pointerEvents: 'none'
      }`
    ).bg-green
    //- span(
    //-   :style=`{
    //-     position: 'absolute', zIndex: 30001,
    //-     left: '0px'
    //-   }`
    //-   ).text-white {{ 'now' }}
</template>

<script>
export default {
  name: 'playerVideo-progressMini',
  props: ['ctx', 'player', 'meta', 'start', 'end'],
  data () {
    return {
      mouseIsOver: false,
      progressPanning: false,
      progressHeight: 4,
      progressHeightMini: 4,
      progressHeightMaxi: 16
    }
  },
  computed: {
    duration () {
      if (this.ctx === 'list') {
        return this.end - this.start
      }
      else {
        return this.meta.duration
      }
    },
    now () {
      if (this.ctx === 'list') {
        return this.meta.now - this.start
      }
      else {
        return this.meta.now
      }
    },
    progressWidth () {
      if (this.progressPanning) {
        return this.progressDelta + 'px'
      }
      else {
        let to = (this.now / this.duration) * 100
        if (to > 100) to = 100
        return to + '%'
      }
    }
  },
  watch: {
    mouseIsOver: {
      handler (to, from) {
        // this.$log('mouseIsOver CHANGED', to)
        this.$tween.to(this, 0.2, {progressHeight: to ? this.progressHeightMaxi : this.progressHeightMini})
      }
    }
  },
  methods: {
    progressClick (e) {
      this.$log('progressClick', e.offsetX)
      let width = e.target.clientWidth
      let left = e.offsetX
      let t = (this.duration * left) / width
      if (this.ctx === 'list') t += this.start
      // if (this.ctx !== 'list') {
      //   this.$emit('meta', ['mode', 'watch'])
      // }
      this.player.setCurrentTime(t)
      this.player.update(t)
      // this.$emit('meta', ['videoUpdate', t])
    }
  }
}
</script>
