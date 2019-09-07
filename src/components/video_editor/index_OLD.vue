<template lang="pug">
div(style=`position: relative; overflowX: hidden`).column.full-width.window-height.bg-white
  //- debug
  div(v-if="false && !loading" :style=`{position: 'fixed', zIndex: 10000, right: '0px', top: '50%', width: '300px', color: 'white', fontSize: '11px'}`).row.scroll.bg-purple.q-pa-xs
    small.full-width {{fragment.content.duration}}
    span.full-width startSec {{startSec}}
    span.full-width endSec {{endSec}}
    small.full-width width/height {{$q.screen.width}}/{{$q.screen.height}}
    small.full-width videoWidthMax/videoHeightMax {{videoWidthMax}}/{{videoHeightMax}}
    small.full-width videoWidth/videoWidthOriginal {{videoWidth}}/{{videoWidthOriginal}}
    small.full-width videoHeight/vidoeHeightOriginal {{videoHeight}}/{{videoHeightOriginal}}
    small.full-width framesCount {{framesCount}}
    small.full-width framesCountNew {{framesCountNew}}
    small.full-width framesLess {{framesLess}}
    small.full-width frameStartIndex {{frameStartIndex}}
    small.full-width frameWidthMax {{frameWidthMax}}
    //- small.full-width framesStart {{framesStart}}
    //- small.full-width framesEnd {{framesEnd}}
  //- loading
  div(v-if="loading" ).col.full-width
    .row.fit.items-center.justify-center
      q-spinner(size="50px" :thickness="2" color="primary")
  div(v-else).col.full-width
    .column.fit.bg-white
      //- header
      div(v-if="false" :style=`{height: '60px', borderBottom: '1px solid #eee'}`).row.full-width.justify-between.items-center.q-px-sm
        q-btn(round flat color="grey-9" icon="keyboard_arrow_left" @click="goBackClick()").q-mr-sm
        div(style=`{overflowX: auto}`).col.scroll
          span(style=`whiteSpace: nowrap`).text-bold {{ fragment.content.name }}
        //- q-btn(round flat color="grey-9" icon="link" @click="contentLinkClick()").q-ml-sm
      //- body
      div.col.full-width
        //- div(:style=`{position: 'relative', maxHeight: '100%'}`).row.fit.justify-center
          //- video wrapper
        //- video(:src="fragment.content.url" :style=`{height: '100%', width: '100%'}` type="video/mp4").br
        //- video(ref="kvideo"
        //-   :style=`{height: '100%', objectFit: 'contain'}`
        //-   playsinline preload="auto" crossorigin="Anonymous"
        //-   type="video/mp4" :src="fragment.content.url").bg-white
          //- img(v-if="preview" :src="preview")
          //- actions
          //- div(v-if="true" :style=`{position: 'absolute', zIndex: 100, bottom: '10px', height: '50px'}`).row.full-width.justify-center.items-center.q-px-sm
          //-   div(:style=`{width: videoWidth+'px'}`).row.justify-center.items-center
          //-     q-btn(style=`height: 40px; width: 100px` dense color="primary" @click="refresh" no-caps).q-mr-sm
          //-       span.text-bold {{'В начало'}}
          //-     q-btn(style=`height: 40px; width: 40px` :outline="!loop" no-caps icon="refresh" color="primary" @click="toggleLoop").q-mr-sm
          //-     q-btn(style=`height: 40px; width: 110px` :outline="mute" no-caps color="primary" @click="toggleMute")
          //-       span.text-bold {{mute ? 'Без звука' : 'Со звуком'}}
      //- fragments wrapper
      div(:style=`{height: '70px'}`).row.full-width.justify-center
        div(:style=`{position: 'relative', maxWidth: videoWidth+'px'}`).row.full-width
          //- frames bar
          div(
            :style=`{position: 'absolute', zIndex: 100, left: framesLeft+'px', width: framesWidth+'px', height: '50px', top: '10px', borderRadius: '4px'}`).row.no-wrap
            //- frames
            div(v-touch-pan.mouse.stop="framesDrag" :style=`{zIndex: 100, borderRadius: '4px', overflow: 'hidden'}`).row.fit
              div(
                v-for="(f, fi) in frames" :key="fi"
                :style=`{width: frameWidth+'px', height: '50px', overflow: 'hidden'}`
                ).row.items-center.justify-center.bg-grey-4
                img(height="50px" :src="f" draggable="false" :style=`{objectFit: 'cover'}`)
            //- frame
            div(
              :style=`{position: 'absolute', zIndex: 90, left: secToPx(startSec)+'px', top: '-5px', width: secToPx(endSec-startSec)+'px',
                borderRadius: '5px', height: '60px', border: '5px solid #027BE3'}`).row
            //- start
            div(
              v-touch-pan.mouse="startDrag"
              :style=`{position: 'absolute', zIndex: 200, top: '-5px', left: secToPx(startSec)-20+'px', width: '40px', height: '60px', cursor: 'e-resize'}`
                ).row.justify-center
              div(:style=`{height: '60px', width: '8px', borderRadius: '5px 0px 0px 5px'}`).row.bg-primary
            //- start zoom
            div(
              v-show="dragging && draggingTarget === 'start'"
              :style=`{position: 'absolute', zIndex: 200, top: -60+'px', height: '50px', borderRadius: '4px',
                left: secToPx(startSec)+'px', marginLeft: -frameWidthMax*(framesStart.length/2)+'px', overflow: 'hidden'}`
              ).row.justify-center.bg-grey-4
              div(:style=`{borderRadius: '4px', overflow: 'hidden'}`).row.full-width.justify-start.nowrap
                div(
                  v-for="(f, fi) in framesStart" :key="fi"
                  :style=`{width: frameWidthMax+'px', height: '50px', overflow: 'hidden'}`
                  ).row.bg-grey-4
                  img(height="50px" width="100%" :src="f" draggable="false" @error="frameError" style=`objectFit: cover`)
            //- end
            div(
              v-touch-pan.mouse="endDrag"
              :style=`{position: 'absolute', zIndex: 220, top: '-5px', left: secToPx(endSec)-20+'px', width: '40px', height: '60px', cursor: 'e-resize'}`
                ).row.justify-center
              div(:style=`{height: '60px', width: '8px', borderRadius: '0px 5px 5px 0px'}`).row.bg-primary
            //- end zoom
            div(
              v-show="dragging && draggingTarget === 'end'"
              :style=`{position: 'absolute', zIndex: 200, top: -60+'px', height: '50px', borderRadius: '4px',
                left: secToPx(endSec)+'px', marginLeft: -frameWidthMax*(framesEnd.length/2)+'px', overflow: 'hidden'}`
              ).row.justify-center.bg-grey-4
              div(:style=`{borderRadius: '4px'}`).row.full-width.justify-start.nowrap
                div(
                  v-for="(f, fi) in framesEnd" :key="fi"
                  :style=`{width: frameWidthMax+'px', height: '50px'}`
                  ).row.bg-grey-4
                  img(height="50px" width="100%" :src="f" draggable="false" @error="frameError" style=`objectFit: cover`)
            //- add
            div(
              v-show="false"
              :style=`{position: 'absolute', zIndex: 200, top: -5+'px', left: secToPx(endSec)+10+'px', width: '60px', height: '60px',
                borderRadius: '4px', opacity: 0.5}`
              ).row.items-center.justify-center.bg-primary
              q-btn(round dense flat icon="add" color="white")
            //- now
            div(
              v-show="!dragging"
              :style=`{position: 'absolute', zIndex: 190, left: secToPx(nowSec)+'px', width: '4px', height: '50px'}`).row.bg-yellow
      //- footer
      div(v-if="true" :style=`{height: '66px'}`).row.full-width.justify-center.items-center.q-px-sm
        div(:style=`{width: videoWidth+'px'}`).row.justify-center
          q-btn(style=`height: 50px; maxWidth: 550px; borderRadius: 8px` color="primary" no-caps @click="handleReady").full-width
            span.text-bold {{$t('Готово')}}
      //- debug
      div(v-if="false" style=`color: white; fontSize: 10px; maxHeight: 30vh`).row.full-width.bg-purple.q-pa-xs.scroll
        small.full-width {{ fragment }}
</template>

<script>
// TODO: when seeking with video controls and more than endSec...

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
      loading: true,
      dragging: false,
      draggingTarget: '',
      loop: true,
      mute: false,
      framesLeft: 0,
      startSec: 0,
      nowSec: 0,
      endSec: 180,
      player: null,
      fragmentLengthMax: 180,
      preview: null
    }
  },
  computed: {
    videoWidthMax () {
      let w = this.$q.screen.width
      if (w < 600) return w - 20
      else return w - 100
    },
    videoHeightMax () {
      return this.$q.screen.height - 60 - 150 - 66 - 20
    },
    videoWidthOriginal () {
      return this.fragment.content.width
    },
    videoHeightOriginal () {
      return this.fragment.content.height
    },
    videoWidth () {
      let w = this.$q.screen.width
      if (w >= this.videoWidthMax) return this.videoWidthMax
      else return w
    },
    videoHeight () {
      let h = this.videoHeightOriginal * this.videoWidth / this.videoWidthOriginal
      if (h <= this.videoHeightMax) return h
      return this.videoHeightMax
    },
    frames () {
      return this.fragment.content.frameUrls || []
      // if (!this.fragment.content.frameUrls) return []
      // let newCount = this.framesWidth / this.frameWidth
      // return this.fragment.content.frameUrls.filter((f, i) => {
      //   return i % this.framesLess === 0
      // })
    },
    framesWidth () {
      return this.secToPx(this.fragment.content.duration)
    },
    framesLess () {
      return Math.floor(this.framesCount / this.framesCountNew)
    },
    framesCountNew () {
      return Math.floor(this.framesWidth / this.frameWidth)
    },
    framesCount () {
      return this.fragment.content.frameUrls.length
    },
    frameWidthMax () {
      return Math.floor((this.videoWidthOriginal * 50) / this.videoHeightOriginal)
    },
    frameWidth () {
      // return this.framesWidth / this.framesCount
      return this.frameWidthMax / 3
    },
    frameSec () {
      return this.pxToSec(this.frameWidth)
    },
    frameStartIndex () {
      return Math.round(this.startSec / this.frameSec)
    },
    framesStart () {
      return this.frames.filter((f, fi) => {
        return fi > this.frameStartIndex - 4 && fi < this.frameStartIndex + 4
      })
    },
    framesEndIndex () {
      return Math.round(this.endSec / this.frameSec)
    },
    framesEnd () {
      return this.frames.filter((f, fi) => {
        return fi > this.framesEndIndex - 4 && fi < this.framesEndIndex + 4
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
        if (to < 0) {
          this.$log('startSec < 0!')
          this.startSec = 0
        }
      }
    },
    endSec: {
      handler (to, from) {
        if (to > this.fragment.content.duration) {
          this.$log('endSec > duration!')
          this.endSec = this.fragment.content.duration
        }
      }
    },
    dragging: {
      async handler (to, from) {
        this.$log('dragging CHANGED ', to)
        if (to === true) return
        await this.$wait(350)
        if (this.dragging === true) return
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
      canvas.width = this.videoWidthOriginal
      canvas.height = this.videoHeightOriginal
      let ctx = canvas.getContext('2d')
      ctx.drawImage(this.$refs.kvideo, 0, 0, canvas.width, canvas.height)
      this.fragment.preview = canvas.toDataURL()
      this.$emit('fragment', this.fragment)
      await this.$wait(500)
      // emit ready fragment
      this.$emit('ready', this.fragment, this.preview)
    },
    toggleMute () {
      this.$log('toggleMute')
      this.player.setMuted(!this.mute)
      this.mute = !this.mute
    },
    toggleLoop () {
      this.$log('toggleLoop')
      this.loop = !this.loop
    },
    refresh () {
      this.$log('refresh')
      this.player.setCurrentTime(this.startSec)
    },
    goBackClick () {
      this.$log('goBackClick')
      this.handleReady()
    },
    pxToSec (px) {
      return px * this.fragmentLengthMax / this.videoWidth
    },
    secToPx (sec) {
      return sec * this.videoWidth / this.fragmentLengthMax
    },
    timeUpdate (e) {
      let playerTime = this.player.currentTime
      this.nowSec = playerTime
      if (playerTime >= this.endSec) {
        if (this.loop) this.player.setCurrentTime(this.startSec)
        else this.player.pause()
      }
    },
    seeked (e) {
      this.$log('seeked')
      if (this.dragging) return
      let nextStartSec = this.player.currentTime
      if (nextStartSec >= this.endSec) {
        this.$log('seeked MORE THAN END SEC', nextStartSec, this.endSec)
        this.startSec = this.player.currentTime
        let newEndSec = this.startSec + this.fragmentLengthMax
        if (this.startSec + newEndSec > this.fragment.content.duration) {
          this.endSec = this.fragment.content.duration
        } else {
          this.endSec = newEndSec
        }
      } else {
        this.$log('seeked LESS THAN END SEC', nextStartSec, this.endSec)
        // this.startSec = nextStartSec
        // let d = this.endSec - this.startSec
        // if (d >= this.fragmentLengthMax) {
        //   // this.$log('seeked ')
        //   this.endSec = this.startSec + this.fragmentLengthMax
        // }
      }
      this.framesAnimate()
    },
    frameError (e) {
      this.$log('frameError', e)
    },
    framesAnimate () {
      this.$log('framesAnimate')
      let d = this.secToPx(this.endSec - this.startSec)
      let left = ((this.videoWidth - d) / 2) - this.secToPx(this.startSec)
      this.$tween.to(this, 0.66, {framesLeft: left})
    },
    framesDrag (e) {
      // this.$log('framesDrag', e.delta.x)
      if (!this.loop) this.player.pause()
      if (e.isFirst) {
        this.$log('framesDrag FIRST')
        this.dragging = true
        this.draggingTarget = 'frames'
      }
      if (e.isFinal) {
        this.$log('framesDrag FINAL')
        this.dragging = false
        this.draggingTarget = ''
      }
      let d = e.delta.x
      let newStartSec = this.startSec - this.pxToSec(d)
      let newEndSec = this.endSec - this.pxToSec(d)
      if (newStartSec >= 0 && newEndSec <= this.fragment.content.duration) {
        this.startSec = newStartSec
        this.endSec = newEndSec
        this.framesLeft += e.delta.x
      }
    },
    startDrag (e) {
      // this.$log('startDrag', e.delta.x)
      if (!this.loop) this.player.pause()
      if (e.isFirst) {
        this.dragging = true
        this.draggingTarget = 'start'
        this.$log('startDrag FIRST')
      }
      if (e.isFinal) {
        this.dragging = false
        this.draggingTarget = ''
        this.$log('startDrag FINAL')
      }
      let d = e.delta.x
      let newStartSec = this.startSec + this.pxToSec(d)
      if (newStartSec >= 0 && this.endSec - newStartSec <= this.fragmentLengthMax && newStartSec < this.endSec) {
        this.startSec = newStartSec
      }
    },
    async endDrag (e) {
      // this.$log('endDrag', e.delta.x)
      if (!this.loop) this.player.pause()
      if (e.isFirst) {
        this.$log('endDrag FIRST')
        this.dragging = true
        this.draggingTarget = 'end'
      }
      if (e.isFinal) {
        this.$log('endDrag FINAL')
        this.dragging = false
        this.draggingTaget = ''
      }
      let d = e.delta.x
      let newEndSec = this.endSec + this.pxToSec(d)
      if (newEndSec > this.startSec && newEndSec - this.startSec <= this.fragmentLengthMax && newEndSec <= this.fragment.content.duration) {
        this.endSec = newEndSec
        this.player.setCurrentTime(newEndSec - 2)
      }
    },
    async getFrames (oid) {
      this.$log('getFrames start')
      console.time('getFrames')
      // get video by oid
      let { data: { objectList: [{frameUrls, duration}] } } = await this.$apollo.query({
        query: gql`
          query getVideo ($oid: OID!) {
            objectList(oids: [$oid]) {
              ... on Video {
                frameUrls
                duration
              }
            }
          }
        `,
        variables: {
          oid: oid
        }
      })
      // this.$log('getFrames done', frameUrls)
      this.$set(this.fragment.content, 'frameUrls', frameUrls)
      this.$set(this.fragment.content, 'duration', duration)
      this.$emit('fragment', this.fragment)
      console.timeEnd('getFrames')
    },
    startVideo () {
      this.$log('startVideo START')
      let p = new window.MediaElementPlayer(this.$refs.kvideo, {
        loop: true,
        autoplay: false,
        controls: true,
        stretching: 'fill',
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
          this.$log('startVideo DONE')
        }
      })
    },
    getEndSec () {
      // this.$log('getEndSec')
      let d = this.fragment.content.duration
      if (d <= this.endSec) return d
      else return this.fragmentLengthMax
    },
    contentLinkClick () {
      this.$log('contentLinkClick')
    }
  },
  async mounted () {
    this.$log('mounted start', this.fragment)
    this.loading = true
    // set startSec & endSec
    // TODO: move startSec and endSec to computed props
    if (this.fragment.relativePoints && this.fragment.relativePoints.length > 0) {
      this.startSec = this.fragment.relativePoints[0]['x']
      this.endSec = this.fragment.relativePoints[1]['x']
    }
    await this.getFrames(this.fragment.content.oid)
    this.endSec = this.getEndSec()
    // this.fragment.relativeScale = this.fragment.content.duration
    this.loading = false
    this.$nextTick(() => {
      this.framesAnimate()
      this.startVideo()
    })
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    if (this.player) {
      this.player.removeEventListener('timeupdate', this.timeUpdate)
      this.player.removeEventListener('seeked', this.seeked)
    }
  }
}
</script>

<style lang="stylus">
.mejs__overlay-button
  display: none !important
.mejs__overlay-loading
  display: none !important
</style>
