<template lang="pug">
div(
  ref="tint-wrapper"
  @click.self="tintClickSelf"
  :style=`{
    position: 'absolute', zIndex: 200,
    background: options.mode === 'editor' ? 'none' : 'rgba(0,0,0,'+tintBackgroundOpacity+')',
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
  //- middle
  //- spinner for loading
  q-spinner(
    v-if="contentKalpa.contentProvider !== 'YOUTUBE' && !player.playing_"
    color="white" size="50px")
  //- actions
  div(
    v-if="player.duration && tintFocused && player.playing_ && options.mode === 'feed'"
    :style=`{pointerEvents: 'none',}`
    ).row.justify-center.br
    //- q-btn(
      @click="tapClick(0)"
      round flat color="white")
      q-icon(name="replay_5" size="40px")
    //- player play/pause
    q-btn(
      @click="player.playing ? player.pause() : player.play()"
      round flat color="white"
      :style=`{
        pointerEvents: 'none',
      }`)
      q-icon(
        size="80px"
        :name="player.playing ? 'pause' : 'play_arrow'")
    //- q-btn(
      @click="tapClick(1)"
      round flat  color="white")
      q-icon(name="forward_5" size="40px")
  //- footer
  transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
     div(
        v-if="player.duration && player.playing_ && options.mode === 'feed' && !isMini"
        :style=`{
          position: 'absolute', zIndex: 1000,
          bottom: '8px',
        }`
        ).row.justify-center
        q-btn(
          @click="tapClick(0)"
          round flat color="grey-8")
          q-icon(name="replay_5" size="40px").q-mr-lg
        //- player play/pause
        //- q-btn(
          @click="player.playing ? player.pause() : player.play()"
          round flat color="white")
          q-icon(
            size="80px"
            :name="player.playing ? 'pause' : 'play_arrow'")
        q-btn(
          @click="tapClick(1)"
          round flat  color="grey-8").q-ml-lg
          q-icon(name="forward_5" size="40px")
  //- footer
  transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    div(
      v-if="player && player.duration && options.mode === 'editor'"
      :style=`{
        position: 'absolute', zIndex: 1000,
        bottom: '0px',
        //- pointerEvents: showTintBar ? 'auto' : 'none',
        background: tintFocused ? 'linear-gradient(0deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)' : 'none',
        borderRadius: '0 0 10px 10px',
      }`
      ).row.full-width.justify-center.q-pa-md
      tint-bar(
        v-bind="$props"
        :style=`{
          maxWidth: '600px',
          borderRadius: '20px',
          background: options.mode === 'editor' ? 'rgba(30,30,30,0.8)' : 'none',
          //- opacity: showTintBar ? 1 : 0,
          //- pointerEvents: showTintBar ? 'auto' : 'none',
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
    tapClick (index) {
      this.$log('tapClick', index)
      let t = this.player.currentTime
      if (index === 0) t -= 5
      if (index === 1) t += 5
      if (t < 0) t = 0
      if (t > this.player.duration) t = this.player.duration
      this.player.setCurrentTime(t)
    },
    tintClickSelf () {
      this.$log('tintClickSelf')
      if (this.options.mode === 'feed') {
        if (this.player.muted) {
          this.player.setState('muted', false)
        }
        else {
          // this.tintFocused = !this.tintFocused
          if (this.player.playing) {
            this.tintFocused = true
            this.player.pause()
          }
          else {
            this.tintFocused = false
            this.player.play()
          }
        }
        // else {
        //   this.tintFocused = !this.tintFocused
        // }
      }
      if (this.options.mode === 'editor') {
        this.tintFocused = !this.tintFocused
      }
    },
    tintMouseenter () {
      this.$log('tintMouseenter')
      if (this.$q.platform.is.desktop) {}
      // this.tintFocused = !this.tintFocused
    },
    tintMouseleave () {},
    tintMousemove (e) {
      // this.$log('tintMousemove', e)
      if (this.options.mode === 'editor') return
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
      }, 1000)
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
