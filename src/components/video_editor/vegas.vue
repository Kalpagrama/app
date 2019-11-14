<template lang="pug">
div(:style=`{position: 'relative', borderRadius: '10px 10px 0 0', overflow: 'hidden'}`).column.full-width.bg-white
  //- debug
  div(v-if="true" :style=`{position: 'absolute', bottom: '0px'}`).row.full-width.q-pa-xs
    small.full-width framesScrollLeft: {{ framesScrollLeft }}
    small.full-width frameWidth: {{ frameWidth }}
    small.full-width framesWidth: {{ framesWidth }}
    small.full-width framesScrollWidth: {{ framesScrollWidth }}
    //- small.full-width videoRowsLength: {{ videoRowsLength }}
    //- small.full-width cutsOverflowX: {{cutsOverflowX}}
    //- small.full-width cutsOverflowY: {{cutsOverflowY}}
  //- actions
  q-btn(
    v-show="cut === undefined" round color="green" size="md" icon="add"  @click="cutAdd(now)"
    :style=`{position: 'absolute', right: '10px', bottom: '10px', zIndex: 10000}`)
  q-btn(
    v-show="cut === undefined" round color="green" size="md" :icon="mode === 'mini' ? 'keyboard_arrow_down' : 'keyboard_arrow_up'"  @click="modeToggle()"
    :style=`{position: 'absolute', left: '10px', bottom: '10px', zIndex: 10000}`)
  q-btn(
    v-show="cut >= 0" no-caps color="green" @click="cutConfirm()"
    :style=`{position: 'absolute', left: '10px', bottom: '10px', height: '60px', width: 'calc(100% - 20px)', borderRadius: '10px'}`)
    span Готово
  //- frames
  div(:style=`{position: 'absolute', zIndex: 1000, top: mode === 'maxi' ? '0px' : '-70px', height: '70px'}`).row.full-width.justify-center.items-center.content-center.bg-white
    //- frames v-touch-pan.mouse.stop.left.right="framesDrag"
    div(ref="kframes" :style=`{position: 'relative'}` @scroll="framesScrolled" body-scroll-lock-ignore).row.full-width.scroll
      div(:style=`{borderRadius: '10px', marginTop: '16px', marginBottom: '16px'}`).row.no-wrap
        //- left box for padding
        div(:style=`{height: '50px', width: width/2+'px'}`).row.bg-white
        //- frames wrapper no-wrap
        div(:style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden'}`).row.no-wrap.shadow-9
          //- frame
          div(
            v-for="(f, fi) in frames" :key="f" @click="$event => frameClick(f, fi, $event)"
            :style=`{height: '50px', width: frameWidth+'px', maxWidth: frameWidth+'px'}`
            ).row.items-center.justify-center.bg-black
            //- frame img
            img(:src="f" draggable="false" :style=`{height: '50px', objectFit: 'cover', userSelect: 'none'}` @load="frameRendered")
          //- now line
          div(:style=`{position: 'absolute', left: now*k+'px', width: '5px', height: '50px'}`).row.bg-green
        //- right box for padding
        div(:style=`{height: '50px', width: width/2+'px'}`).row.bg-white
  //- cuts
  div(v-show="true" ref="kcuts" @scroll="cutsScrolled"
    :style=`{paddingTop: mode === 'maxi' ? '70px' : '10px', paddingBottom: '400px', overflowY: cutsOverflowY, overflowX: cutsOverflowX}`).col.full-width.scroll
    //- cut wrapper
    div(
      v-for="(c, ci) in fragment.relativeCuts" :key="ci"
      :style=`{height: cutHeight+'px', width: width+framesWidth+'px', borderBottom: mode === 'maxi' ? '1px solid #eee' : 'none',
        marginBottom: cut == ci ? '120px' : '0px'}`).row
      //- left padding
      div(:style=`{width: width/2+'px'}`).row.full-height.items-center.justify-end.q-px-sm.bg-white
        small(v-if="mode === 'maxi'") {{ ci + 1}}
      //- cut body
      .col.full-height.bg-white
        .row.fit.items-center
          div(
            @click="cutClick(c, ci)"
            v-touch-pan.mouse.stop="cut > 0 ? cutDragBody : false"
            :style=`{
              position: 'relative',
              marginLeft: (c.start*k)+'px',
              width: (c.end-c.start)*k+'px',
              background: $randomColor(ci),
              cursor: 'pointer',
              borderRadius: '4px'}`
            ).row.full-height.items-center.justify-center
            //- cut inactive
            span(v-if="mode === 'maxi'").text-white {{ Math.round(c.end - c.start) }}s
            //- cut active
            div(v-if="cut === ci" :style=`{position: 'absolute', top: cutHeight+4+'px', height: '50px', width: '1px', left: '0px', background: $randomColor(ci)}`)
              div(
                v-touch-pan.mouse.stop="cutDragStart"
                :style=`{position: 'absolute', bottom: '-40px', left: '-20px', width: '40px', height: '40px', borderRadius: '50%', background: $randomColor(ci)}`)
            div(v-if="cut === ci" :style=`{position: 'absolute', top: cutHeight+4+'px', height: '10px', width: '1px', right: '0px', background: $randomColor(ci)}`)
              div(
                v-touch-pan.mouse.stop="cutDragEnd"
                :style=`{position: 'absolute', bottom: '-40px', left: '-20px', width: '40px', height: '40px', borderRadius: '50%', background: $randomColor(ci)}`)
      //- right padding
      div(:style=`{width: width/2+'px'}`).row.full-height.items-center.justify-start.q-px-sm.bg-white
        q-btn(v-if="mode === 'maxi'" round dense flat icon="clear" color="grey-6" @click="cutDelete(ci)")
  //- loading, waiting for framesRenderedAll
  //- div(v-show="!framesRenderedAll").col.full-width
  //-   .row.fit.justify-center.items-center.content-center
  //-     q-spinner(color="primary" :thickness="2" size="50px")
</template>

<script>
export default {
  name: 'vegas',
  props: ['fragment', 'video', 'now', 'duration', 'width'],
  data () {
    return {
      mode: 'maxi',
      frames: [],
      framesRendered: 0,
      framesRenderedAll: false,
      framesScrollLeft: 0,
      framesScrollWidth: 0,
      frameMaxWidth: 1000,
      cutsScrolling: false,
      cutsScrollTimeout: null,
      cutsOverflowY: 'auto',
      cutsOverflowX: 'auto',
      cut: undefined,
      cutHeight: 36,
      cutHeightMin: 20,
      cutHeightMax: 36,
      cutsHeight: 50,
      cutsScrollLeft: 0,
      cuts: [
        {type: 'video', name: '', start: 0, end: 10},
        {type: 'video', name: '', start: 10, end: 20}
      ]
    }
  },
  computed: {
    k () {
      if (this.framesWidth > this.$q.screen.width) {
        if (this.mode === 'maxi') return this.framesWidth / this.duration
        else return (this.width - 20) / this.duration
      } else {
        return this.framesWidth / this.duration
      }
    },
    frameWidth () {
      this.$log('framesWidth')
      // video.height - 50
      // video.width - x
      if (this.mode === 'maxi') {
        return (this.fragment.content.width * 50) / this.fragment.content.height
      } else {
        return (this.width - 20) / this.framesCount
      }
    },
    framesWidth () {
      return this.frameWidth * this.framesCount
    },
    framesCount () {
      return this.frames.length
    },
    fragmentTotalLength () {
      return this.fragment.relativeCuts.reduce((acc, val) => {
        return acc + (Math.abs(val.end - val.start))
      }, 0)
    }
  },
  watch: {
    mode: {
      immediate: true,
      async handler (to, from) {
        this.$log('mode CHANGED', to)
        switch (to) {
          case 'maxi': {
            this.$tween.to(this, 0.3, {cutHeight: this.cutHeightMax})
            // this.$tween.to(this, 0.3, {frameMaxWidth: 1000})
            this.frameMaxWidth = 200
            await this.$wait(300)
            // this.framesScrollWidth = this.$refs.kframes.scrollWidth - this.width
            this.cutsOverflowX = 'auto'
            break
          }
          case 'mini': {
            this.$tween.to(this, 0.3, {cutHeight: this.cutHeightMin})
            // this.$tween.to(this, 0.3, {frameMaxWidth: (this.width - 20) / this.framesCount})
            // scroll to active cut
            this.$tween.to(this.$refs.kframes, 0.3, {
              scrollLeft: (this.width / 2) - 10,
              onComplete: () => {
                this.$log('completed!!!')
                // this.cutsOverflowX = 'hidden'
              }
            })
            // this.framesScrollWidth = this.$refs.kframes.scrollWidth - this.width
            break
          }
        }
      }
    },
    cut: {
      immediate: true,
      handler (to, from) {
        this.$log('cut CHANGED', to)
        // emit cut to be highlighten
        this.$emit('cut', this.cuts[to])
        // toggle cuts overflowY and may be X, and if it long?
        this.$log('null>=0', undefined >= 0)
        if (to >= 0) {
          this.cutsOverflowX = 'hidden'
          this.cutsOverflowY = 'hidden'
        } else {
          this.cutsOverflowX = 'auto'
          this.cutsOverflowY = 'auto'
        }
      }
    },
    cuts: {
      deep: true,
      handler (to, from) {
        this.$log('cuts CHANGED', to)
      }
    }
  },
  methods: {
    // mode
    modeToggle () {
      // TODO: return promise 300ms?
      this.$log('modeToggle')
      if (this.mode === 'mini') this.mode = 'maxi'
      else this.mode = 'mini'
    },
    // cut
    cutConfirm () {
      this.$log('cutConfirm')
      // TODO: save or change?
      this.cut = undefined
      // scroll to the top? and if there are a lot of points there?
      this.$tween.to(this.$refs.kcuts, 0.3, {scrollTop: 0})
      this.mode = 'mini'
    },
    cutDragBody (e) {
      this.$log('cutDragBody', e)
      if (this.cut >= 0) {
        this.cutDragEnd(e)
        this.cutDragStart(e)
      }
    },
    cutDragStart (e) {
      // this.$log('cutDragStart', e.position.left)
      let cut = this.fragment.relativeCuts[this.cut]
      let to = cut.start + (e.delta.x / this.k)
      if (to > 0 && to < cut.end) {
        // cut.start = to
        this.$set(cut, 'start', to)
        this.video.goSync(to)
        // scroll left helper
        // if (e.position.left < 50 || e.position.left > this.width - 50) {
        //   this.$log('MOVING SCROLL')
        //   this.$refs.kframes.scrollLeft += e.delta.x * 2
        // }
      }
    },
    cutDragEnd (e) {
      // this.$log('cutDragEnd')
      let cut = this.fragment.relativeCuts[this.cut]
      let to = cut.end + (e.delta.x / this.k)
      if (to < this.duration && to > cut.start) {
        // cut.end = to
        this.$set(cut, 'end', to)
        this.video.goSync(to)
        // scroll left helper
        // if (e.position.left < 50 || e.position.left > this.width - 50) {
        //   this.$log('MOVING SCROLL')
        //   this.$refs.kframes.scrollLeft += e.delta.x * 2
        // }
      }
    },
    async cutClick (c, ci) {
      this.$log('cutClick', c, ci)
      // if got active cut
      if (this.cut === ci) {
        await this.video.go(c.start)
        // set mode back to mini
        // this.mode = 'mini'
        // await this.$wait(300)
        // scroll to
        // this.cutToScrollTo(ci)
        // await this.$wait(300)
        // this.cut = undefined
      } else {
        // if no cut is active
        // pause and go
        this.video.pause()
        this.video.goSync(c.start)
        // set it
        this.cut = ci
        this.mode = 'maxi'
        await this.$wait(300)
        // scroll to it
        this.cutToScrollTo(ci)
      }
    },
    cutAdd (s, e) {
      this.$log('cutAdd', s, e)
      // start/end
      let start = s || this.$random(0, this.duration - 2)
      // let end = e || this.$random(start + 1, this.duration)
      let end = start + 3 > this.duration ? this.duration : start + 3
      // add
      this.$set(this.fragment.relativeCuts, this.fragment.relativeCuts.length, {type: 'video', name: '', start: start, end: end})
      // make this cut active to edit it right now
      this.cutClick(this.fragment.relativeCuts[this.fragment.relativeCuts.length - 1], this.fragment.relativeCuts.length - 1)
    },
    cutDelete (ci) {
      this.$log('cutDelete', ci)
      if (this.cut === ci) this.cut = undefined
      // TODO: confirm cut deletion
      this.$delete(this.fragment.relativeCuts, ci)
    },
    async cutToScrollTo (ci) {
      return new Promise(async (resolve, reject) => {
        this.$log('cutToScrollTo', ci)
        let scrollTop = this.cutHeight * ci
        let scrollLeft = (this.fragment.relativeCuts[this.cut].start * this.k) + (this.width / 2) - 30
        this.$log('cutToScrollTo scrollTop/scrollLeft', scrollTop, scrollLeft)
        this.$tween.to(this.$refs.kcuts, 0.3, {scrollTop, scrollLeft})
        await this.$wait(300)
        resolve()
      })
    },
    // cuts
    cutsScrolled (e) {
      this.$log('cutsScrolled', e.target.scrollLeft)
      // set cuts scrollLeft
      this.cutsScrollLeft = e.target.scrollLeft
      // connect with frames scroll position
      this.$refs.kframes.scrollLeft = e.target.scrollLeft
    },
    // frames
    frameClick (e) {
      this.$log('frameClick')
    },
    frameRendered () {
      // this.$log('frameRendered', this.framesRendered)
      this.framesRendered++
      // if (this.$refs.kframes) this.$refs.kframes.scrollLeft = (this.width / 2) - 10
      if (this.framesRendered === this.framesCount) {
        this.framesRenderedAll = true
        this.$log('frames rendered!')
        // set framesScrollWidth
        // this.framesScrollWidth = this.$refs.kframes.scrollWidth - this.width
        // frames to the left once frames rendered all, if there less than width
        // let scrollLeftInitial = (this.width / 2) - 10
        // if (this.framesWidth > this.width) scrollLeftInitial = (this.width) - 10
        // this.$tween.to(this.$refs.kframes, 0.5, {scrollLeft: scrollLeftInitial})
        // play video
        if (this.video) this.video.play()
      }
    },
    framesScrolled (e) {
      this.$log('framesScrolled', e.target.scrollLeft)
      // save frames scroll position
      this.framesScrollLeft = e.target.scrollLeft
      // connect with rows scroll position
      this.$refs.kcuts.scrollLeft = e.target.scrollLeft
    },
    async framesLoad (oid) {
      this.$log('framesLoad start')
      let content = await this.$store.dispatch('objects/get', { oid, fragmentName: 'contentFragment', priority: 0 })
      // let { data: { objectList: [{frameUrls}] } } = await this.$apollo.query({
      //   query: gql`
      //     query getVideoFramesOld ($oid: OID!) {
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
      this.$log('framesLoad done')
      return content.frameUrls
    }
  },
  async mounted () {
    this.$log('mounted', this.fragment)
    // get frames, and then wait for there all are rendered
    this.$set(this, 'frames', await this.framesLoad(this.fragment.content.oid))
    // await this.$wait(1000)
    // this.$tween.to(this.$refs.kframes, 0.5, {scrollLeft: (this.width / 2) + 10})
    // this.$refs.kframes.scrollLeft = 100
    // this.mode = 'mini'
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    // TODO: disable some watchers?
  }
}
</script>
