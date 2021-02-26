<template lang="pug">
div(
  @click.self="tintClickSelf"
  :style=`{
    position: 'absolute', zIndex: 200,
    borderRadius: '10px',
    overflow: 'hidden',
  }`
  ).row.fit.items-center.content-center.justify-center
  slot(name="tint" :tintFocused="tintFocused")
  //- header
  transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    tint-header(
      v-if="player && player.duration && showHeaderLocal"
      v-show="options.showHeader"
      v-bind="$props"
      :isFocused="tintFocused")
  //- middle spinner
  q-spinner(
    v-if="contentKalpa.contentProvider !== 'YOUTUBE' && !player.playing_ && tintSpinnerCanShow"
    color="white" size="50px"
    :style=`{
      pointerEvents: 'none',
    }`)
  //- actions
  transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    q-btn(
      v-if="player && player.playing_ && options.mode === 'feed' && !player.playing && tintSpinnerCanShow"
      round flat color="white"
      :style=`{pointerEvents: 'none',}`)
      q-icon(name="play_arrow" size="50px")
  //- tick left
  transition(enter-active-class="animated slideInLeft" leave-active-class="animated slideOutLeft")
    div(
      v-if="tintClickSelfCountShow === 0"
      :style=`{
        position: 'absolute', zIndex: 10, left: '0px',
        pointerEvents: 'none', userSelect: 'none',
        height: '100%',
        width: '33%',
        background: 'linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
        borderRadius: '10px 0 0 10px',
      }`
      ).row.items-center.content-center.justify-center
      q-icon(name="fast_rewind" color="white" size="20px").q-mr-xs
      span(:style=`{userSelect: 'none'}`).text-white {{ $time(tintClickSelfCount * 5) }}
  //- tick right
  transition(enter-active-class="animated slideInRight" leave-active-class="animated slideOutRight")
    div(
      v-if="tintClickSelfCountShow === 1"
      :style=`{
        position: 'absolute', zIndex: 10, right: '0px',
        pointerEvents: 'none', userSelect: 'none',
        height: '100%',
        width: '33%',
        background: 'linear-gradient(270deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
        borderRadius: '0 10px 10px 0',
      }`
      ).row.items-center.content-center.justify-center
      span(:style=`{userSelect: 'none'}`).text-white {{ $time(tintClickSelfCount * 5) }}
      q-icon(name="fast_forward" color="white" size="20px").q-ml-xs
  //- footer feed
  transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    div(
      v-if="player && player.duration && options.mode === 'feed' && !isMini"
      :style=`{
        position: 'absolute', zIndex: 1000,
        bottom: '0px',
        borderRadius: '0 0 10px 10px',
        userSelect: 'none',
        pointerEvents: 'none',
      }`
      ).row.full-width.justify-start.q-pa-md
      small(:style=`{borderRadius: '8px', background: 'rgba(0,0,0,0.7)'}`).text-white.q-py-xs.q-px-sm {{$time(player.currentTime)}} / {{$time(player.duration)}}
  //- footer editor
  transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    div(
      v-if="player && player.duration && options.mode === 'editor' && showTintBar"
      :style=`{
        position: 'absolute', zIndex: 1000,
        bottom: '0px',
        background: 'linear-gradient(0deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
        borderRadius: '0 0 10px 10px',
      }`
      ).row.full-width.justify-center.q-pa-md
      slot(name="tint-bar" :tintFocused="tintFocused")
      tint-bar(
        v-bind="$props"
        :style=`{
          maxWidth: '600px',
          borderRadius: '20px',
          background: 'rgba(30,30,30,0.6)',
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
      tintClickSelfTimeout: null,
      tintClickSelfCount: 0,
      tintClickSelfCountShow: false,
      tintSpinnerCanShow: false,
      showHeaderLocal: false,
    }
  },
  computed: {
    showTintBar () {
      if (this.player) {
        if (this.player.figure) {
          return true
        }
        else {
          if (this.player.nodePlaying) {
            return false
          }
          else {
            return this.tintFocused
          }
        }
      }
      else {
        return this.tintFocused
      }
    }
  },
  watch: {
  },
  methods: {
    tintClickSelf (e) {
      // this.$log('tintClickSelf', this.tintClickSelfCount)
      this.tintClickSelfCount += 1
      if (this.tintClickSelfTimeout) {
        clearTimeout(this.tintClickSelfTimeout)
        this.tintClickSelfTimeout = null
      }
      this.tintClickSelfTimeout = setTimeout(async () => {
        if (this.tintClickSelfCount === 1) {
          // this.$log('tintClickSelf ONE')
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
          }
          if (this.options.mode === 'editor') {
            this.tintFocused = !this.tintFocused
          }
        }
        await this.$wait(300)
        this.tintClickSelfCount = 0
        this.tintClickSelfCountShow = false
      }, 200)
      if (this.tintClickSelfCount === 1) {
        // this.$log('tintClickSelf ONE')
      }
      else {
        // this.$log('tintClickSelf DOUBLE', e)
        let t = this.player.currentTime
        let d = ((this.tintClickSelfCount - 1) * 5)
        let width = e.target.offsetWidth
        let x = e.layerX
        let p = x / width
        // this.$log('p', p)
        if (p <= 0.5) {
          t -= d
          this.tintClickSelfCountShow = 0
        }
        else {
          t += d
          this.tintClickSelfCountShow = 1
        }
        if (t < 0) t = 0
        if (t > this.player.duration) t = this.player.duration
        this.player.setCurrentTime(t)
      }
    },
    onKeydown (e) {
      // this.$log('onKeydown', e)
      if (this.$store.state.ui.userTyping) return
      switch (e.key) {
        case 'ArrowLeft':
          // Left pressed
          if (this.tintClickSelfCount === 0) this.tintClickSelfCount = 1
          this.tintClickSelf({layerX: 0.1, target: {offsetWidth: 1}})
          break
        case 'ArrowRight':
          // Right pressed
          if (this.tintClickSelfCount === 0) this.tintClickSelfCount = 1
          this.tintClickSelf({layerX: 0.9, target: {offsetWidth: 1}})
          break
        case 'ArrowUp':
          // Up pressed
          this.player.setState('muted', false)
          break
        case 'ArrowDown':
          // Down pressed
          this.player.setState('muted', true)
          break
      }
      if (e.code === 'Space') {
        if (this.player.playing) this.player.pause()
        else this.player.play()
      }
    },
    onInterval () {
      this.$log('onInterval')
      this.tintLiveMs += 100
      if (this.tintLiveMs > 10000) clearInterval(this.tintInterval)
    }
  },
  async mounted () {
    // this.$log('mounted')
    if (this.options.mode === 'editor') {
      window.addEventListener('keydown', this.onKeydown)
    }
    this.$wait(1000).then(() => {
      this.showHeaderLocal = true
    })
    this.$wait(2000).then(() => {
      this.tintSpinnerCanShow = true
    })
  },
  beforeDestroy () {
    // this.$log('beforeDestroy')
    if (this.options.mode === 'editor') {
      window.removeEventListener('keydown', this.onKeydown)
    }
  }
}
</script>
