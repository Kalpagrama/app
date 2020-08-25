<template lang="pug">
div(:style=`{position: 'relative'}`).row.full-width.items-center.content-center.justify-between.q-py-xs
  //- play/pause
  q-btn(
    @click="player.playing ? player.pause() : player.play()"
    round flat dense
    :color="player.playing ? 'red' : color"
    :icon="player.playing ? 'pause' : 'play_arrow'"
    :style=`{borderRadius: '50%', background: 'rgba(0,0,0,0.5)'}`)
  //- stats
  div(
    :style=`{
      position: 'absolute', left: '50%', marginRight: '-50%', transform: 'translate(-50%, 0)',
      background: 'rgba(0,0,0,0.5)', borderRadius: '10px', overflow: 'hidden',}`).row.full-height.items-center.content-center
    q-btn(round flat dense :color="color" icon="fast_rewind" @click="backward()")
    q-btn(round flat dense :color="color")
      q-icon(
        :name="player.mutedLocal ? 'volume_off' : 'volume_up'"
        :color="player.mutedLocal ? 'red' : color"
        size="20px" @click="player.volumeToggle()")
    q-btn(
      flat dense :color="color"
      :style=`{}`
      )
      small.text-white {{$time(player.currentTime)}} / {{$time(player.duration)}}
    q-btn(round flat dense :color="color" icon="fullscreen" @click="fullscreenToggle()")
    q-btn(round flat dense :color="color" icon="fast_forward" @click="forward()")
  slot
  //- q-btn(
  //-   round push color="green" dense icon="add"
  //-   :style=`{borderRadius: '50%'}`).br
</template>

<script>
export default {
  name: 'playerActions',
  props: ['player'],
  data () {
    return {
      color: 'grey-4'
    }
  },
  methods: {
    fullscreenToggle () {
      this.$log('fullscreenToggle')
    },
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
