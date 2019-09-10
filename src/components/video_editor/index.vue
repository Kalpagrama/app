<template lang="pug">
div(:style=`{position: 'relative', overflow: 'hidden'}`).row.fit.justify-center.bg-black
  div(v-if="false" style=`position: absolute; zIndex: 300; left: 0px; width: 250px; top: 50%; color: white`).row.bg-purple.q-pa-sm
    small(v-for="(d, di) in debug").full-width {{d}}:{{get(d)}}
  k-menu(ref="kmenu" :fragments="fragments" :colors="colors" :duration="duration")
  video(
    ref="kvideo" :src="fragment.content.url" autoplay playsinline type="video/mp4"
    :style=`{position: 'relative', height: '100%', maxWidth: '100%'}`
    @click="videoClick" @playing="videoPlaying" @timeupdate="videoTimeupdate")
  //- actions
  div(v-show="duration > 0" :style=`{position: 'absolute', zIndex: 200, top: '16px', height: '60px', opacity: 0.6}`).row.full-width.justify-between.q-px-md
    q-btn(round flat icon="menu" color="white" @click="$refs.kmenu.toggle()").bg-grey-9
    //- q-btn(round flat icon="menu" color="white").bg-grey-9
    div(:style=`{height: '30px', borderRadius: '10px'}`).row.items-center.bg-grey-9.q-px-sm
      span.text-white {{ $time(now) }}/{{ $time(duration) }}
    //- q-btn(round icon="keyboard_arrow_left" color="primary" @click="$refs.kvideo.playBackwards()")
    q-btn(round icon="check" color="primary" @click="$emit('close')")
  //- relative points
  div(:style=`{position: 'absolute', bottom: '85px', height: '80px', paddingLeft: $q.screen.width/2+'px'}`).row.full-width
    div(v-for="(f, fi) in fragments" :key="fi")
      div(
        v-for="(point, pi) in f.points" :key="pi" v-show="f.visible"
        :style=`{position: 'absolute', zIndex: 400, bottom: '-10px', width: '2px', height: '80px',
          left: -framesScrollLeft+$q.screen.width/2+(point*k)+'px', background: randomColor(fi)}`).row
        div(
          :style=`{position: 'relative'}`
          v-touch-pan.mouse.stop="$event => pointDrag(fi, pi, $event)").row.cursor-pointer
          //- point active @click="$event => pointClick(fi, pi, $event)"
          div(
            v-if="pointActive === `${fi+pi}`"
            :style=`{marginLeft: '-37px', minWidth: '74px', height: '40px', borderRadius: '20px', background: randomColor(fi)}`
            ).row.items-center.justify-center
            q-btn(round flat dense color="white" icon="keyboard_arrow_left" @click="pointTickLeft(fi, pi)")
            q-btn(round flat dense color="white" icon="keyboard_arrow_right" @click="pointTickRight(fi, pi)")
          //- point inactive
          div(
            v-else
            :style=`{
              position: 'absolute',
              zIndex: pointDragging === fi+pi ? 1000 : 200,
              left: pointDragging === fi+pi ? -pointDraggingHeight/2+'px' : -20+'px',
              top: pointDragging === fi+pi ? -pointDraggingHeight/2+'px' : '0px',
              minWidth: pointDragging === fi+pi ? pointDraggingHeight+'px' : 40+'px',
              height: pointDragging === fi+pi ? pointDraggingHeight+'px' : 40+'px',
              borderRadius: '50%',
              background: randomColor(fi)}`
            ).row.items-center.justify-center.shadow-22
            span(style=`user-select: none`).text-white {{fi+1}}
  //- timeline
  div(:style=`{position: 'absolute', bottom: '0px', height: '120px'}`).row.full-width.justify-center.items-center.content-center
    //- frames
    div(ref="kframes" :style=`{position: 'relative'}` @scroll="framesScroll").row.full-width.scroll
      div(:style=`{borderRadius: '10px'}`).row.no-wrap.q-my-lg
        div(:style=`{height: '50px', width: $q.screen.width/2+'px'}`).row
        div(:style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden'}`).row.no-wrap.shadow-9
          div(
            v-for="(f, fi) in frames" :key="f" @click="$event => frameClick(f, fi, $event)"
            :style=`{height: '50px'}`
            ).row.items-center.justify-center.bg-black
            img(:src="f" draggable="false" :style=`{height: '50px', objectFit: 'cover'}`)
          div(:style=`{position: 'absolute', left: now*k+'px', width: '5px', height: '50px'}`).row.bg-primary
        div(:style=`{height: '50px', width: $q.screen.width/2+'px'}`).row
  //- timeline middle time
  div(v-if="false").row.full-width.justify-center.q-py-xs
    div(:style=`{height: '30px', borderRadius: '10px', opacity: 0.5}`).row.items-center.bg-grey-9.q-px-sm
      small.text-white {{ $time(framesMiddle/k) }}
</template>

<script>
import kMenu from './menu'

export default {
  name: 'videoEditor',
  components: {kMenu},
  props: ['fragment'],
  data () {
    return {
      playing: false,
      duration: 0,
      now: 0,
      frames: [],
      fragmentMaxLength: 60,
      framesLeft: 0,
      framesScrollLeft: 0,
      framesScrollWidth: 0,
      frameClicks: 0,
      clicks: 0,
      clickDelay: 300,
      clickTimer: null,
      fragments: [
        {name: 'Ест паука', points: [0, 100.5], visible: true},
        {name: 'Вот это кикфлип', points: [20, 23], visible: true},
        {name: 'Тут так закатывает глаза 🤢😱', points: [5, 17], visible: true},
        {name: 'Bad girl 💀', points: [10, 34], visible: true}
      ],
      pointActive: undefined,
      pointDragging: undefined,
      pointDraggingHeight: 40,
      debug: ['k', 'now', 'duration', 'framesCount', 'frameDuration', 'fragments', 'framesMiddle', 'framesScrollLeft', 'framesScrollWidth'],
      colors: {}
    }
  },
  computed: {
    framesCount () {
      return this.frames.length
    },
    framesMiddle () {
      // return this.framesScrollWidth - this.framesScrollLeft
      return (this.$q.screen.width / 2) + this.framesScrollLeft
    },
    frameDuration () {
      // return this.duration / this.framesCount
      return 3
    },
    k () {
      return this.framesScrollWidth / this.duration
    }
  },
  methods: {
    randomColor(id) {
      const r = () => Math.floor(256 * Math.random())
      return this.colors[id] || (this.colors[id] = `rgb(${r()}, ${r()}, ${r()})`)
    },
    get (key) {
      return this[key]
    },
    pointClick (fi, pi, e) {
      this.$log('pointClick', fi, pi, e)
      this.pointActive = `${fi + pi}`
    },
    pointDrag (fi, pi, e) {
      this.$log('pointDrag', fi, pi, e.delta.x)
      this.pointDragging = `${fi + pi}`
      if (e.isFirst) this.$tween.to(this, 0.5, {pointDraggingHeight: 60})
      if (e.isFinal) {
        this.$tween.to(this, 0.5, {pointDraggingHeight: 40})
        this.pointActive = `${fi + pi}`
      }
      // let from = this.fragments[fi][pi]
      // let to = from + e.delta.x
      // if (to >= 0 && to <= 1000) {
      //   this.fragments[fi][pi] += e.delta.x
      // }
      this.$set(this.fragments[fi].points, pi, this.fragments[fi].points[pi] + e.delta.x / this.k)
      this.$refs.kvideo.currentTime = this.fragments[fi].points[pi]
      // this.fragments[fi].points[pi] += e.delta.x / this.k
    },
    pointTickLeft (fi, pi) {
      this.$log('pointTickLeft', fi, pi)
      let points = this.fragments[fi].points
      let from = this.fragments[fi].points[pi]
      // let to = from - 0.3
      // if (to >= 0 && to <= 1000) {
      //   this.fragments[fi][pi] -= 0.3
      // }
      this.$set(points, pi, from - 0.1)
      // this.fragments[fi].points[pi] -= 0.3
    },
    pointTickRight (fi, pi) {
      this.$log('pointTickRight', fi, pi)
      // let from = this.fragments[fi][pi]
      // let to = from - 0.3
      // if (to >= 0) {
      //   this.fragments[fi][pi] += 0.3
      // }
      this.fragments[fi].points[pi] += 0.3
    },
    framesDrag (e) {
      // this.$log('framesDrag', e)
      this.framesLeft += e.delta.x
    },
    framesScroll (e) {
      // this.$log('framesScroll', e.target.scrollLeft, e)
      this.framesScrollWidth = e.target.scrollWidth - this.$q.screen.width
      this.framesScrollLeft = e.target.scrollLeft
    },
    frameClick (f, fi, e) {
      this.$log('frameClick', fi, e)
      // this.$log('frameClick ONE')
      let time = this.frameDuration * (fi) + this.frameDuration / 2
      this.$refs.kvideo.currentTime = time
      this.$log('time', time)
      let px = time * this.k
      this.$log('px', px)
      // this.$tween.to(this.$refs.kframes, 0.5, {scrollLeft: (time * this.k)})
      // this.frameClicks++
      // if (this.frameClicks === 1) {
      // } else {
      //   this.$log('frameClick DOUBLE')
      //   this.frameClicks = 0
      // }
    },
    videoClick (e) {
      // this.$log('videoClick')
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
    }
  },
  async mounted () {
    this.$log('created', this.fragment)
    this.$set(this, 'frames', [])
    this.$set(this, 'frames', await this.framesLoad(this.fragment.content.oid))
    // await this.$wait(4000)
    // this.$refs.kvideo.playBackwards = function () {
    //   this.pause()
    //   var video = this
    //   var fps = 25
    //   var intervalRewind = setInterval(function () {
    //     if (video.currentTime === 0) {
    //       clearInterval(intervalRewind)
    //       video.pause();
    //     } else {
    //       video.currentTime += -(1 / fps)
    //     }
    //   }, 1000 / fps)
    // }
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
