<template lang="pug">
div(
  @click.self="player.playing ? player.pause() : player.play()"
  :style=`{
    position: 'absolute', zIndex: 500,
  }`
  ).row.fit
  div(
    v-for="(t,ti) in 2" :key="ti"
    @click="tapClick(ti)"
    :style=`{
      position: 'absolute', zIndex: 1000, top: '0px', left: ti === 0 ? '0px' : '60%',
      width: '40%',
      borderRadius: '10px',
    }`
    ).row.full-height.items-center.content-center.justify-center.cursor-pointer
    q-btn(
      v-if="tapIndex === ti && tapCount > 1"
      flat color="white" no-caps
      :icon="ti === 0 ? 'fast_rewind' : 'null'"
      :icon-right="ti === 1 ? 'fast_forward' : 'null'"
      :style=`{
        userSelect: 'none !important',
        opacity: 0.8
      }`).fit
      span(
        :style=`{userSelect: 'none !important'}`
        ).text-white.text-bold {{ $time(5 * (tapCount - 1)) }}
</template>

<script>
export default {
  name: 'playerTaps',
  props: ['player'],
  data () {
    return {
      tapTimer: null,
      tapIndex: null,
      tapCount: 0,
    }
  },
  methods: {
    tapClick (index) {
      this.$log('tapClick', this.tapTimer)
      this.tapIndex = index
      this.tapCount += 1
      if (this.tapTimer) {
        this.$log('tapTimer restart')
        clearTimeout(this.tapTimer)
        // this.tapTimer = null
      }
      // ===
      // if more that one click in 200 we do the math
      // handle TWO and more clicks to stack T
      if (this.tapCount > 1) {
        this.$log('dbClick', this.tapCount)
        let t = this.player.currentTime
        let d = 5 * (this.tapCount - 1)
        this.$log('d', d)
        if (index === 0) t -= d
        else t += d
        // check borders
        if (t < 0) t = 0
        if (t > this.player.duration) t = this.player.duration
        // set currentTime
        this.player.setCurrentTime(t)
      }
      // ===
      // create timeout
      this.tapTimer = setTimeout(() => {
        this.$log('tapTimer timeout tapCount:', this.tapCount)
        // handle ONE click
        if (this.tapCount === 1) {
          this.$log('tapClick play/pause')
          if (this.player.playing) {
            this.$log('PAUSE')
            this.player.pause()
          }
          else {
            this.$log('PLAY')
            this.player.play()
          }
        }
        this.tapCount = 0
        this.tapTimer = null
        this.tapIndex = null
      }, 200)
    }
  }
}
</script>
