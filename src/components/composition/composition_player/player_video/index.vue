<template lang="pug">
div(
  :style=`{
    position: 'relative',
    height: options.height,
    //- border: $slots.lefttop ? '1px solid red' : 'none'
    }`
  ).row.full-width.items-start.content-start
  //- content explorer btn
  slot(name="lefttop")
  //- transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
  content-explorer(
    v-if="options.showContentExplorer && isActive"
    :composition="composition")
  //- video spinner
  slot(name="left-bottom")
  transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    div(
      v-if="options.showContentMeta && isActive"
      :style=`{
        position: 'absolute', zIndex: 1000, transform: 'translate3d(0,0,0)',
        bottom: '0px', left: '0px',
      }`)
      q-btn(
        @click="muted ? mutedOff() : mutedOn()"
        round flat color="white" :style=`{background: 'rgba(0,0,0,0.15)',}`).q-pr-sm
        //- q-spinner-audio(
          v-if="!muted"
          size="16px" color="grey-6").q-mx-xs
        //- q-icon(
          v-if="!muted && !playing"
          name="play_arrow" size="25px" color="white"
          ).q-mx-sm
        q-icon(
          size="24px" color="grey-6" :name="muted ? 'volume_off' : 'volume_up'"
          :style=`{marginLeft: '10px'}`).q-mr-sm
        span(v-if="duration  > 0").text-grey-6 {{ $time(duration-currentTime) }}
  //- preview
  img(
    @click="$emit('previewClick')"
    draggable="false"
    loading="lazy"
    :src="composition.thumbUrl"
    :style=`{
      borderRadius: '10px', overflow: 'hidden',
      userSelect: 'none',
      height: options.height,
      objectFit: options.objectFit,
    }`
    ).full-width
  //- video wrapper
  div(
    v-if="isActive && isVisible"
    :style=`{
      position: 'absolute', zIndex: 200,
      //- transform: 'translate3d(0,0,0)',
    }`
    ).row.fit
    video(
      @click="videoClicked"
      @timeupdate="videoTimeupdate"
      @loadedmetadata="videoLoadedmetadata"
      @play="videoPlay"
      @pause="videoPause"
      @ended="videoEnded"
      @error="videoError"
      ref="compositionVideoRef"
      :src="composition.url"
      :muted="muted"
      :loop="options.loop"
      playsinline
      :style=`{
        objectFit: options.objectFit,
        borderRadius: '10px',
        overflow: 'hidden',
      }`
      ).fit
</template>

<script>

export default {
  name: 'compositionPlayer_playerVideo',
  components: {
    contentExplorer: () => import('../content_explorer.vue')
  },
  props: {
    isVisible: {type: Boolean},
    isActive: {type: Boolean},
    composition: {type: Object, required: true},
    options: {
      type: Object,
      default () {
        return {
          height: 'auto',
          objectFit: 'cover',
          loop: true,
          showContentExplorer: true,
          showContentMeta: true
        }
      }
    }
  },
  data () {
    return {
      muted: true,
      playing: false,
      currentTime: 0,
      duration: 0
    }
  },
  computed: {
    maxHeight () {
      if (this.$q.screen.width > this.$store.state.ui.pageWidth) return this.$store.state.ui.pageWidth
      else {
        return this.$q.screen.width
      }
    }
  },
  watch: {
    isVisible: {
      handler (to, from) {
        if (to) {
        }
        else {
          this.duration = 0
        }
      }
    },
    isActive: {
      handler (to, from) {
        // this.$log('isActive TO', to, composition.oid)
        this.mutedCheck()
        if (!this.$refs.compositionVideoRef) return
        if (to) {
          this.$refs.compositionVideoRef.play()
        }
        else {
          this.$refs.compositionVideoRef.pause()
          this.duration = 0
          if (this.$refs.compositionVideoRef) {
            this.$refs.compositionVideoRef.src = ''
            this.$refs.compositionVideoRef.removeAttribute('src')
          }
        }
      }
    },
  },
  methods: {
    mutedOff () {
      this.$log('mutedOff')
      this.muted = false
      localStorage.setItem('k_sound_on', 'true')
    },
    mutedOn () {
      this.$log('mutedOn')
      this.muted = true
      localStorage.removeItem('k_sound_on')
    },
    mutedCheck () {
      // this.$log('mutedCheck')
      if (this.$q.platform.is.desktop) {
        let soundOn = localStorage.getItem('k_sound_on')
        // this.$log('mutedCheck soundOn', soundOn)
        if (soundOn === 'true') {
          this.muted = false
        }
        else {
          this.muted = true
        }
      }
    },
    videoPlay (e) {
      // this.$log('videoPlay', e)
      this.playing = true
    },
    videoPause (e) {
      // this.$log('videoPause', e)
      this.playing = false
    },
    videoEnded (e) {
      // this.$log('videoEnded', e)
      this.$emit('ended')
    },
    videoClicked (e) {
      this.$log('videoClicked', e)
      if (this.muted) {
        this.muted = false
        e.target.play()
      }
      else {
        if (e.target.paused) e.target.play()
        else e.target.pause()
      }
    },
    videoTimeupdate (e) {
      // this.$log('videoTimeupdate', e.target.currentTime)
      this.currentTime = e.target.currentTime
    },
    videoLoadedmetadata (e) {
      this.$log('videoLoadedmetadata', e)
      this.duration = e.target.duration
      if (this.isActive) {
        e.target.play()
      }
    },
    videoError (e) {
      this.$log('videoError', e)
    }
  },
  mounted () {
    this.mutedCheck()
    // this.$log('mounted')
  },
  // beforeDestroy () {
  // }
}
</script>
