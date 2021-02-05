<style lang="sass">
.rotating
  animation: rotation 20s infinite linear
@keyframes rotation
  from
    transform: rotate(0deg)
  to
    transform: rotate(-359deg)
</style>

<template lang="pug">
div(
  :style=`{
    position: 'absolute', zIndex: 10,
    left: 'calc(50% - 100px)',
    width: '200px',
  }`
  ).row.full-height.items-center.content-center.justify-between
  q-btn(
    @click="figureRefresh()"
    round flat dense color="white"
    ).col
    q-icon(name="replay" size="26px")
  q-btn(
    @click="player.playing ? player.pause() : player.play()"
    round flat dense color="white"
    ).col
    q-icon(
      size="34px"
      :name="player.playing ? 'pause' : 'play_arrow'")
  q-btn(
    @click="isLooping = !isLooping"
    round flat dense
    :color="isLooping ? 'green' : 'white'").col
    q-icon(
      name="loop"
      size="26px"
      :class=`{
        'rotating': isLooping,
      }`)
</template>

<script>
export default {
  name: 'tintBarFigureControls',
  props: ['player', 'contentKalpa'],
  data () {
    return {
      isLooping: true,
    }
  },
  watch: {
    'player.currentTime': {
      handler (to, from) {
        if (this.player.figureFocused) {
        }
        this.$log('player.currentTime TO', to)
        if (to >= this.player.figure[1].t + 0) {
          this.$log('to >= this.end', to, this.player.figure[1].t)
          // this.$q.notify({type: 'negative', position: 'top', message: 'to >= this.end' + to + ' / ' + this.player.figure[1].t})
          // this.player.setCurrentTime(this.player.figure[0].t)
          if (this.isLooping) {
            this.player.setCurrentTime(this.player.figure[0].t)
            // this.figureReplay()
          }
          else {
            this.player.pause()
          }
        }
        if (to < this.player.figure[0].t - 0.5) {
          this.$log('to < this.start', to, this.player.figure[0].t)
          this.$q.notify({type: 'negative', position: 'top', message: 'to < this.start' + to + ' / ' + this.player.figure[0].t})
          this.player.setCurrentTime(this.player.figure[0].t)
          // this.player.pause()
          // this.figureReplay()
        }
      }
    },
    'player.figureFocused': {
      handler (to, from) {
        if (to !== null) {
          this.isLooping = false
        }
      }
    }
  },
  methods: {
    figureRefresh () {
      this.$log('figureRefresh')
      this.player.setCurrentTime(this.player.figure[0].t)
    }
  }
}
</script>
