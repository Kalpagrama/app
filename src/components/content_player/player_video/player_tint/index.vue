<template lang="pug">
div(
  ref="tint-wrapper"
  @click.self="tintClickSelf"
  :style=`{
    position: 'absolute', zIndex: 200,
    background: 'rgba(0,0,0,'+tintBackgroundOpacity+')',
    borderRadius: '10px',
  }`
  ).row.fit.items-center.content-center.justify-center
  //- header
  transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    tint-header(
      v-if="player && player.duration"
      v-show="options.showHeader"
      v-bind="$props"
      :isFocused="tintFocused")
  //- footer debug
  //- div(
    v-if="player && player.duration && tintFocused"
    :style=`{
      position: 'absolute', zIndex: 1000,
      bottom: '0px',
    }`
    ).row.full-width.q-pa-md.bg-red.bg
    small.text-white {{ player.figureOffset }}
    small.text-white {{ player.currentTime }}
  //- spinner for loading
  q-spinner(
    v-if="contentKalpa.contentProvider !== 'YOUTUBE' && !player.playing_"
    color="white" size="50px")
  //- player play/pause
  q-btn(
    v-if="player.duration && tintFocused"
    @click="player.playing ? player.pause() : player.play()"
    round flat color="white")
    q-icon(
      size="50px"
      :name="player.playing ? 'pause' : 'play_arrow'")
  //- footer
  transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    div(
      v-if="player && player.duration"
      :style=`{
        position: 'absolute', zIndex: 1000, bottom: '0px',
        pointerEvents: showTintBar ? 'auto' : 'none',
      }`
      ).row.full-width.justify-center
      tint-bar(
        :player="player"
        :contentKalpa="contentKalpa"
        :options="options"
        :isActive="isActive"
        :isVisible="isVisible"
        :isMini="isMini"
        :style=`{
          maxWidth: $store.state.ui.pageWidth+'px',
          borderRadius: '10px',
          background: 'rgba(30,30,30,0.5)',
          opacity: showTintBar ? 1 : 0,
          pointerEvents: showTintBar ? 'auto' : 'none',
        }`)
</template>

<script>
import tintBar from './tint_bar.vue'
import tintHeader from './tint_header.vue'

export default {
  name: 'playerTint',
  props: ['player', 'contentKalpa', 'options', 'styles', 'isActive', 'isVisible', 'isMini'],
  components: {
    tintBar,
    tintHeader,
  },
  data () {
    return {
      tintBackgroundOpacity: 0,
      tintFocused: false,
      tintMousemoveTimeout: null,
    }
  },
  computed: {
    showTintBar () {
      if (this.player) {
        if (this.player.figure) {
          return true
        }
        else {
          return this.tintFocused
        }
      }
      else {
        return this.tintFocused
      }
    }
  },
  watch: {
    tintFocused: {
      handler (to, from) {
        this.$log('tintFocused TO', to)
        this.$tween.to(this, 0.3, {
          tintBackgroundOpacity: to ? 0.5 : 0,
        })
      }
    }
  },
  methods: {
    tintClickSelf () {
      this.$log('tintClickSelf')
      if (this.player.muted) {
        this.player.setState('muted', false)
      }
      else {
        this.tintFocused = !this.tintFocused
      }
      // if (this.tintFocused)
      // if (this.player.playing) {
      //   this.player.pause()
      // }
      // else {
      //   this.player.play()
      // }
    },
    tintMouseenter () {
      this.$log('tintMouseenter')
      if (this.$q.platform.is.desktop) {}
      // this.tintFocused = !this.tintFocused
    },
    tintMouseleave () {},
    tintMousemove (e) {
      // this.$log('tintMousemove', e)
      let x = e.clientX
      let y = e.clientY
      let rect = this.$refs['tint-wrapper'].getBoundingClientRect()
      let xTintMin = rect.left
      let xTintMax = rect.right
      let yTintMin = rect.top
      let yTintMax = rect.bottom
      if (this.tintMousemoveTimeout) {
        clearTimeout(this.tintMousemoveTimeout)
        this.tintMousemoveTimeout = null
      }
      this.tintMousemoveTimeout = setTimeout(() => {
        this.tintFocused = false
      }, 2000)
      // get in rect
      // this.$log({x, y, xTintMin, xTintMax, yTintMin, yTintMax})
      if (x >= xTintMin && x <= xTintMax && y >= yTintMin && y <= yTintMax) {
        this.tintFocused = true
      }
      else {
        // this.tintFocused = false
      }
    }
  },
  mounted () {
    this.$log('mounted')
    if (this.$q.platform.is.desktop) {
      window.addEventListener('mousemove', this.tintMousemove)
    }
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    if (this.$q.platform.is.desktop) {
      window.removeEventListener('mousemove', this.tintMousemove)
    }
  }
}
</script>
