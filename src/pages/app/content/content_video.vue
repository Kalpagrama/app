<template lang="pug">
.column.full-width.window-height
  div(style=`height: 70px`).row.full-width.items-center.q-px-md
    //- h6.q-ma-xs {{content.name}}/{{width}}/{{height}}
    //- q-btn(round flat color="grey-9" icon="keyboard_arrow_left")
    q-icon(name="movie_creation" color='red' size="40px").q-mr-sm
    .col.full-height
      .row.fit.items-center.no-wrap.scroll
        span(style=`whiteSpace: nowrap`).text-bold {{content.name}}
    q-btn(round flat color="grey-9" icon="more_vert")
  .col.full-width
    .row.full-width.justify-center.items-start.content-start
      div(:style=`{width: width-32+'px',borderRadius: '4px'}`).row
        //- video wrapper
        div(style=`borderRadius: 4px; overflow: hidden`).row.full-width
          video(ref="kvideo" playsinline width="100%" autoplay type="video/mp4" :src="content.url" preload="none"
            style=`maxWidth: 100%; zIndex: 200; borderRadius: 4px`)
        //- bar
        div(style=`height: 40px; borderRadius: 4px; overflow: hidden`).row.full-width.bg-grey.q-my-sm
          div(:style=`{width: nowSec/k+'px'}`).row.items-center.bg-primary {{nowSec}}/{{content.duration}}
        //- div(style=`height: 60px`).row.full-width.items-center.q-px-md
        //-   h6.q-ma-xs.text-bold {{content.name}}
    //-   div(style=`position: absolute; zIndex: 100; right: 10px; bottom: 10px; borderRadius: 4px`).row.bg-black.q-pa-xs
    //-     span.text-white {{ $time(content.duration) }}
</template>

<script>
// import 'mediaelement/build/mediaelementplayer.min.css'
// import 'mediaelement/full'

export default {
  name: 'Content__ContentVideo',
  props: {
    content: {type: Object},
    width: {type: Number},
    height: {type: Number}
  },
  data () {
    return {
      me: null,
      player: null,
      url: 'https://www.youtube.com/watch?v=jx96Twg-Aew',
      nodes: [],
      nowSec: 0
    }
  },
  computed: {
    heightVideo () {
      let k = this.content.height / this.content.width
      return this.width * k
    },
    k () {
      return this.content.duration / (this.width - 32)
    },
    // 366.899 width-32
    // 36 = x
    // x = width-32*now/content.duration
  },
  methods: {
    videoClick () {
      this.$log('videoClick')
    },
    timeUpdate (e) {
      this.nowSec = this.player.currentTime
      this.$emit('now', this.player.currentTime)
    },
    playing (e) {
      this.$log('VIDEO STARTED')
    }
  },
  mounted () {
    this.$log('mounted')
    this.me = new self.MediaElementPlayer(this.$refs.kvideo, {
      loop: true,
      autoplay: true,
      controls: false,
      showPosterWhenPaused: false,
      clickToPlayPause: true,
      iPadUseNativeControls: false,
      iPhoneUseNativeControls: false,
      AndroidUseNativeControls: false,
      pauseOtherPlayers: false,
      alwaysShowControls: true,
      success: async (mediaElement, originalNode, instance) => {
        this.player = mediaElement
        this.player.addEventListener('timeupdate', this.timeUpdate, false)
        this.player.addEventListener('playing', this.playing, false)
        this.$log('player LOADED')
      }
    })
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.player.removeEventListener('timeupdate', this.timeUpdate)
    this.player.removeEventListener('playing', this.playing)
  }
}
</script>
