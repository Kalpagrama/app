<template lang="pug">
div(
  :style=`{position: 'relative'}`).row.full-width.full-height.items-start.content-start
  //- actions
  //- div(v-if="true" :style=`{position: 'absolute', zIndex: zIndex+10, top: '8px', left: '8px', height: '40px', opacity: 0.7}`).row.items-center
    //- q-btn(round flat color="white" icon="fullscreen" @click="videoToggleFullscreen").shadow-1
    //- TODO: align items in node...
    //- q-btn(v-if="!playing && visible" round color="primary" icon="flash_on" style=`width: 30px; height: 30px` @click="videoToggleMute").shadow-1
  //- volume
  q-btn(
    v-if="active"
    round dense flat color="white" @click="videoToggleMute()"
    :style=`{position: 'absolute', zIndex: 1000, top: '8px', left: '8px', background: 'rgba(0,0,0,0.5)'}`)
    q-icon(:name="videoMuted ? 'volume_off' : 'volume_up'" color="white" size="19px")
  //- time
  div(
    v-if="active"
    :style=`{position: 'absolute', height: '20px', bottom: '10px', left: '10px', color: 'white', borderRadius: '4px', opacity: 0.5}`
    ).row.items-center.bg-grey-10.q-px-xs
    small {{$time(now)}} / {{$time(duration)}}
  //- timeline
  div(v-if="active && now > 0" :style=`{position: 'absolute', zIndex: zIndex+100, bottom: '0px', left: '0px', height: '6px'}` @click="videoTimelineClick"
    ).row.full-width.items-end.cursor-pointer
    div(:style=`{width: videoNow+'%', height: '10px', borderRadius: '0 4px 4px 0', pointerEvents: 'none'}`).row.bg-accent
  //- video
  video(
    ref="kvideo"
    :src="url"
    :style=`{width: '100%', height: '100%', objectFit: 'contain'}`
    loop playsinline :muted="videoMuted" autoplay
    @click="videoClick"
    @playing="videoPlaying"
    @timeupdate="videoTimeupdate"
    @loadeddata="videoLoaded")
</template>

<script>
export default {
  name: 'nodeFragmentVideo',
  props: ['zIndex', 'url', 'active', 'visible', 'muted'],
  data () {
    return {
      now: 0,
      mutedLocal: true,
      duration: 0,
      playing: false,
      playsinline: true
    }
  },
  computed: {
    videoMuted () {
      if (!this.mutedLocal) return false
      else return this.muted
    },
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
    active: {
      handler (to, from) {
        this.$logD('active CHANGED', to)
        if (to) this.$refs.kvideo.play()
        else this.$refs.kvideo.pause()
      }
    },
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
      this.$logD('videoClick')
      // TODO: save mute state where? or do in in props? or in nodes? vuex
      if (this.playing) {
        if (this.muted) {
          this.videoToggleMute()
        } else {
          this.$refs.kvideo.pause()
          this.playing = false
        }
      } else {
        this.$refs.kvideo.play()
        // this.videoToggleMute()
        this.playing = true
      }
    },
    videoTimelineClick (e) {
      // this.$logD('e', e)
      // let x = e.offsetX
      // let w = e.path[0].clientWidth
      // this.$q.notify(`${x.toString()}/${w.toString()} !!!`)
      // TODO: click on mobile devices
      if (e && e.path && e.path[0] && e.path[0].clientWidth && e.offsetX) {
        this.$logD('videoTimelineClick', e.offsetX, e.path[0].clientWidth)
        let k = e.offsetX / e.path[0].clientWidth
        this.$refs.kvideo.currentTime = this.duration * k
      }
    },
    videoPlaying () {
      this.$logD('videoPlaying')
      this.playing = true
      // if (this.$refs.kvideo) this.duration = this.$refs.kvideo.duration
    },
    videoTimeupdate () {
      // this.$logD('videoTimeupdate')
      if (this.$refs.kvideo) this.now = this.$refs.kvideo.currentTime
      // TODO: loop again bitch...
    },
    videoLoaded (e) {
      // this.$logD('videoLoaded', e)
      let duration = e.target.duration
      // this.$logD('duration', duration)
      this.$set(this, 'duration', duration)
      this.$emit('duration', duration)
    },
    videoToggleFullscreen () {
      this.$logD('videoToggleFullscreen')
      // TODO: toggle fullscreen request
      // this.playsinline = !this.playsinline
      // this.$refs.kvideo.requestFullScreen()
    },
    videoToggleMute () {
      this.$logD('videoToggleMute')
      this.mutedLocal = !this.mutedLocal
    }
  },
  async mounted () {
    // this.$root.$on('create', () => {
    //   this.muted = true
    //   if (this.$refs.kvideo) this.$refs.kvideo.pause()
    // })
  }
}
</script>

<style lang="stylus">
</style>
