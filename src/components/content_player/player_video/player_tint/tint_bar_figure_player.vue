<style lang="sass">
.rotating
  animation: rotation 1s infinite linear
@keyframes rotation
  from
    transform: rotate(0deg)
  to
    transform: rotate(-359deg)
</style>

<template lang="pug">
div(
  :style=`{
    //- height: '40px',
  }`
  ).row.full-width.q-px-md.q-py-sm
  q-btn(
    @click="figurePlay()"
    round flat dense
    :color="player.figureFocused ? 'red' : 'white'"
    :icon="player.figureFocused ? 'stop' : 'play_arrow'")
  .col.q-px-sm
    div(
      ref="figure-wrapper"
      :style=`{position: 'relative', height: '32px',}`).row.full-width
      //- percent
      div(
        :style=`{
          position: 'absolute', zIndex: 10,
          pointerEvents: 'none',
        }`
        ).row.fit.items-center.content-center
        div(
          :style=`{
            position: 'relative',
            height: '6px',
            borderRadius: '5px',
            pointerEvents: 'none',
          }`
          ).row.full-width.b-50
          div(
            v-if="isVisible"
            :style=`{
              position: 'absolute',
              zIndex: 10,
              left: '0px',
              width: percent+'%',
              background: 'rgba(255,255,255,1)',
              pointerEvents: 'none',
              borderRadius: '5px',
            }`).row.full-height
            div(
              :style=`{
                position: 'absolute',
                top: figureOnPanning ? '-7px' : '-5px',
                right: figureOnPanning ? '-7px' : '-5px',
                width: figureOnPanning ? '20px' : '16px',
                height: figureOnPanning ? '20px' : '16px',
                borderRadius: '10px',
                pointerEvents: 'none',
              }`
              ).bg-white
      //- tint for click and pan
      div(
        @click="figureClick"
        v-touch-pan.mouse.left.right.prevent="figureOnPan"
        :style=`{
          position: 'absolute', zIndex: 100,
        }`
        ).row.fit
  q-btn(
    @click="figureReplay()"
    round flat dense color="white" icon="replay")
  q-btn(
    @click="isLooping = !isLooping"
    round flat dense
    :color="isLooping ? 'green' : 'white'")
    q-icon(
      name="loop"
      size="26px"
      :class=`{
        'rotating': isLooping,
      }`)
</template>

<script>
export default {
  name: 'tintBarFigurePlayer',
  props: ['player', 'contentKalpa'],
  data () {
    return {
      isLooping: false,
      figureRect: null,
      figureOnPanning: false,
    }
  },
  computed: {
    start () {
      return this.player.figure[0].t
    },
    end () {
      return this.player.figure[1].t
    },
    duration () {
      return this.player.figure[1].t - this.player.figure[0].t
    },
    isVisible () {
      return this.player.currentTime >= this.start && this.player.currentTime <= this.end
    },
    percent () {
      return ((this.player.currentTime - this.start) / this.duration) * 100
    }
  },
  watch: {
    'player.currentTime': {
      handler (to, from) {
        if (this.player.figureFocused) {
          // this.$log('player.currentTime TO', to)
          if (to >= this.end) {
            if (this.isLooping) {
              this.figureReplay()
            }
            else {
              this.player.pause()
            }
          }
          if (to < this.start) {
            this.player.pause()
            this.figureReplay()
          }
        }
      }
    }
  },
  methods: {
    figureClick (e) {
      // this.$log('figureClick', e)
      let width = e.target.clientWidth
      let left = e.layerX
      // this.$log({width, left})
      // we got left/width is percent of figure duration
      let k = left / width
      let t = this.start + (k * this.duration)
      this.player.setCurrentTime(t)
    },
    async figureOnPan (e) {
      // this.$log('figureOnPan', e)
      // if (this.figureOnPanning) return
      if (this.figureRect === null) {
        this.figureRect = this.$refs['figure-wrapper'].getBoundingClientRect()
      }
      let width = this.figureRect.width
      let left = e.position.left - this.figureRect.left
      this.figureClick({layerX: left, target: {clientWidth: width}})
      if (e.isFirst) {
        this.figureOnPanning = true
      }
      if (e.isFinal) {
        // await this.$wait(400)
        this.figureOnPanning = false
      }
    },
    figureReplay () {
      this.$log('figureReplay')
      this.player.setState('figureFocused', true)
      this.player.setCurrentTime(this.start)
      this.player.play()
    },
    figurePlay () {
      this.$log('figurePlay')
      if (this.player.figureFocused) {
        this.player.setState('figureFocused', false)
      }
      else {
        this.player.setState('figureFocused', true)
        this.player.setCurrentTime(this.start)
        this.player.play()
      }
    }
  }
}
</script>
