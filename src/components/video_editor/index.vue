<template lang="pug">
div(style=`position: relative; overflowX: hidden`).row.fit.justify-center.bg-white
  div(v-if="loading" style=`position: absolute; zIndex: 400; opacity: 0.7`).row.fit.items-center.justify-center.bg-white
    q-spinner(size="50px" :thickness="2" color="primary")
  div(:style=`{maxWidth: '1140px'}` :class=`{'q-py-md': $q.screen.width > videoWidth}`).row.fit.justify-center
    slot(name="menu")
    .col.full-height
      div(style=`position: relative`).row.fit.justify-center.items-start.content-start
        //- video container
        div(:style=`{position: 'relative', width: videoWidth+'px', height: videoHeight+'px',
          borderRadius: $q.screen.width <= videoWidth ? '0px' : '4px', overflow: 'hidden'}`).row
          video(v-if="fragment.content.url" ref="kvideo" width="100%" height="100%"
            playsinline preload="auto" crossorigin="Anonymous"
            type="video/mp4" :src="fragment.content.url")
          div(v-else).row.fit.items-center.justify-center
            q-spinner(size="50px" color="primary" :thickness="2")
            span Loading video {{fragment}}
        div(v-if="!loading" :style=`{position: 'relative', width: videoWidth+'px', height: '150px'}`).row.justify-center
            //- frames
            div(
              id="frames"
              :style=`{position: 'absolute', oveflow: 'hidden', zIndex: 100, left: framesLeft+'px', top: '50px', width: framesWidth+'px', height: '50px', borderRadius: '6px'}`
              v-touch-pan.mouse.stop="framesDrag").row.bg-grey-3
              //- pics
              //- div(style=`borderRadius: 4px; overflow: hidden`).row
              div(id="frames" style=`borderRadius: 4px; overflow: hidden`).row.no-wrap
                div(
                  id="frames"
                  v-for="(f, fi) in framesFilter" :key="fi"
                  :style=`{width: frameWidth+'px', height: '50px', overflow: 'hidden'}`
                    ).row.items-center.justify-center.bg-grey-4
                  img(id="frames" width="80px" height="50px" :src="f")
                  //- small.text-black {{ fi+1 }}
              //- now
              div(v-if="!dragging" :style=`{position: 'absolute', zIndex: 199, left: secToPx(nowSec)+'px', top: '0px', width: '2px', height: '50px'}`).bg-primary
              //- frame
              div(id="frame" :style=`{position: 'absolute', zIndex: 200, left: secToPx(startSec)+'px', top: '-4px', width: secToPx(endSec - startSec)+'px', height: '58px', border: '3px solid #027BE3', borderRadius: '8px'}`
                ).row
                //- start
                //- start label
                div(:style=`{position: 'absolute', zIndex: 300, height: '34px', top: '-40px', minWidth: '130px', left: getLabelOffset+'px', borderRadius: '8px'}`
                  ).row.items-center.content-center.justify-between.bg-grey-2
                  q-btn(round dense flat icon="keyboard_arrow_left" color="grey-9" @click="startTickLeft")
                  div(v-touch-pan.mouse="startDrag" :style=`{cursor: 'e-resize'}`).col
                    span {{getTime(startSec)}}
                  q-btn(round dense flat icon="keyboard_arrow_right" color="grey-9" @click="startTickRight")
                //- start drag
                div(:style=`{position: 'absolute', zIndex: 300, height: '46px', top: '2px', width: '10px', left: '-10px', borderRadius: '4px 0px 0px 4px', cursor: 'e-resize'}`
                  v-touch-pan.mouse="startDrag").bg-primary
                //- end
                //- end label
                div(:style=`{position: 'absolute', zIndex: 300, height: '34px', top: '-40px', minWidth: '130px', right: getLabelOffset+'px', borderRadius: '8px'}`
                  ).row.items-center.content-center.justify-between.bg-grey-2
                  q-btn(round dense flat icon="keyboard_arrow_left" color="grey-9" @click="endTickLeft")
                  div(v-touch-pan.mouse="endDrag" :style=`{cursor: 'e-resize'}`).col
                    span {{getTime(endSec)}}
                  q-btn(round dense flat icon="keyboard_arrow_right" color="grey-9" @click="endTickRight")
                //- end drag
                div(:style=`{position: 'absolute', zIndex: 300, height: '46px', top: '2px', width: '10px', right: '-10px', borderRadius: '4px', cursor: 'e-resize'}`
                  v-touch-pan.mouse="endDrag").bg-primary
                //- total time label
                div(:style=`{position: 'absolute', zIndex: 300, height: '34px', bottom: '-40px', width: '100%'}`).row.items-start.justify-center
                  div(style=`minWidth: 140px; height: 34px; borderRadius: 8px`).row.justify-between.items-center.contenet-center.bg-grey-2
                    q-btn(round dense flat icon="keyboard_arrow_left" color="grey-9" @click="startTickLeft() + endTickLeft()")
                    div(v-touch-pan.mouse="totalDrag" :style=`{cursor: 'e-resize'}`).col
                      span {{getTime(endSec - startSec)}}
                    q-btn(round dense flat icon="keyboard_arrow_right" color="grey-9" @click="startTickRight() + endTickRight()")
        //- tools
        div(v-if="!loading" :style=`{width: videoWidth+'px', height: '60px'}`).row.justify-end.items-center.q-px-sm
          //- q-btn(round dense color="grey-9" icon="refresh" @click="handleReload")
          q-btn(style=`height: 50px; maxWidth: 100px; borderRadius: 4px` outline no-caps :color="loop ? 'primary' : 'grey-9'" @click="toggleLoop").q-mr-sm
            span.text-bold {{$t('loop')}}
          q-btn(style=`height: 50px; maxWidth: 100px; borderRadius: 4px` outline no-caps :color="muted ? 'primary' : 'grey-9'" @click="toggleMute").q-mr-sm
            span.text-bold {{$t('mute')}}
          q-btn(style=`height: 50px; maxWidth: 100px; borderRadius: 4px` color="primary" no-caps @click="handleReady")
            span.text-bold {{$t('next')}}
        //- div(style=`minHeight: 400px`).row.full-width.br
        //-   //- canvas(ref="kcanvas" crossorigin="Anonymous")
        //-   img(v-if="preview" :src="preview" width="100%" height="100%" crossorigin="Anonymous")
        //- debug
        div(v-if="false" :style=`{position: 'relative', width: videoWidth+'px', height: '150px'}`).row.justify-center.items-start.content-start.bg-green-1
          span.full-width debug:
          small.full-width start: {{startSec}}
          small.full-width end: {{endSec}}
          small.full-width now: {{nowSec}}
</template>

<script>
export default {
  name: 'videoEditor',
  meta: {
    title: 'Kalpa video editor'
  },
  props: {
    fragment: {type: Object}
  },
  data () {
    return {
      tick: 0,
      loading: false,
      dragging: false,
      draggingTarget: '',
      loop: true,
      muted: false,
      framesLeft: 0,
      startSec: 0,
      nowSec: 0,
      endSec: 180,
      player: null,
      videoWidthMax: 640,
      fragmentWidthSecMax: 180,
      fragmentWidthPxMax: 640,
      preview: null
    }
  },
  computed: {
    videoWidth () {
      let w = this.$q.screen.width
      if (w <= this.videoWidthMax) return w
      else return this.videoWidthMax
    },
    videoHeight () {
      return this.videoWidth * 0.56
    },
    framesWidth () {
      return this.secToPx(this.fragment.content.duration)
    },
    frameWidth () {
      // this.videoWidth / 18
      return this.framesWidth / (this.fragment.content.frameUrls.length / 10)
    },
    framesFilter () {
      // return this.fragment.content.frameUrls
      return this.fragment.content.frameUrls.filter((f, fi) => {
        return fi % 10 === 0
      })
    },
    getLabelOffset () {
      let d = this.secToPx(this.endSec - this.startSec)
      if (d < 250) {
        return -(10 + 130)
      } else {
        return -10
      }
    }
  },
  watch: {
    startSec: {
      handler (to, from) {
        if (this.player) this.player.setCurrentTime(to)
      }
    },
    dragging: {
      async handler (to, from) {
        this.$log('dragging CHANGED ', to)
        if (to === true) return
        await this.$wait(350)
        this.framesAnimate()
      }
    }
  },
  methods: {
    getTime (sec) {
      let hrs = ~~(sec / 3600)
      let mins = ~~((sec % 3600) / 60)
      let secs = ~~sec % 60
      let arr = sec.toString().split('.')
      let ms = ''
      if (arr.length > 1) ms = arr[1]

      let ret = ''
      if (hrs > 0) ret += '' + hrs + ':' + (mins < 10 ? '0' : '')

      ret += '' + mins + ':' + (secs < 10 ? '0' : '')
      ret += '' + secs
      if (ms !== '') ret += ':' + ms.substring(0, 3)
      return ret
    },
    handleReload () {
      this.$log('handleReload')
      window.location.reload(true)
    },
    async handleReady () {
      this.$log('handleReady')
      this.player.setCurrentTime(this.startSec)
      this.player.pause()
      await this.$wait(500)
      this.fragment.relativePoints = [{x: this.startSec}, {x: this.endSec}]
      // create preview of startSec
      let canvas = document.createElement('canvas')
      canvas.width = this.videoWidth
      canvas.height = this.videoHeight
      let ctx = canvas.getContext('2d')
      ctx.drawImage(this.$refs.kvideo, 0, 0, canvas.width, canvas.height)
      this.preview = canvas.toDataURL()
      await this.$wait(500)
      // emit ready fragment
      this.$emit('ready', this.fragment, this.preview)
      this.$emit('close')
    },
    toggleMute () {
      this.$log('toggleMute')
      this.player.setMuted(!this.muted)
      this.muted = !this.muted
    },
    toggleLoop () {
      this.$log('toggleLoop')
      this.loop = !this.loop
    },
    pxToSec (px) {
      return px * this.fragmentWidthSecMax / this.videoWidth
    },
    secToPx (sec) {
      return sec * this.videoWidth / 180
    },
    timeUpdate (e) {
      this.nowSec = this.player.currentTime
      if (this.loop) {
        if (this.player.currentTime >= this.endSec) this.player.setCurrentTime(this.startSec)
      }
    },
    seeked (e) {
      // this.$log('seeked', e)
      if (this.dragging) return
      let nextStartSec = this.player.currentTime
      if (nextStartSec >= this.endSec) {
        this.startSec = this.player.currentTime
        let newEndSec = this.startSec + 180
        if (this.startSec + newEndSec > this.fragment.content.duration) {
          this.endSec = this.fragment.content.duration
        } else {
          this.endSec = newEndSec
        }
      } else {
        this.startSec = this.player.currentTime
        let d = this.endSec - this.startSec
        if (d >= 180) {
          this.endSec = this.startSec + 180
        }
      }
      this.framesAnimate()
    },
    framesAnimate () {
      this.$log('framesAnimate')
      let d = this.secToPx(this.endSec - this.startSec)
      let left = ((this.videoWidth - d) / 2) - this.secToPx(this.startSec)
      this.$tween.to(this, 0.66, {framesLeft: left})
    },
    framesDrag (e) {
      let ids = ['frame', 'frames']
      if (e.isFirst && ids.includes(e.evt.target.id)) this.draggingTarget = e.evt.target.id
      if (!ids.includes(this.draggingTarget)) return
      // this.$log('framesDrag', e)
      if (e.isFirst) this.dragging = true
      if (e.isFinal) {
        this.dragging = false
        this.draggingTarget = ''
      }
      let newStartSec = this.startSec - this.pxToSec(e.delta.x)
      let newEndSec = this.endSec - this.pxToSec(e.delta.x)
      if (newStartSec > 0 && newEndSec <= this.fragment.content.duration) {
        this.startSec = newStartSec
        this.endSec = newEndSec
        this.framesLeft += e.delta.x
      }
    },
    startDrag (e) {
      // this.$log('startDrag', e.delta.x)
      if (e.isFirst) this.dragging = true
      if (e.isFinal) this.dragging = false
      let newStartSec = this.startSec + this.pxToSec(e.delta.x)
      if (newStartSec >= 0 && this.endSec - newStartSec <= 180) {
        this.startSec = newStartSec
      }
    },
    async endDrag (e) {
      // this.$log('endDrag', e.delta.x)
      if (e.isFirst) this.dragging = true
      if (e.isFinal) this.dragging = false
      let newEndSec = this.endSec + this.pxToSec(e.delta.x)
      if (newEndSec > this.startSec && newEndSec - this.startSec <= 180 && this.endSec <= this.fragment.content.duration) {
        let nowSec = this.nowSec
        this.player.setCurrentTime(this.endSec)
        this.endSec = newEndSec
      }
    },
    totalDrag (e) {
      this.startDrag(e)
      this.endDrag(e)
    },
    startTickLeft () {
      this.$log('startTickLeft')
      let newStartSec = this.startSec - 0.100
      if (this.endSec - newStartSec > 180) this.startSec = this.endSec - 180
      else if (newStartSec >= 0) this.startSec = newStartSec
      else if (newStartSec < 0) this.startSec = 0
    },
    startTickRight () {
      this.$log('startTickRight')
      let newStartSec = this.startSec + 0.100
      if (this.endSec - newStartSec > 180) this.startSec = this.endSec - 180
      else if (newStartSec < this.endSec && newStartSec < this.fragment.content.duration) this.startSec = newStartSec
    },
    endTickLeft () {
      this.$log('endTickLeft')
      let newEndSec = this.endSec - 0.100
      if (newEndSec - this.startSec > 180) this.endSec = this.startSec + 180
      else if (newEndSec > this.startSec && newEndSec > 0) this.endSec = newEndSec
    },
    endTickRight () {
      this.$log('endTickRight')
      let newEndSec = this.endSec + 0.100
      if (newEndSec - this.startSec > 180) this.endSec = this.startSec + 180
      else if (newEndSec <= this.fragment.content.duration) this.endSec = newEndSec
      else if (newEndSec > this.fragment.content.duration) this.endSec = this.fragment.content.duration
    },
    async getVideo (oid) {
      this.$log('getVideo start')
      console.time('getVideo')
      // get video by oid
      let { data: { objectList } } = await this.$apollo.query({
        query: gql`
          query getVideo ($oid: OID!) {
            objectList(oids: [$oid]) {
              oid
              type
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
      this.$log('getVideo done', objectList[0])
      this.$emit('fragment', {...this.fragment, ...{content: objectList[0]}})
      this.$set(this, 'tick', this.tick + 1)
      console.timeEnd('getVideo')
    },
    startVideo () {
      this.$log('startVideo')
      let p = new window.MediaElementPlayer(this.$refs.kvideo, {
        loop: true,
        autoplay: false,
        controls: true,
        showPosterWhenPaused: false,
        clickToPlayPause: true,
        iPadUseNativeControls: false,
        iPhoneUseNativeControls: false,
        AndroidUseNativeControls: false,
        success: async (mediaElement, originalNode, instance) => {
          this.player = mediaElement
          this.player.addEventListener('timeupdate', this.timeUpdate, false)
          this.player.addEventListener('seeked', this.seeked, false)
          this.player.setCurrentTime(this.startSec)
          this.player.play()
          this.$log('START PLAYING')
        }
      })
    },
    getEnd () {
      this.$log('getEnd')
      let d = this.fragment.content.duration
      if (d <= this.endSec) this.endSec = d
    }
  },
  async mounted () {
    this.$log('mounted start')
    this.loading = true
    if (!this.fragment.content.oid) {
      this.$q.notify('No fragment.content.oid!!!')
    }
    // set startSec & endSec
    if (this.fragment.relativePoints && this.fragment.relativePoints.length > 0) {
      this.startSec = this.fragment.relativePoints[0]['x']
      this.endSec = this.fragment.relativePoints[1]['x']
    }
    await this.getVideo(this.fragment.content.oid)
    this.getEnd()
    this.fragment.relativeScale = this.fragment.content.duration
    this.loading = false
    this.framesAnimate()
    this.startVideo()
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.player.removeEventListener('timeupdate', this.timeUpdate)
    this.player.removeEventListener('seeked', this.seeked)
  }
}
</script>

<style lang="stylus">
.mejs__overlay-button
  display: none !important
.mejs__overlay-loading
  display: none !important
</style>
