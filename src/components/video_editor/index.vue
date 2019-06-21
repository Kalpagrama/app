<template lang="pug">
div(style=`overflowX: hidden`).row.fit.justify-center.bg-grey-2
  div(style=`maxWidth: 1140px`).row.fit.justify-center
    slot(name="menu")
    .col.full-height
      div().row.fit.justify-center.items-start.content-start.q-pa-lg
        div(style=`position: relative; width: 640px; height: 360px; borderRadius: 8px; overflow: hidden`).row
          //- div(v-if="loading" style=`position: absolute; zIndex: 100;`).row.fit.bg-grey-4
          //-   span Loading, please wait
          video(ref="kvideo" width="100%" height="100%" playsinline preload="auto")
            //- source(type="video/youtube" :src="url")
            source(type="video/mp4" :src="content.url" v-if="content")
          div(v-if="!content").row.fit.items-center.justify-center
            q-spinner(size="50px" color="primary" :thickness="2")
        div(style=`position: relative; width: 640px; height: 160px`).row
          div(
            v-touch-pan.mouse="draggingFrames"
            :style=`{position: 'absolute', left: left+'px', top: '55px', height: '50px', width: getLength+'px'}`
            ).row.no-wrap.bg-green
            //- fragment
            div(:style=`{position: 'absolute', zIndex: 100, left: start+'px', top: '-24px', height: '98px', width: '640px'}`
              ).row.items-center.justify-center
              div(style=`height: 20px`).row.full-width.justify-start.q-px-sm
                small 0.23
              div(style=`height: 58px; borderRadius: 8px; border: 4px solid red`).row.full-width
              div(style=`height: 20px`).row.full-width.justify-end.q-px-sm
                small 12.23
              h6.text-red.text-bold.q-ma-xs 180sec/{{content.duration}}
            //- frames images
            div(style=`borderRadius: 8px; overflow: hidden !important`).row
              div(
                v-for="(f, fi) in Math.ceil(content.duration / 10)" :key="fi"
                :style=`{position: 'absolute', left: ((fi-1)*35.5555)+'px', width: '88px', height: '50px'}`
                  ).row.items-center.justify-center
                //- img(width="100%" height="100%" :src="getFrame(fi)")
                small {{ fi+1 }}
        .row.full-width
          .row.full-width
            small secs {{secs}} /
            small frames {{frames}}
          .row.full-width
            small start: {{ start }}
            small left: {{ left }}
          .row.full-width
            small length: {{ getLength }}
          .row.full-width
            small length - left: {{getLength + left}}
          .row.full-width
            small framesLength {{ content.frameUrls.length }}
        //- .row.full-width
        //-   small {{content}}
</template>

<script>
export default {
  name: 'videoEditor',
  data () {
    return {
      loading: true,
      content: null,
      left: 0,
      start: 0,
      player: null
    }
  },
  computed: {
    getLength () {
      return (this.content.duration * 640) / 180
    },
    secs () {
      return Math.ceil(this.content.duration)
    },
    frames () {
      return this.content.frameUrls.length
    }
  },
  methods: {
    getFrame (index) {
      if (this.secs === this.frames) {
        return this.content.frameUrls[index]
      } else {
        let d = this.secs - this.frames
        let x = Math.ceil(d / this.secs)
        let indexNew = index - x
        let indexNext = index
        if (indexNew >= 0) indexNext = 0
        else indexNext = indexNew
        return this.content.framUrls[indexNext]
      }
    },
    draggingFrames (e) {
      // this.$log('d', e.delta.x)
      let leftNext = this.left + e.delta.x
      if (this.left <= 0 && leftNext <= 0 && this.getLength + leftNext - 640 >= 0) {
        if (e.delta.x > 0) {
          // this.$log('right')
          this.left += e.delta.x
          this.start -= e.delta.x
        } else if (e.delta.x < 0) {
          // this.$log('LEFT')
          this.left += e.delta.x
          this.start -= e.delta.x
        }
      }
    },
    async uploadContent () {
      this.$log('uploadContent start')
      console.time('uploadContent')
      let { data: { uploadContentUrl: { oid } } } = await this.$apollo.mutate({
        mutation: gql`
          mutation uploadContentUrl ($url: String!) {
            uploadContentUrl(url: $url) {
              oid
            }
          }
        `,
        variables: {
          url: 'https://www.youtube.com/watch?v=6f7WccGetpc'
        }
      })
      this.$log('oid', oid)
      this.$log('uploadContent done')
      console.timeEnd('uploadContent')
      await this.getContent(oid)
    },
    async getContent (oid) {
      this.$log('getContent start')
      let { data: { objectList } } = await this.$apollo.query({
        query: gql`
          query getContent ($oid: OID!) {
            objectList(oids: [$oid]) {
              oid
              name
              ... on Video {
                frameUrls
                url
                urlType
                duration
                tags
              }
            }
          }
        `,
        variables: {
          oid: oid
        }
      })
      this.$log('getContent done', objectList[0])
      this.content = objectList[0]
    }
  },
  async mounted () {
    this.$log('mounted start')
    await this.uploadContent()
    let p = new window.MediaElementPlayer(this.$refs.kvideo, {
      loop: true,
      autoplay: true,
      controls: true,
      showPosterWhenPaused: false,
      clickToPlayPause: true,
      iPadUseNativeControls: false,
      iPhoneUseNativeControls: false,
      AndroidUseNativeControls: false,
      success: async (mediaElement, originalNode, instance) => {
        this.player = mediaElement
        // this.mediaElement.addEventListener('timeupdate', this.timeUpdate, false)
        this.player.setCurrentTime(10)
        this.player.play()
        this.$log('START PLAYING')
        // await this.$wait(600)
        // this.started = true
        // this.$emit('started')
      }
    })
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
