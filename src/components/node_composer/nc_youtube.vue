<style lang="stylus">
</style>

<template lang="pug">
.column.fit
  .col.full-width.q-pa-sm
    div(
      ref="ncVideoWrapper"
      :style=`{position: 'relative', zIndex: 100,
      maxWidth: '100%', maxHeight: '100%', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.bg-black
      //- :style=`{height: '100px', width: $q.screen.width-16+'px', maxWidth: '100%', maxHeight: '200px', objectFit: 'contain'}`).fit
      video(
        ref="ncVideoYoutube" :width="$q.screen.width-16" :height="$q.screen.width-16"
        :playsinline="true" crossorigin="Anonymous" :autoplay="true")
        source(:src="urlParsed" type="video/youtube")
      //- debug
      div(
        v-if="false"
        :style=`{position: 'absolute', zIndex: 1000, bottom: '100px'}`).row.full-width.bg-green
        small.full-width now/duration: {{now}}/{{duration}}
        small.full-width start/end: {{start}}/{{end}}
      //- rect
      div(
        v-if="rect"
        :style=`{position: 'absolute', zIndex: 2000, width: rect.width+'px', height: rect.height+'px', opacity: 0.5}`).row.bg-red
      //- boom btn
      div(:style=`{position: 'absolute', zIndex: 1000, bottom: '40px', height: '60px'}`).row.full-width.items-center.justify-between.q-px-md
        q-btn(
          push flat color="accent" icon="refresh" @click="refresh()"
          :style=`{maxWidth: '40px', borderRadius: '10px'}`).col.q-mr-sm
        q-btn(
          push no-caps color="accent" @click="startHere()"
          :style=`{borderRadius: '10px'}`).col.q-mr-sm
          span.text-bold {{$t('Start')}}
        q-btn(
          push no-caps color="accent" @click="endHere()"
          :style=`{borderRadius: '10px'}`).col.q-mr-sm
          span.text-bold {{$t('End')}}
        q-btn(
          push no-caps @click="play()"
          :color="playing ? 'red' : 'green'" :icon="playing ? 'pause' : 'play_arrow'"
          :style=`{maxWidth: '40px', borderRadius: '10px'}`).col
          //- span.text-bold {{ playing ? $t('Stop') : $t('Play') }}
      //- fragment
      div(
        :style=`{position: 'absolute', zIndex: 1000, bottom: '30px', height: '10px',
          paddingLeft: '20px', paddingRight: '20px'}`
        ).row.full-width
        div(:style=`{position: 'relative'}`).row.fit
          div(
            v-if="start"
            :style=`{position: 'absolute', left: (start/duration*100)+'%',
              borderRadius: '2px', overflow: 'hidden',
              width: end ? (((end-start)/duration)*100)+'%' : ((now-start)/duration)*100+'%', height: '10px'}`).row.bg-accent
    div(:style=`{height: '60px'}`).row.full-width.items-center.content-center.justify-between.q-px-sm
      q-btn(round flat icon="clear")
      .col
      transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
        q-btn(
          v-if="start && end"
          no-caps color="accent" @click="next()"
          :style=`{borderRadius: '10px'}`)
          span.text-bold {{ $t('Next') }}
    div().row.full-width.bg-red
      img(v-if="thumbUrl" :src="thumbUrl").fit
</template>

<script>
import html2canvas from 'html2canvas'

export default {
  name: 'ncYoutube',
  props: {
    url: {
      type: String,
      default () {
        return 'https://youtu.be/pRgUpRx1wE8'
      }
    }
  },
  data () {
    return {
      urlParsed: undefined,
      urlId: undefined,
      player: null,
      duration: undefined,
      start: undefined,
      end: undefined,
      now: undefined,
      playing: false,
      instance: null,
      rect: null,
      thumbUrl: undefined
    }
  },
  computed: {
  },
  watch: {
    url: {
      immediate: true,
      handler (to, from) {
        this.$logD('url CHANGED', to)
        if (!to) return
        let url = new URL(to)
        this.$logD('url', url)
        let regExp = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/
        let match = url.href.match(regExp)
        if (match && match[1] && match[1].length === 11) {
          this.urlParsed = `https://www.youtube.com/embed/${match[1]}`
          this.urlId = match[1]
          this.$nextTick(() => {
            this.startVideo()
          })
        } else {
          this.urlParsed = undefined
        }
      }
    }
  },
  methods: {
    startHere () {
      this.$logD('startHere', this.player.currentTime)
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
      this.$logD('endHere', this.player.currentTime)
      let time = this.player.currentTime
      if (time < this.start) {
        this.start = time
        this.end = undefined
      } else {
        this.end = time
      }
    },
    play (ignore) {
      this.$logD('play')
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
      this.$logD('refresh')
      this.start = undefined
      this.end = undefined
      this.playing = false
    },
    next () {
      this.$logD('next')
      if (this.start && this.end) {
        // minimize and write some name?
        this.screenshot(this.start)
      } else {
        // TODO: fragment or not?
        this.$q.notify({message: 'Next', color: 'green', textColor: 'white'})
      }
    },
    async screenshot (sec) {
      this.$logD('screenshot start', sec)
      this.player.setCurrentTime(sec)
      // html2canvas(this.$refs.ncVideoWrapper).then(canvas => {
      //   this.$refs.ncVideoWrapper.appendChild(canvas)
      // })
      return ''
    },
    timeUpdate (e) {
      // this.$logD('timeUpdate', e)
      this.now = this.player.currentTime
      if (!this.duration) this.duration = this.player.duration
      if (this.playing) {
        if (this.now >= this.end) {
          this.play(true)
        }
      }
    },
    async getInfo (id) {
      this.$log('getInfo start')
      let {data: {youtubeInfo}} = await this.$apollo.query({
        query: gql`
          query youtubeInfo ($videoIds: [String!]!) {
            youtubeInfo (videoIds: $videoIds)
          }
        `,
        variables: {
          videoIds: [id]
        }
      })
      this.$log('getInfo done', youtubeInfo)
    },
    startVideo () {
      this.$logD('startVideo start')
      let me = new window.MediaElementPlayer(this.$refs.ncVideoYoutube, {
        loop: true,
        autoplay: true,
        controls: true,
        // enableAutosize: true,
        useFakeFullscreen: true,
        alwaysShowControls: true,
        features: ['progress'],
        setDimensions: true,
        videoWidth: this.$q.screen.width - 16,
        defaultVideoWidth: this.$q.screen.width - 16,
        videoHeight: this.$q.screen.width - 16,
        defaultVideoHeight: this.$q.screen.width - 16,
        success: async (mediaElement, originalNode, instance) => {
          // this.$log('instance', instance)
          this.instance = instance
          this.player = mediaElement
          this.player.addEventListener('timeupdate', this.timeUpdate, false)
          this.player.setCurrentTime(0)
          this.player.play()
          this.getInfo(this.urlId)
        }
      })
    }
  },
  mounted () {
    this.$logD('mounted')
  },
  beforeDestroy () {
    this.$logD('beforeDestroy')
    this.player.removeEventListener('timeupdate', this.timeUpdate)
  }
}
</script>
