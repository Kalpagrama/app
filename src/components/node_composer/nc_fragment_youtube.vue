<template lang="pug">
div(:style=`{position: 'relative', minHeight: '100px', maxWidth: '100%'}`).row.full-width
  div(v-if="true" :style=`{position: 'absolute', zIndex: 10000, top: 0, zIndex: 300}`).row.full-width.bg-green
    small.full-width videoWidth/videoHeight: {{videoWidth}}/{{videoHeight}}
    small.full-width imgWidth/imgHeight: {{imgWidth}}/{{imgHeight}}
  div(:style=`{position: 'absolute', zIndex: 2000, bottom: '25px', height: '60px', paddingLeft: '20px', paddingRight: '20px'}`).row.full-width.items-end
    transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
      div(v-if="!start").row.full-width.justify-start
        q-btn(no-caps push color="accent" @click="startHere()")
          span {{$t('Start here')}}
    transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
      div(v-if="start").row.full-width.justify-between
        //- q-btn(flat round color="accent" icon="refresh" @click="refresh()").br
        transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
          q-btn(
            v-if="!playing"
            no-caps push color="accent" @click="startHere()").q-mr-xs
            span {{$t('Start here')}}
        transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
          q-btn(
            v-if="!playing"
            no-caps push color="accent" @click="endHere()")
            span {{$t('End here')}}
        .col
        q-btn(
          push no-caps @click="play()"
          :color="playing ? 'red' : 'green'" :icon="playing ? 'pause' : 'play_arrow'"
          :style=`{maxWidth: '44px', borderRadius: '10px'}`).col
    div(:style=`{position: 'relative', height: '10px', borderRadius: '2px', pointerEvents: 'none'}`).row.full-width
      div(
        v-if="start"
        :style=`{
          position: 'absolute', zIndex: 2100, borderRadius: '2px',
          height: '10px', pointerEvents: 'none',
          left: (start/content.duration)*100+'%',
          width: end ? ((end-start)/content.duration)*100+'%' : ((now-start)/content.duration)*100+'%'}`).row.bg-green
  div(:style=`{position: 'absolute', zIndex: 1000, left: 0, right: 0, bottom: 0, top: 0}`).row.fit
    video(
      ref="ncYoutube" :playsinline="true" crossorigin="Anonymous" :autoplay="true"
      @canplay="videoCanplay" @play="videoPlay" @playing="videoPlaying"
      :width="imgWidth" :height="imgHeight+160")
      source(:src="content.url" type="video/youtube")
  div(:style=`{height: '60px'}`).row.full-width.bg-black
  img(:src="content.thumbUrl" :style=`{width: '100%', maxHeight: width+'px', objectFit: 'contain'}` @load="imgLoad")
  div(:style=`{height: '400px'}`).row.full-width.bg-black
</template>

<script>
export default {
  name: 'ncFragment__youtube',
  props: ['width', 'content', 'points'],
  data () {
    return {
      now: 0,
      start: undefined,
      end: undefined,
      player: null,
      playing: false,
      playingHeight: 0,
      instance: null,
      imgWidth: 0,
      imgHeight: 0
    }
  },
  computed: {
    videoWidth () {
      return this.width
    },
    videoHeight () {
      let w = (this.width * this.content.height) / this.content.width
      if (w > this.width) {
        return this.width
      } else {
        return w
      }
    }
  },
  methods: {
    startHere () {
      this.$log('startHere', this.player.currentTime)
      let time = this.player.currentTime
      if (this.end) {
        if (time < this.end) {
          this.start = time
        } else {
          this.start = time
          this.end = undefined
        }
      } else {
        this.start = time
      }
    },
    endHere () {
      this.$log('endHere', this.player.currentTime)
      let time = this.player.currentTime
      if (time < this.start) {
        this.start = time
        this.end = undefined
      } else {
        this.end = time
      }
    },
    play (ignore) {
      this.$log('play', ignore)
      if (ignore) {
        this.player.setCurrentTime(this.start)
        this.player.play()
      } else {
        if (this.playing) {
          this.playing = false
        } else {
          this.playing = true
          this.player.setCurrentTime(this.start)
          this.player.play()
        }
      }
    },
    refresh () {
      this.start = undefined
      this.end = undefined
    },
    imgLoad (e) {
      this.$log('imgLoad', e.path[0].width, e.path[0].height)
      this.imgWidth = e.path[0].width
      this.imgHeight = e.path[0].height
      this.$nextTick(() => {
        this.playerStart(this.imgWidth, this.imgHeight + 160)
        this.player.setSize(this.imgWidth, this.imgHeight + 160)
      })
    },
    videoCanplay (e) {
      this.$log('videoCanplay', e)
    },
    videoPlay (e) {
      this.$log('videoPlay')
    },
    videoPlaying (e) {
      this.$log('videoPlaying', e)
    },
    videoTimeupdate (e) {
      this.now = this.player.currentTime
      if (this.playing) {
        if (this.now >= this.end) {
          this.play(true)
        }
      }
    },
    playerStart (width, height) {
      let me = new window.MediaElementPlayer(this.$refs.ncYoutube, {
        loop: true,
        autoplay: true,
        controls: true,
        useFakeFullscreen: true,
        alwaysShowControls: true,
        features: ['progress'],
        setDimensions: true,
        // enableAutosize: true,
        // stretching: 'auto',
        videoWidth: width,
        // defaultVideoWidth: width,
        videoHeight: height,
        // defaultVideoHeight: height,
        success: async (mediaElement, originalNode, instance) => {
          // this.$log('instance', instance)
          this.instance = instance
          this.player = mediaElement
          this.player.addEventListener('timeupdate', this.videoTimeupdate, false)
          this.player.setCurrentTime(0)
          this.player.play()
        }
      })
    }
  },
  mounted () {
    this.$log('mounted')
    if (this.points) {
      this.start = this.points[0].x
      this.end = this.points[1].x
    } else {
    }
    // this.playerStart(this.videoWidth, this.videoHeight)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.player.removeEventListener('timeupdate', this.videoTimeupdate)
  }
}
</script>
