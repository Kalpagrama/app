<template lang="pug">
div(:style=`{position: 'relative'}`).row.full-width.items-center.content-center.justify-between.q-pa-xs
  //- play/pause
  q-btn(
    @click="player.playing ? player.pause() : player.play()"
    round flat dense
    :color="player.playing ? color : color"
    :icon="player.playing ? 'pause' : 'play_arrow'"
    :style=`{borderRadius: '50%', background: 'rgba(0,0,0,0.2)'}`)
  //- stats
  div(
    :style=`{
      position: 'absolute', left: '50%', marginRight: '-50%', transform: 'translate(-50%, 0)',
      background: 'rgba(0,0,0,0.5)', borderRadius: '10px', overflow: 'hidden',}`
    ).row.items-center.content-center
    q-btn(round flat dense :color="color" icon="fast_rewind" @click="backward()")
    q-btn(round flat dense :color="color")
      q-icon(
        :name="player.mutedLocal ? 'volume_off' : 'volume_up'"
        :color="player.mutedLocal ? 'red' : color"
        size="20px" @click="player.volumeToggle()")
    q-btn(
      flat dense :color="color")
      small.text-white {{$time(player.currentTime)}} / {{$time(player.duration)}}
    q-btn(
      v-if="$q.screen.width > 800"
      @click="player.fullscreenToggle()"
      round flat dense :color="color"
      :icon="player.isFullscreen ? 'fullscreen_exit' : 'fullscreen'")
    q-btn(round flat dense :color="color" icon="fast_forward" @click="forward()")
  slot
</template>

<script>
export default {
  name: 'playerActions',
  props: ['player'],
  data () {
    return {
      color: 'grey-4',
    }
  },
  methods: {
    backward () {
      this.$log('backward')
      let t = this.player.currentTime - 5
      if (t < 0) t = 0
      this.player.setCurrentTime(t)
    },
    forward () {
      this.$log('forward')
      let t = this.player.currentTime + 5
      if (t > this.player.duration) t = this.player.duration
      this.player.setCurrentTime(t)
    }
  }
}
</script>
