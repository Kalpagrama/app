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
.col-6
  .row.full-width.justify-between
    q-btn(
      @click="figureRefresh()"
      round flat color="white"
      ).col
      q-icon(name="replay" size="26px")
    q-btn(
      @click="player.playing ? player.pause() : player.play()"
      round flat color="white"
      ).col
      q-icon(
        size="34px"
        :name="player.playing ? 'pause' : 'play_arrow'")
    q-btn(
      @click="isLooping = !isLooping"
      round flat
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
  name: 'playerPult__figureControls',
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
        // this.$log('player.currentTime TO', to)
        if (to >= this.player.figures[1].t + 0.2) {
          if (this.isLooping) {
            this.player.setCurrentTime(this.player.figures[0].t)
          }
          else {
            this.player.setCurrentTime(this.player.figures[1].t)
            this.player.pause()
          }
        }
        if (to < this.player.figures[0].t - 0.5) {
          this.player.setCurrentTime(this.player.figures[0].t)
        }
      }
    },
    // 'player.figureFocused': {
    //   handler (to, from) {
    //     if (to !== null) {
    //       this.isLooping = false
    //     }
    //   }
    // }
  },
  methods: {
    figureRefresh () {
      this.$log('figureRefresh')
      this.player.setCurrentTime(this.player.figures[0].t)
      this.player.play()
    },
    figureForwardStartHandle () {
      this.$log('figureForwardStartHandle')
      this.isLooping = false
    },
    figureForwardEndHandle () {
      this.$log('figureForwardEndHandle')
      // this.isLooping = true
    }
  },
  mounted () {
    this.$log('mounted')
    this.player.events.on('figures-forward-start', this.figureForwardStartHandle)
    this.player.events.on('figures-forward-end', this.figureForwardEndHandle)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.player.events.off('figures-forward-start', this.figureForwardStartHandle)
    this.player.events.off('figures-forward-end', this.figureForwardEndHandle)
  }
}
</script>
