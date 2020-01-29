<template lang="pug">
div(
  :style=`{height: '28px'}`).row.full-width.q-px-md
  //- progress width
  div(
    v-show="!mini"
    :style=`{position: 'relative', height: '28px'}` @click="progressClick").row.full-width.cursor-pointer
    div(:style=`{position: 'absolute', top: '10px', height: '7px', pointerEvents: 'none', background: 'rgba(255,255,255,0.8)',
      borderRadius: '4px', overflow: 'hidden'}`).row.full-width
    //- progress bar
    div(:style=`{position: 'absolute', top: '10px', height: '7px', width: (now/player.duration)*100+'%', pointerEvents: 'none', borderRadius: '4px', overflow: 'hidden'}`
      ).row.bg-green.q-px-xs
  //- progress now/duration
  small(
    v-show="!mini"
    :style=`{position: 'absolute', zIndex: 105, top: '-10px', borderRadius: '4px', background: 'rgba(0,0,0,0.4)'}`
    ).q-px-sm.text-white {{ $time(now) }} / {{ $time(player.duration) }}
</template>

<script>
export default {
  name: 'nodeFragmentVideoProgress',
  props: ['ctx', 'fragment', 'now', 'player', 'mini'],
  data () {
    return {
    }
  },
  methods: {
    progressClick (e) {
      this.$log('progressClick', this.player.duration)
      let w = e.target.clientWidth
      let x = e.offsetX
      let now = (this.player.duration * x) / w
      this.$log('w,x,now', w, x, now)
      this.player.setCurrentTime(now)
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
