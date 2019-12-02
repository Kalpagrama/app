<template lang="pug">
div(v-if="!loading" :style=`{position: 'relative', overflow: 'hidden'}`).row.fit.justify-center.bg-black
  q-resize-observer(@resize="onResize")
  //- loading
  div(v-if="!framesLoadedAll" :style=`{position: 'absolute', zIndex: 10000, top: 0, left: 0, pointerEvents: 'none'}`).row.fit.items-center.justify-center
    q-spinner(:thickness="5" color="primary" size="100px")
  //- //- fragment menu ?
  //- k-dialog(ref="menuLeftDialog")
  //-   menu-left(:fragment="fragment" :duration="duration" :fragmentsVisible="fragmentsVisible")
  //- video
  video(
    ref="kvideo" :src="fragmentInput.content.url" playsinline :showControls="true" type="video/mp4" crossorigin="Anonymous" :muted="muted"
    :style=`{height: '100%', width: '100%', objectFit: 'contain'}` @load="videoLoaded"
    @seeked="videoSeeked"
    @click="videoClick" @playing="videoPlaying" @timeupdate="videoTimeupdate")
  //- actions
  q-btn(v-if="inCreator" no-caps color="primary" icon="clear" @click="cancel()"
    :style=`{position: 'absolute', zIndex: 1000, height: '60px', top: '10px', left: '10px', width: '60px', borderRadius: '10px', opacity: 0.8}`)
  q-btn(v-if="inCreator" no-caps color="primary" icon="check" @click="ready()"
    :style=`{position: 'absolute', zIndex: 1000, height: '60px', top: '10px', right: '10px', width: '60px', borderRadius: '10px'}`)
  q-btn(v-if="inCreator" round color="accent" icon="add" @click="pointCreate()"
    :style=`{position: 'absolute', zIndex: 1000, right: '14px', bottom: '14px'}`)
  //- --------------
  //- menu-time-menu
  div(v-show="duration > 0" :style=`{position: 'absolute', zIndex: 200, bottom: timelineBottom+160+'px', height: '50px', opacity: 0.6}`
    ).row.full-width.items-center.justify-between.q-px-md
    //- actions left
    div(:style=`{minWidth: '80px'}`).row.full-height.items-center
      //- q-btn(round flat icon="menu" color="white" @click="menuLeftToggle()").bg-grey-9
      q-btn(round flat :icon="timelineBottom === 0 ? 'keyboard_arrow_down' : 'keyboard_arrow_up'" color="white" @click="timelineToggle()").bg-grey-9.q-mr-sm
    //- time
    .col
      .row.full-width.justify-center
        div(:style=`{height: '40px', borderRadius: '10px', border: framesSynced ? '2px solid #5f277a' : 'none'}` @click="framesSynced = !framesSynced"
          ).row.items-center.bg-grey-9.q-px-sm.cursor-pointer
          span(style=`user-select: none`).text-white {{ $time(now) }}/{{ $time(duration) }}
    //- actions right
    div(:style=`{minWidth: '80px'}`).row.full-height.items-center.justify-end
      q-btn(round flat :icon="muted ? 'volume_off' : 'volume_up'" color="white" @click="mutedToggle()").bg-grey-9.q-ml-sm
      //- q-btn(round flat icon="menu" color="white").bg-grey-9
  //- ----
  div(:style=`{position: 'absolute', bottom: '200px', zIndex: 1000, height: '40px', paddingLeft: '30px', paddingRight: '30px'}`).row.full-width.items-center
    div(:style=`{height: '14px', borderRadius: '7px', overflow: 'hidden'}`).row.full-width.bg-red
      div(:style=`{width: now/duration*100+'%'}`).row.bg-accent
  //- -----------------------
  //- fragment points wrapper
  div(v-if="fragment && timelineBottom === 0" :style=`{position: 'absolute', bottom: timelineBottom+82+'px', height: '80px', paddingLeft: width/2+'px'}`).row.full-width
    //- fragment point
    div(
      v-for="(p, pi) in fragment.relativePoints"
      :style=`{position: 'absolute', top: pointFirst(pi) ? '0px' : '40px', zIndex: 400, height: pointFirst(pi) ? '146px' : '106px', width: '1px',
        left: -framesScrollLeft+width/2+(p.x*k)+'px', background: $randomColor(pointFirst(pi) ? pi : pi+1)}`).row
        //- rectangle left
        //- div(
        //-   v-if="pointFirst(pi)"
        //- )
        //- div(
        //-   v-if="pointFirst(pi)"
        //-   :style=`{
        //-     position: 'absolute', bottom: '0px', height: '50px', background: $randomColor(pi), opacity: 0.5, pointerEvents: 'none',
        //-     left: fragment.relativePoints[pointFirst(pi) ? pi + 1 : pi]['x'] > fragment.relativePoints[pointFirst(pi) ? pi : pi - 1]['x'] ? '0px' : -Math.abs(k*(fragment.relativePoints[pointFirst(pi) ? p - 1 : pi]['x'] - fragment.relativePoints[pointFirst(pi) ? pi : pi + 1]['x']))+'px',
        //-     width: Math.abs(k*(fragment.relativePoints[pointFirst(pi) ? pi + 1 : pi]['x'] - fragment.relativePoints[pointFirst(pi) ? pi : pi - 1]['x']))+'px'
        //-     }`).row
        //- circle
        div(
          v-touch-pan.mouse.stop="$event => pointDrag(p, pi, $event)"
          :style=`{
            position: 'absolute', top: '-1px', left: '-20px',
            width: '40px', height: '40px', borderRadius: '50%', background: $randomColor(pointFirst(pi) ? pi : pi+1, 0.5)
          }`
          ).row.items-center.justify-center.cursor-pointer
          span(style=`user-select: none`).text-white.text-bold {{ pointFirst(pi) ? pi : pi+1 }}
  //- --------
  //- timeline
  div(:style=`{position: 'absolute', bottom: timelineBottom+'px', height: '82px'}`).row.full-width.justify-center.items-center.content-center
    //- frames
    div(ref="kframes" :style=`{position: 'relative'}` v-touch-pan.mouse.stop="framesDrag" @scroll="framesScroll" body-scroll-lock-ignore).row.full-width.scroll
      div(:style=`{borderRadius: '10px', marginTop: '16px', marginBottom: '16px'}`).row.no-wrap
        //- left box for padding
        div(:style=`{height: '50px', width: width/2+'px'}`).row
        //- frames wrapper no-wrap :)
        div(:style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden'}`).row.no-wrap.shadow-9
          //- frame
          div(
            v-for="(f, fi) in frames" :key="f" @click="$event => frameClick(f, fi, $event)"
            :style=`{height: '50px'}`
            ).row.items-center.justify-center.bg-black
            //- frame img
            img(:src="f" draggable="false" :style=`{height: '50px', objectFit: 'cover', userSelect: 'none'}` @load="frameLoaded")
          div(:style=`{position: 'absolute', left: now*k+'px', width: '5px', height: '50px'}`).row.bg-primary
        //- right box for padding
        div(:style=`{height: '50px', width: width/2+'px'}`).row
</template>

<script>
import menuLeft from './menu_left'
import menuRight from './menu_right'

export default {
  name: 'videoEditor',
  components: {menuLeft, menuRight},
  props: {
    fragmentInput: {
      type: Object
    },
    inCreator: {
      type: Boolean,
      default () {
        return false
      }
    }
  },
  data () {
    return {
      loading: false,
      width: 0,
      height: 0,
      playing: false,
      duration: 0,
      muted: true,
      now: 0,
      frames: [],
      fragmentMaxLength: 60,
      framesLoaded: 0,
      framesLoadedAll: false,
      framesLeft: 0,
      framesScrollLeft: 0,
      framesScrollWidth: 0,
      framesSynced: false,
      framesDragging: false,
      frameClicks: 0,
      fragment: null,
      clicks: 0,
      clickDelay: 300,
      clickTimer: null,
      pointsVisible: [],
      timelineBottom: 0
    }
  },
  computed: {
    framesCount () {
      return this.frames.length
    },
    framesMiddle () {
      return (this.width / 2) + this.framesScrollLeft
    },
    frameDuration () {
      return Math.round(this.duration / this.framesCount)
    },
    k () {
      return this.framesScrollWidth / this.duration
    }
  },
  watch: {
    now: {
      handler (to, from) {
        // this.$logD('now CHANGED', to)
        if (this.$refs.kframes && this.framesSynced) {
          this.$tween.to(this.$refs.kframes, 0.4, {scrollLeft: (to * this.k)})
        }
        // if (this.fragment) {
        //   // this.$logD('now GOT FRAGMENT')
        //   if (to > this.fragment.relativePoints[1]['x']) {
        //     // this.$logD('now START AGAIN')
        //     this.$refs.kvideo.currentTime = this.fragment.relativePoints[0]['x']
        //   }
        // }
      }
    }
  },
  methods: {
    fragmentPreview (f) {
      this.$logD('fragmentPreview', f)
      this.$set(this, 'fragment', f)
      this.framesSynced = true
      this.$refs.kvideo.currentTime = f.relativePoints[0]['x']
      this.$refs.kvideo.play()
    },
    fragmentToggle (f, fkey) {
      this.$logD('fragmentToggle', f)
      if (this.fragmentsVisible[f.uid]) {
        this.$delete(this.fragmentsVisible, f.uid)
      } else {
        this.$set(this.fragmentsVisible, f.uid, true)
      }
    },
    onResize (e) {
      this.$logD('onResize', e)
      this.$set(this, 'width', e.width)
      this.$set(this, 'height', e.height)
    },
    get (key) {
      return this[key]
    },
    pointFirst (i) {
      let index = i + 1
      return index % 2 === 0
    },
    pointCreate () {
      this.$logD('pointCreate')
      this.fragment.relativePoints.push({x: this.now})
      let to = this.now + 3
      if (to <= this.duration) this.fragment.relativePoints.push({x: to})
      else this.fragment.relativePoints.push({x: this.duration})
    },
    pointClick (fi, pi, e) {
      this.$logD('pointClick', fi, pi, e)
      this.pointActive = `${fi + pi}`
    },
    pointStop () {
      this.$logD('pointStop')
      clearInterval(this.pointInterval)
      this.pointInterval = false
    },
    pointDrag (p, pi, e) {
      // this.$logD('pointDrag', e)
      let pos = e.position.left
      // right
      if (this.width - pos < 80 && e.direction === 'right') {
        this.$logD('RIGHT')
        if (!this.pointInterval) {
          this.pointInterval = setInterval(() => {
            this.$refs.kframes.scrollLeft += e.delta.x
            pointSet()
          }, 20)
        }
      } else if (pos < 80 && e.direction === 'left') {
        this.$logD('LEFT')
        if (!this.pointInterval) {
          this.pointInterval = setInterval(() => {
            this.$refs.kframes.scrollLeft += e.delta.x
            pointSet()
          }, 20)
        }
      } else {
        this.pointStop()
      }
      // first
      if (e.isFirst) {
      }
      // final
      if (e.isFinal) {
        this.$logD('FINAL FINAL FINAL')
        // if (this.fragment.relativePoints[0]['x'] > f.relativePoints[1]['x']) f.relativePoints.reverse()
        this.pointStop()
      }
      // point set
      const pointSet = () => {
        let from = this.fragment.relativePoints[pi]['x']
        let to = from + (e.delta.x / this.k)
        if (to >= 0 && to <= this.duration) {
          this.$set(this.fragment.relativePoints[pi], 'x', to)
          this.$refs.kvideo.currentTime = to
        }
      }
      pointSet()
    },
    async framesDrag (e) {
      // this.$logD('framesDrag', e)
      if (e.isFirst) {
        this.framesDragging = true
      }
      if (e.isFinal) {
        await this.$wait(600)
        this.framesDragging = false
      }
      if (this.$q.screen.gt.sm) {
        this.$refs.kframes.scrollLeft -= e.delta.x
      }
    },
    framesScroll (e) {
      // this.$logD('framesScroll', e.target.scrollLeft)
      this.framesScrollLeft = e.target.scrollLeft
    },
    frameLoaded (e) {
      // this.$logD('frameLoaded')
      this.framesLoaded++
      if (this.framesLoaded === this.framesCount) {
        this.$logD('frames LOADED!')
        if (this.$refs.kframes) this.$tween.to(this, 0.5, {framesScrollWidth: this.$refs.kframes.scrollWidth - this.width})
        // scroll frames to the left
        this.$tween.to(this.$refs.kframes, 0.5, {scrollLeft: (this.width / 2) - 10})
        this.framesLoadedAll = true
        if (this.$refs.kvideo) this.$refs.kvideo.play()
      }
    },
    frameClick (f, fi, e) {
      this.$logD('frameClick', fi, e)
      if (this.framesDragging) return
      let time = this.frameDuration * (fi) + this.frameDuration / 2
      this.$refs.kvideo.currentTime = time
      this.$logD('time', time)
      this.$tween.to(this.$refs.kframes, 0.5, {scrollLeft: (time * this.k)})
    },
    videoSeeked (e) {
      this.$logD('videoSeeked', e)
    },
    videoClick (e) {
      // this.$logD('videoClick')
      // TODO: dbclick for forward/backward
      this.clicks++
      if (this.clicks === 1) {
        this.$logD('CLICK')
        this.clickTimer = setTimeout(() => {
          this.clicks = 0
        }, this.clickDelay)
        // job
        if (this.playing) {
          this.$refs.kvideo.pause()
          this.playing = false
        } else {
          this.$refs.kvideo.play()
          this.playing = true
        }
      } else {
        this.$logD('CLICK DB')
        clearTimeout(this.clickTimer)
        this.clicks = 0
        // job
        this.$refs.kvideo.currentTime = this.now += 10
      }
    },
    videoPlaying () {
      // this.$logD('videoPlaying')
      this.playing = true
      if (this.$refs.kvideo) this.duration = this.$refs.kvideo.duration
    },
    videoTimeupdate () {
      // this.$logD('videoTimeupdate')
      if (this.$refs.kvideo) this.now = this.$refs.kvideo.currentTime
    },
    videoLoaded (e) {
      this.$logD('videoLoaded', e)
    },
    videoPlayback () {
      this.$logD('videoPlayback')
      this.$refs.kvideo.playBackwards = function () {
        this.pause()
        var video = this
        var fps = 25
        var intervalRewind = setInterval(function () {
          if (video.currentTime === 0) {
            clearInterval(intervalRewind)
            video.pause();
          } else {
            video.currentTime += -(1 / fps)
          }
        }, 1000 / fps)
      }
    },
    async framesLoad (oid) {
      this.$logD('framesLoad start')
      let content = await this.$store.dispatch('objects/get', { oid, fragmentName: 'contentFragment', priority: 0 })
      // let { data: { objectList: [{frameUrls}] } } = await this.$apollo.query({
      //   query: gql`
      //     query getVideo3 ($oid: OID!) {
      //       objectList(oids: [$oid]) {
      //         ... on Video {
      //           frameUrls
      //         }
      //       }
      //     }
      //   `,
      //   variables: {
      //     oid: oid
      //   }
      // })
      this.$logD('framesLoad done')
      return content.frameUrls
    },
    timelineToggle () {
      this.$logD('timelineToggle')
      // -162
      if (this.timelineBottom === 0) {
        this.$tween.to(this, 0.5, {timelineBottom: -150})
      } else {
        this.$tween.to(this, 0.5, {timelineBottom: 0})
      }
    },
    menuLeftToggle () {
      this.$logD('menuLeftToggle')
      this.$refs.menuLeftDialog.toggle()
    },
    menuRightToggle () {
      this.$logD('menuRightToggle')
      this.$refs.menuRightDialog.toggle()
    },
    mutedToggle () {
      this.$logD('mutedToggle')
      this.muted = !this.muted
    },
    videoForwardTo (sec) {
      return new Promise(async (resolve, reject) => {
        this.$logD('videoForwardTo', sec)
        this.$refs.kvideo.currentTime = sec
        await this.$wait(1000)
        resolve()
      })
    },
    async ready () {
      this.$logD('ready start')
      // this.loading = true
      let video = this.$refs.kvideo
      video.pause()
      // create canvas
      let canvas = document.createElement('canvas')
      canvas.width = this.fragment.content.width
      canvas.height = this.fragment.content.height
      let ctx = canvas.getContext('2d')
      // loop fragments
      for (let i = 0; i < this.fragment.relativePoints.length; i++) {
        let index = i + 1
        if (index % 2 !== 0) {
          let point = this.fragment.relativePoints[i]
          await this.videoForwardTo(point.x)
          ctx.drawImage(this.$refs.kvideo, 0, 0, canvas.width, canvas.height)
          await this.$wait(1000)
          this.fragment.thumbUrl[i] = canvas.toDataURL('image/jpeg', 0.5)
        }
      }
      // this.loading = false
      this.$logD('ready done')
      this.$emit('fragment', this.fragment)
    },
    async cancel () {
      this.$logD('cancel start')
      this.fragment = null
      this.$logD('cancel done')
      this.$emit('fragment', this.fragmentInput)
    }
  },
  async mounted () {
    this.$logD('mounted')
    this.loading = true
    this.$set(this, 'frames', await this.framesLoad(this.fragmentInput.content.oid))
    this.$set(this, 'fragment', JSON.parse(JSON.stringify(this.fragmentInput)))
    this.loading = false
  },
  beforeDestroy () {
    this.$logD('beforeDestroy')
  }
}
</script>

<style lang="stylus">
</style>
