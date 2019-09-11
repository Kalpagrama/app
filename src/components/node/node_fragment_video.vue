<template lang="pug">
div(
  :style=`{position: 'relative'}`).row.full-width.items-start.content-start
  //- debug
  div(
    v-if="debug"
    :style=`{position: 'absolute', top: '0px', fontSize: '11px', color: 'white'}`).row.full-width.bg-purple.q-px-sm
    small.full-width muted: {{muted}}
    small.full-width playing: {{playing}}
    small.full-width now: {{$time(now)}}
  //- actions
  div(v-if="true" :style=`{position: 'absolute', zIndex: zIndex+10, top: '8px', left: '8px', height: '40px', opacity: 0.7}`).row.items-center
    //- q-btn(round flat color="white" icon="fullscreen" @click="videoToggleFullscreen").shadow-1
    //- TODO: align items in node...
    //- q-btn(v-if="!playing && visible" round color="primary" icon="flash_on" style=`width: 30px; height: 30px` @click="videoToggleMute").shadow-1
  div(:style=`{position: 'absolute', zIndex: zIndex+10, bottom: '20px', height: '40px', opacity: 0.7}`).row.full-width.justify-center.items-center
    //- q-btn(round flat color="white" dense @click="videoToggleMute").shadow-1.bg-grey-9
    //-   q-icon(:name="muted ? 'volume_off' : 'volume_up'" color="white" size="19px")
    div(:style=`{color: 'white', borderRadius: '4px', opacity: 0.7}`).bg-grey-10.q-px-xs.q-ml-sm
      small {{$time(now)}} / {{$time(duration)}}
  //- timeline
  div(v-if="now > 0" :style=`{position: 'absolute', zIndex: zIndex+100, bottom: '0px', left: '0px', height: '10px'}` @click="videoTimelineClick"
    ).row.full-width.items-end.cursor-pointer
    div(:style=`{width: videoNow+'%', height: '10px', borderRight: '3px solid #5f277a', pointerEvents: 'none'}`).row.bg-primary
  //- video autoPictureInPicture
  video(
    ref="kvideo"
    :src="url"
    :style=`{width: '100%', objectFit: 'contain'}`
    :muted="muted" loop playsinline
    @click="videoClick"
    @playing="videoPlaying"
    @timeupdate="videoTimeupdate"
    @loadeddata="videoLoaded")
</template>

<script>
export default {
  name: 'nodeFragmentVideo',
  props: ['zIndex', 'url', 'active', 'visible'],
  data () {
    return {
      debug: localStorage.getItem('kvideo_debug') ? true : false,
      playing: false,
      muted: localStorage.getItem('ksound') ? false : true,
      now: 0,
      duration: 0,
      playsinline: true
    }
  },
  computed: {
    videoNow () {
      let k = (this.now / this.duration) * 100
      return k
    },
    getRadius () {
      return {
        borderBottomLeftRadius: '100%6px',
        borderBottomRightRadius: '100%6px',
        borderTopLeftRadius: '100%6px',
        borderTopRightRadius: '100%6px'
      }
    }
  },
  watch: {
    visible: {
      // immediate: true,
      handler (to, from) {
        // this.$q.notify(`visible ${to}`)
        if (to) this.$refs.kvideo.play()
        else this.$refs.kvideo.pause()
        // this.videoClick()
      }
    }
  },
  methods: {
    videoClick () {
      this.$log('videoClick')
      if (this.playing) {
        this.$refs.kvideo.pause()
        this.playing = false
      } else {
        this.$refs.kvideo.play()
        // this.videoToggleMute()
        this.playing = true
      }
    },
    videoTimelineClick (e) {
      // this.$log('e', e)
      // let x = e.offsetX
      // let w = e.path[0].clientWidth
      // this.$q.notify(`${x.toString()}/${w.toString()} !!!`)
      // TODO: click on mobile devices
      if (e && e.path && e.path[0] && e.path[0].clientWidth && e.offsetX) {
        this.$log('videoTimelineClick', e.offsetX, e.path[0].clientWidth)
        let k = e.offsetX / e.path[0].clientWidth
        this.$refs.kvideo.currentTime = this.duration * k
      }
    },
    videoPlaying () {
      this.$log('videoPlaying')
      this.playing = true
      // if (this.$refs.kvideo) this.duration = this.$refs.kvideo.duration
    },
    videoTimeupdate () {
      // this.$log('videoTimeupdate')
      if (this.$refs.kvideo) this.now = this.$refs.kvideo.currentTime
      // TODO: loop again bitch...
    },
    videoLoaded (e) {
      // this.$log('videoLoaded', e)
      let duration = e.target.duration
      this.$log('duration', duration)
      this.$set(this, 'duration', duration)
      this.$emit('duration', duration)
    },
    videoToggleFullscreen () {
      this.$log('videoToggleFullscreen')
      // TODO: toggle fullscreen request
      // this.playsinline = !this.playsinline
      // this.$refs.kvideo.requestFullScreen()
    },
    videoToggleMute () {
      this.$log('videoToggleMute')
      if (this.muted) {
        this.muted = false
        localStorage.setItem('ksound', 'max')
      } else {
        this.muted = true
        localStorage.removeItem('ksound')
      }
    }
  },
  async mounted () {
    // this.$log('mounted')
    // localStorage.setItem('kvideo_debug', 'all')
    localStorage.removeItem('kvideo_debug')
  }
}
</script>

<style lang="stylus">
</style>
