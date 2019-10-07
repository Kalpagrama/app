<template lang="pug">
div(:style=`{position: 'relative', overflow: 'hidden'}`).row.fit.justify-center.bg-black
  q-dialog(ref="menuLeftDialog" :maximized="true" transition-show="slide-up" transition-hide="slide-down")
    div(@click.self="$refs.menuLeftDialog.hide()").row.fit.items-end.content-end.justify-center
      menu-left(
        :fragments="fragments" :fragmentsVisible="fragmentsVisible" :duration="duration"
        @toggle="fragmentToggle"
        @create="$event => $emit('create', $event)"
        @delete="$event => $emit('delete', $event)"
        @preview="fragmentPreview"
        @hide="$refs.menuLeftDialog.hide()"
        :style=`{maxWidth: '600px', maxHeight: 'calc(var(--vh, 1vh) * 100)', borderRadius: '10px 10px 0 0', overflow: 'hidden'}`)
  q-dialog(ref="menuRightDialog" :maximized="true")
    //- menu-right
  q-resize-observer(@resize="onResize")
  div(v-if="false" style=`position: absolute; pointerEvents: none; zIndex: 300; right: 16px; width: 350px; opacity: 0.4; borderRadius: 10px; maxHeight: 500px; top: 76px; color: white`
    ).row.bg-purple.q-pa-sm.scroll
    small(v-for="(d, di) in debug").full-width {{d}}:{{get(d)}}
  //- k-menu(ref="kmenu" :fragments="fragments" :colors="colors" :duration="duration")
  div(v-if="!framesLoadedAll" :style=`{position: 'absolute', zIndex: 10000, top: 0, left: 0, pointerEvents: 'none'}`).row.fit.items-center.justify-center
    q-spinner(:thickness="10" color="primary" size="200px")
  video(
    ref="kvideo" :src="content.url" playsinline type="video/mp4" crossorigin="Anonymous" :muted="muted"
    :style=`{height: '100%', width: '100%', objectFit: 'contain'}` @load="videoLoaded"
    @click="videoClick" @playing="videoPlaying" @timeupdate="videoTimeupdate").bg
  //- actions
  //- close with no changes!
  //- TODO: save initial state of fragments!
  q-btn(
    v-if="inEditor"
    round icon="clear" color="white" @click="ready()"
    :style=`{position: 'absolute', top: '16px', left: '16px', opacity: 0.5}`).bg-grey-9
  //- save changes
  q-btn(
    v-if="inEditor"
    round icon="check" color="primary" @click="ready()"
    :style=`{position: 'absolute', top: '16px', right: '16px', opacity: 0.8}`)
  q-btn(
    v-if="false"
    round dense color="green" icon="add" @click="$emit('create', {})"
    :style=`{position: 'absolute', zIndex: 1000, right: '10px', bottom: '24px'}`)
  //- menu-time-menu
  div(v-show="duration > 0" :style=`{position: 'absolute', zIndex: 200, bottom: timelineBottom+160+'px', height: '50px', opacity: 0.6}`
    ).row.full-width.items-center.justify-between.q-px-md
    //- actions left
    div(:style=`{minWidth: '80px'}`).row.full-height.items-center
      q-btn(round flat icon="menu" color="white" @click="menuLeftToggle()").bg-grey-9
      q-btn(round flat :icon="muted ? 'volume_off' : 'volume_up'" color="white" @click="mutedToggle()").bg-grey-9.q-ml-sm
    //- time
    .col
      .row.full-width.justify-center
        div(:style=`{height: '40px', borderRadius: '10px', border: framesSynced ? '2px solid #5f277a' : 'none'}` @click="framesSynced = !framesSynced"
          ).row.items-center.bg-grey-9.q-px-sm.cursor-pointer
          span(style=`user-select: none`).text-white {{ $time(now) }}/{{ $time(duration) }}
    //- actions right
    div(:style=`{minWidth: '80px'}`).row.full-height.items-center
      q-btn(round flat :icon="timelineBottom === 0 ? 'keyboard_arrow_down' : 'keyboard_arrow_up'" color="white" @click="timelineToggle()").bg-grey-9.q-mr-sm
      q-btn(round flat icon="menu" color="white" @click="menuRightToggle()").bg-grey-9
  //- relative points
  div(:style=`{position: 'absolute', bottom: timelineBottom+82+'px', height: '80px', paddingLeft: width/2+'px'}`).row.full-width
    div(v-for="(f, fkey, fi) in fragments" :key="fkey" v-show="fragmentsVisible[fkey]")
      div(v-for="(p, pi) in f.relativePoints"
        :style=`{position: 'absolute', top: '0px', zIndex: 400, height: '160px', width: '1px',
          left: -framesScrollLeft+width/2+(p.x*k)+'px', background: $randomColor(fkey)}`).row
          //- div(:style=`{position: 'absolute', bottom: '0px', height: '50px'}`).row.bg-red
          div(
            v-if="pi === 0 && f.label"
            :style=`{position: 'absolute', top: '-280px', left: '-20px', height: '300px', width: '40px', background: $randomColor(fkey), borderRadius: '20px 20px 0 0'}`
            ).row.items-center.justify-center
            span(:style=`{lineHeight: '100px'}`).text-white {{ f.label }}
          div(
            v-touch-pan.mouse.stop="$event => pointDrag(f, fkey, p, pi, $event)"
            :style=`{
              position: 'absolute', top: pi === 0 ? '0px' : '40px', left: '-20px',
              width: '40px', height: '40px', borderRadius: '50%', background: $randomColor(f.uid, 0.5)
            }`
            ).row.items-center.justify-center.cursor-pointer
            span(style=`user-select: none`).text-white.text-bold {{ fi+1 }}
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
            v-touch-hold.mouse="$event => frameHold(f, fi, $event)"
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
  props: ['content', 'fragments', 'inEditor'],
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
      clicks: 0,
      clickDelay: 300,
      clickTimer: null,
      fragment: null,
      fragmentsVisible: {},
      pointActive: undefined,
      pointDragging: undefined,
      pointDraggingHeight: 40,
      // debug: ['width', 'height', 'k', 'now', 'duration', 'framesCount', 'frameDuration', 'fragments', 'framesMiddle', 'framesScrollLeft', 'framesScrollWidth'],
      debug: ['fragment'],
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
        // this.$log('now CHANGED', to)
        if (this.$refs.kframes && this.framesSynced) {
          this.$tween.to(this.$refs.kframes, 0.4, {scrollLeft: (to * this.k)})
        }
        if (this.fragment) {
          // this.$log('now GOT FRAGMENT')
          if (to > this.fragment.relativePoints[1]['x']) {
            // this.$log('now START AGAIN')
            this.$refs.kvideo.currentTime = this.fragment.relativePoints[0]['x']
          }
        }
      }
    }
  },
  methods: {
    fragmentPreview (f) {
      this.$log('fragmentPreview', f)
      this.$set(this, 'fragment', f)
      this.framesSynced = true
      this.$refs.kvideo.currentTime = f.relativePoints[0]['x']
      this.$refs.kvideo.play()
    },
    fragmentToggle (f, fkey) {
      this.$log('fragmentToggle', f)
      if (this.fragmentsVisible[f.uid]) {
        this.$delete(this.fragmentsVisible, f.uid)
      } else {
        this.$set(this.fragmentsVisible, f.uid, true)
      }
    },
    onResize (e) {
      this.$log('onResize', e)
      this.$set(this, 'width', e.width)
      this.$set(this, 'height', e.height)
    },
    get (key) {
      return this[key]
    },
    pointClick (fi, pi, e) {
      this.$log('pointClick', fi, pi, e)
      this.pointActive = `${fi + pi}`
    },
    pointDrag (f, fkey, p, pi, e) {
      // this.$log('pointDrag', fkey, p, pi, e.delta.x)
      this.pointDragging = `${fkey}-${pi}`
      if (e.isFirst) {
        // this.$tween.to(this, 0.5, {pointDraggingHeight: 60})
        this.$set(this, 'fragment', f)
      }
      if (e.isFinal) {
        // this.$tween.to(this, 0.5, {pointDraggingHeight: 40})
        // this.pointActive = `${fi + pi}`
        if (f.relativePoints[0]['x'] > f.relativePoints[1]['x']) f.relativePoints.reverse()
        // this.$set(this, 'fragment', null)
      }
      let from = f.relativePoints[pi]['x']
      let to = from + (e.delta.x / this.k)
      if (to >= 0 && to <= this.duration) {
        this.$set(this.fragments[fkey].relativePoints[pi], 'x', to)
        this.$refs.kvideo.currentTime = to
      }
    },
    pointTickLeft (f, fkey, p, pi) {
      this.$log('pointTickLeft', f, fkey, p, pi)
      let from = f.relativePoints[pi]['x']
      let to = from - 0.1
      if (to >= 0 && to <= this.duration) {
        this.$set(this.fragments[fkey].relativePoints[pi], 'x', to)
        this.$refs.kvideo.currentTime = to
      }
    },
    pointTickRight (f, fkey, p, pi) {
      this.$log('pointTickRight', f, fkey, p, pi)
      let from = f.relativePoints[pi]['x']
      let to = from + 0.1
      if (to >= 0 && to <= this.duration) {
        this.$set(this.fragments[fkey].relativePoints[pi], 'x', to)
        this.$refs.kvideo.currentTime = to
      }
    },
    async framesDrag (e) {
      // this.$log('framesDrag', e)
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
      // this.$log('framesScroll', e.target.scrollLeft)
      this.framesScrollLeft = e.target.scrollLeft
    },
    frameLoaded (e) {
      // this.$log('frameLoaded')
      this.framesLoaded++
      if (this.framesLoaded === this.framesCount) {
        this.$log('frames LOADED!')
        if (this.$refs.kframes) this.$tween.to(this, 0.5, {framesScrollWidth: this.$refs.kframes.scrollWidth - this.width})
        this.framesLoadedAll = true
        if (this.$refs.kvideo) this.$refs.kvideo.play()
      }
    },
    frameClick (f, fi, e) {
      this.$log('frameClick', fi, e)
      if (this.framesDragging) return
      let time = this.frameDuration * (fi) + this.frameDuration / 2
      this.$refs.kvideo.currentTime = time
      this.$log('time', time)
      this.$tween.to(this.$refs.kframes, 0.5, {scrollLeft: (time * this.k)})
    },
    frameHold (f, fi, e) {
      this.$log('frameHold', e)
      let start = e.evt.target.offsetLeft / this.k
      let end = start + 5 < this.duration ? start + 5 : this.duration
      let uid = `${this.content.oid}-${Date.now()}`
      this.$log('start/end', start, end)
      let fragment = {uid: uid, relativePoints: [{x: start}, {x: end}]}
      this.$emit('create', fragment)
      this.fragmentToggle(fragment)
    },
    videoClick (e) {
      // this.$log('videoClick')
      // TODO: dbclick for forward/backward
      this.clicks++
      if (this.clicks === 1) {
        this.$log('CLICK')
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
        this.$log('CLICK DB')
        clearTimeout(this.clickTimer)
        this.clicks = 0
        // job
        this.$refs.kvideo.currentTime = this.now += 10
      }
    },
    videoPlaying () {
      // this.$log('videoPlaying')
      this.playing = true
      if (this.$refs.kvideo) this.duration = this.$refs.kvideo.duration
    },
    videoTimeupdate () {
      // this.$log('videoTimeupdate')
      if (this.$refs.kvideo) this.now = this.$refs.kvideo.currentTime
    },
    videoLoaded (e) {
      this.$log('videoLoaded', e)
    },
    videoPlayback () {
      this.$log('videoPlayback')
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
      this.$log('framesLoad start')
      let { data: { objectList: [{frameUrls}] } } = await this.$apollo.query({
        query: gql`
          query getVideo ($oid: OID!) {
            objectList(oids: [$oid]) {
              ... on Video {
                frameUrls
              }
            }
          }
        `,
        variables: {
          oid: oid
        }
      })
      this.$log('framesLoad done')
      return frameUrls
    },
    timelineToggle () {
      this.$log('timelineToggle')
      if (this.timelineBottom === 0) {
        this.$tween.to(this, 0.5, {timelineBottom: -162})
      } else {
        this.$tween.to(this, 0.5, {timelineBottom: 0})
      }
    },
    menuLeftToggle () {
      this.$log('menuLeftToggle')
      this.$refs.menuLeftDialog.toggle()
    },
    menuRightToggle () {
      this.$log('menuRightToggle')
      this.$refs.menuRightDialog.toggle()
    },
    mutedToggle () {
      this.$log('mutedToggle')
      this.muted = !this.muted
    },
    async ready () {
      this.$log('ready')
      this.loading = true
      let video = this.$refs.kvideo
      video.pause()
      // create canvas
      let canvas = document.createElement('canvas')
      canvas.width = this.content.width
      canvas.height = this.content.height
      let ctx = canvas.getContext('2d')
      // loop fragments
      for (const f in this.fragments) {
        let fragment = this.fragments[f]
        video.currentTime = fragment.relativePoints[0]['x']
        await this.$wait(500)
        ctx.drawImage(this.$refs.kvideo, 0, 0, canvas.width, canvas.height)
        await this.$wait(500)
        fragment.thumbUrl = canvas.toDataURL('image/jpeg', 0.5)
      }
      this.loading = false
      this.$emit('hide')
    }
  },
  async mounted () {
    this.$log('mounted', this.content)
    this.$set(this, 'frames', [])
    this.$set(this, 'frames', await this.framesLoad(this.content.oid))
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.$set(this, 'frames', [])
  }
}
</script>

<style lang="stylus">
</style>
