<template lang="pug">
div(
  :style=`{position: 'relative', borderRadius: '10px 10px 0 0', overflow: 'hidden'}`
  ).column.full-width.bg-white
  //- header with current content frames
  //- v-show="framesTop === 0"
  div(
    ref="contentFrames"
    :style=`{position: 'absolute', top: -framesTop+'px', height: framesHeight+'px', zIndex: 1000, overflow: framesOverflowX}`).row.full-width.items-start.scroll.bg-white.q-pt-md
    div(:style=`{height: '50px'}`).row.no-wrap
      div(:style=`{width: '30px', height: '50px'}`).row
      div(:style=`{position: 'relative', borderRadius: '10px'}`).col.full-height
        //- now
        div(:style=`{position: 'absolute', zIndex: 2000, left: (now*framesWidth)/duration+'px', height: '50px', width: '3px'}`).row.bg-green
        //- active cut frame
        div(
          v-if="cut >= 0"
          :style=`{
            position: 'absolute', height: '55px',
            top: '-5px',
            left: (cuts[cut].start*framesWidth)/duration+'px',
            width: ((cuts[cut].end - cuts[cut].start)*framesWidth)/duration+'px',
            borderRadius: '10px 10px 0 0',
            borderTop: '5px solid ' + $randomColor(cuts[cut].uid),
            borderLeft: '5px solid ' + $randomColor(cuts[cut].uid),
            borderRight: '5px solid ' + $randomColor(cuts[cut].uid),
            background: 'rgba(0,0,0,0.5)'
          }`).row
          div(:style=`{position: 'absolute', top: '5px', left: '-5px', width: '5px', height: '150px', zIndex: 1000, background: $randomColor(cuts[cut].uid)}`).row
            div(
              v-touch-pan.mouse="cutPanStart"
              :style=`{position: 'absolute', left: '-18px', bottom: '0px', width: '40px', height: '40px', borderRadius: '50%', background: 'inherit'}`
              ).row.items-center.justify-center
              q-icon(name="drag_indicator" color="white" size="20px")
          div(:style=`{position: 'absolute', top: '5px', right: '-5px', width: '5px', height: '100px', zIndex: 1000, background: $randomColor(cuts[cut].uid)}`).row
            div(
              v-touch-pan.mouse="cutPanEnd"
              :style=`{position: 'absolute', left: '-18px', bottom: '0px', width: '40px', height: '40px', borderRadius: '50%', background: 'inherit'}`
              ).row.items-center.justify-center
              q-icon(name="drag_indicator" color="white" size="20px")
        .row.no-wrap
          img(v-for="(i, ii) in frames" :key="ii" :src="i" :style=`{height: '50px', width: frameWidth+'px', userSelect: 'none',
            borderRadius: frameRadius(ii)}`)
      div(:style=`{width: '30px', height: '50px'}`).row
  //- body
  div(
    ref="cutsWrapper"
    :style=`{paddingTop: 80-framesTop+'px', paddingBottom: '0px', overflowY: cutsOverflowY }`).col.full-width.scroll
    div(:style=`{position: 'relative'}`).row.full-width.justify-center.items-start.content-start.q-pt-md
      div(
        v-show="cut >= 0 ? ci >= cut : true"
        v-for="(c, ci) in cuts" :key="ci"
        @click="cutClick(c, ci)"
        :style=`{position: 'relative', minHeight: '40px', marginBottom: cutMarginBottom+'px'}`).row.full-width
        div(:style=`{width: '30px'}`).row.items-center.justify-center
          small {{ ci+1 }}
        div(:style=`{position: 'relative', borderRadius: '4px'}`).col.bg-grey-3
          div(:style=`{
            position: 'absolute', left: c.start/duration*100+'%', width: (c.end-c.start)/duration*100+'%', minWidth: '2px',
            borderRadius: '4px', overflow: 'hidden',
            background: $randomColor(c.uid)}`).row.full-height
        div(:style=`{width: '30px'}`)
    //- now
    div(v-if="cuts.length > 0 || cut >= 0 ? false : true" :style=`{position: 'absolute', top: 0+'px'}`).row.full-width
      div(:style=`{width: '30px'}`).row.full-height
      div(:style=`{position: 'relative'}`).col.full-height
        div(:style=`{position: 'absolute', zIndex: 10000, left: now/duration*100+'%', top: '12px', width: '2px', height: $q.screen.height/2+10+'px'}`).row.bg-green
          div(:style=`{position: 'absolute', top: '0px', left: '-3px', width: '8px', height: '8px', borderRadius: '50%'}`).row.bg-green
      div(:style=`{width: '30px'}`).row.full-height
    //- edit
    transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
      div(
        v-if="cut >= 0"
        :style=`{position: 'absolute', bottom: '0px', height: $q.screen.height/4+'px'}`
        ).row.full-width.justify-center.items-start.content-start.q-px-md.bg-grey-1
        //- header
        div(:style=`{height: '50px'}`).row.full-width.items-center.justify-between.q-px-sm
          span {{ $time(cuts[cut].start) }}-{{ $time(cuts[cut].end) }}
          q-btn(round flat dense icon="more_vert" color="grey-6")
        //- actions
        div(:style=`{position: 'relative', height: '50px'}`).row.full-width.items-center.justify-between.q-px-sm
          q-btn(round dense icon="play_arrow" color="green" @click="cutPlay()")
          q-btn(round flat dense icon="delete_outline" color="grey-6" @click="cutDelete()")
    //- confirm cut changes
    transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
      q-btn(
        v-if="cut >= 0" round color="green" icon="check" @click="confirm()"
        :style=`{position: 'absolute', zIndex: 2000, right: '12px', bottom: '12px'}`)
    //- add
    transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
      q-btn(
        v-if="cut >= 0 ? false : true" round push size="md" color="green" icon="add" @click="add()"
        :style=`{position: 'absolute', zIndex: 2000, right: cuts.length > 0 ? '12px' : $q.screen.width/2-24+'px', bottom: '12px'}`)
    //- debug
    div(v-if="false" :style=`{position: 'absolute', bottom: '0px', fontSize: '9px'}`).row.full-width.q-pa-xs
      //- small(:style=`{fontSize: '9px'}`) now/duration: {{now}}/{{duration}}
      small.full-width cuts: {{cuts}}
</template>

<script>
export default {
  name: 'videoEditor__editor',
  props: {
    fragment: {type: Object},
    video: {type: Object},
    duration: {type: Number},
    now: {type: Number},
    width: {type: Number}
  },
  data () {
    return {
      cut: undefined,
      cutChanging: false,
      cutsOverflowY: 'auto',
      frames: [],
      framesTop: 80,
      framesHeight: 80,
      framesScrollLeft: 0,
      framesOverflowX: 'auto',
      cutMarginBottom: 10
    }
  },
  computed: {
    cuts () {
      return this.fragment.relativeCuts
    },
    frameWidth () {
      return (this.fragment.content.width * 50) / this.fragment.content.height
    },
    framesCount () {
      return this.frames.length
    },
    framesWidth () {
      return this.frameWidth * this.framesCount
    }
  },
  watch: {
    cut: {
      deep: true,
      immediate: false,
      async handler (to, from) {
        this.$log('cut CHANGED')
        this.cutChanging = true
        if (to >= 0) {
          this.$log('cut', to)
          this.$emit('cut', this.cuts[to])
          this.$tween.to(this, 0.3, {framesTop: 0, framesHeight: 180, cutMarginBottom: this.$q.screen.height / 2})
          this.$tween.to(
            this.$refs.contentFrames,
            0.3,
            {
              scrollLeft: (this.cuts[to].start * this.framesWidth) / this.duration,
              onComplete: () => {
                this.$log('tween COMPLETED')
                this.cutsOverflowY = 'hidden'
              }
            })
          this.video.pause()
          this.video.goSync(this.cuts[to].start)
        } else {
          this.$emit('cut', false)
          this.$tween.to(this, 0.3, {framesScrollLeft: 0, framesTop: 80, framesHeight: 80, cutMarginBottom: 10})
          this.$tween.to(
            this.$refs.contentFrames,
            0.3,
            {
              scrollLeft: 0,
              onComplete: () => {
                this.$log('tween COMPLETED')
                this.cutsOverflowY = 'auto'
              }
            })
        }
        await this.$wait(300)
        this.cutChanging = false
      }
    }
  },
  methods: {
    cutClick (c, ci) {
      this.$log('cutClick', c, ci)
      if (this.cut >= 0) {
        // this.$set(this, 'cut', undefined)
      } else {
        this.$set(this, 'cut', ci)
      }
    },
    cutPlay () {
      this.$log('cutPlay')
    },
    cutDelete (c) {
      this.$log('cutDelete')
      this.$delete(this.cuts, this.cut)
      this.$set(this, 'cut', undefined)
    },
    cutHold (c, ci) {
      this.$log('cutHold', c, ci)
    },
    cutPanStart (e) {
      // this.$log('cutPanStart', e)
      let cut = this.cuts[this.cut]
      let delta = e.delta.x * this.duration / this.framesWidth
      let to = cut.start + delta
      if (e.isFirst) {
        this.video.pause()
        this.framesOverflowX = 'hidden'
      }
      if (e.isFinal) {
        this.framesOverflowX = 'auto'
      }
      if (to >= 0 && to < cut.end && to < this.duration) {
        this.video.goSync(to)
        this.$set(cut, 'start', to)
        this.$emit('cut', this.cuts[this.cut])
        // cut.start = to
      }
    },
    cutPanEnd (e) {
      // this.$log('cutPanEnd', e)
      let cut = this.cuts[this.cut]
      let delta = e.delta.x * this.duration / this.framesWidth
      let to = cut.end + delta
      if (e.isFirst) {
        this.video.pause()
        this.framesOverflowX = 'hidden'
      }
      if (e.isFinal) {
        this.framesOverflowX = 'auto'
      }
      if (to >= 0 && to > cut.start && to < this.duration) {
        this.video.goSync(to)
        this.$set(cut, 'end', to)
        this.$emit('cut', this.cuts[this.cut])
        // cut.end = to
      }
    },
    confirm () {
      this.$log('confirm')
      this.$set(this, 'cut', undefined)
    },
    add () {
      this.$log('add')
      let cut = {
        uid: Date.now().toString(),
        start: this.now,
        end: this.now + (this.duration / 10)
      }
      this.$set(this.cuts, this.cuts.length, cut)
      this.$set(this, 'cut', this.cuts.length - 1)
    },
    frameRadius (i) {
      if (i === 0) return '10px 0 0 10px'
      else if (i === this.frames.length - 1) return '0 10px 10px 0'
      else return '0px'
    },
    async framesLoad (oid) {
      this.$log('framesLoad start')
      let content = await this.$store.dispatch('objects/get', { oid, fragmentName: 'contentFragment', priority: 0 })
      // let { data: { objectList: [{frameUrls}] } } = await this.$apollo.query({
      //   query: gql`
      //     query getVideoFrames ($oid: OID!) {
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
    this.$log('mounted')
    this.$set(this, 'frames', await this.framesLoad(this.fragment.content.oid))
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
