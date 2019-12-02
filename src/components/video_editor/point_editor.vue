<template lang="pug">
.row.full-width
  //- //- -----------------------
  //- //- fragment points wrapper
  //- div(:style=`{position: 'absolute', bottom: timelineBottom+82+'px', height: '80px', paddingLeft: width/2+'px'}`).row.full-width.bg
  //-   //- fragment point
  //-   div(
  //-     v-for="(p, pi) in fragment.relativePoints"
  //-     :style=`{position: 'absolute', top: pointFirst(pi) ? '0px' : '40px', zIndex: 400, height: pointFirst(pi) ? '146px' : '106px', width: '1px',
  //-       left: -framesScrollLeft+width/2+(p.x*k)+'px', background: $randomColor(pointFirst(pi) ? pi : pi+1)}`).row
  //-       //- rectangle left
  //-       //- div(
  //-       //-   v-if="pointFirst(pi)"
  //-       //- )
  //-       //- div(
  //-       //-   v-if="pointFirst(pi)"
  //-       //-   :style=`{
  //-       //-     position: 'absolute', bottom: '0px', height: '50px', background: $randomColor(pi), opacity: 0.5, pointerEvents: 'none',
  //-       //-     left: fragment.relativePoints[pointFirst(pi) ? pi + 1 : pi]['x'] > fragment.relativePoints[pointFirst(pi) ? pi : pi - 1]['x'] ? '0px' : -Math.abs(k*(fragment.relativePoints[pointFirst(pi) ? p - 1 : pi]['x'] - fragment.relativePoints[pointFirst(pi) ? pi : pi + 1]['x']))+'px',
  //-       //-     width: Math.abs(k*(fragment.relativePoints[pointFirst(pi) ? pi + 1 : pi]['x'] - fragment.relativePoints[pointFirst(pi) ? pi : pi - 1]['x']))+'px'
  //-       //-     }`).row
  //-       //- circle
  //-       div(
  //-         v-touch-pan.mouse.stop="$event => pointDrag(p, pi, $event)"
  //-         :style=`{
  //-           position: 'absolute', top: '-1px', left: '-20px',
  //-           width: '40px', height: '40px', borderRadius: '50%', background: $randomColor(pointFirst(pi) ? pi : pi+1, 0.5)
  //-         }`
  //-         ).row.items-center.justify-center.cursor-pointer
  //-         span(style=`user-select: none`).text-white.text-bold {{ pointFirst(pi) ? pi : pi+1 }}
  div(:style=`{position: 'absolute', bottom: 82+'px', height: '80px'}`).row.full-width
    div(
      v-for="(p, pi) in points" :key="pi"
      ).row
      small {{ p }}
  //- timeline
  div(:style=`{position: 'absolute', bottom: 0+'px', height: '82px'}`).row.full-width.justify-center.items-center.content-center
    //- frames v-touch-pan.mouse.stop.left.right="framesDrag"
    div(ref="kframes" :style=`{position: 'relative'}` @scroll="framesScroll" body-scroll-lock-ignore).row.full-width.scroll
      div(:style=`{borderRadius: '10px', marginTop: '16px', marginBottom: '16px'}`).row.no-wrap
        //- left box for padding
        div(:style=`{height: '50px', width: width/2+'px'}`).row
        //- frames wrapper no-wrap
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
export default {
  name: 'pointEditor',
  props: ['current', 'point', 'now', 'duration', 'fragment', 'width'],
  data () {
    return {
      frames: [],
      framesScrollLeft: 0,
      framesScrollWidth: 0,
      framesLoaded: 0
    }
  },
  computed: {
    points () {
      return this.fragment.relativePoints.filter((p, pi) => {
        return pi === this.current || pi === (this.current + 1)
      })
    },
    k () {
      return this.framesScrollWidth / this.duration
    },
    framesCount () {
      return this.frames.length
    },
    framesMiddle () {
      return (this.width / 2) + this.framesScrollLeft
    },
    frameDuration () {
      return Math.round(this.duration / this.framesCount)
    }
  },
  watch: {
    point: {
      handler (to, from) {
        this.$logD('point CHANGED', to)
      }
    }
  },
  methods: {
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
      this.$logD('pointDrag', e)
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
    frameLoaded (e) {
      this.$logD('frameLoaded')
      this.framesLoaded++
      if (this.framesLoaded === this.framesCount) {
        this.$logD('frames LOADED!')
        if (this.$refs.kframes) this.$tween.to(this, 0.5, {framesScrollWidth: this.$refs.kframes.scrollWidth - this.width})
        // scroll frames to the left
        this.$tween.to(this.$refs.kframes, 0.5, {scrollLeft: (this.width / 2) - 10})
        this.framesLoadedAll = true
        if (this.$refs.kvideo) this.$refs.kVideo.play()
      }
    },
    frameClick (f, fi, e) {
      this.$logD('frameClick', fi, e)
      // if (this.framesDragging) return
      // let time = this.frameDuration * (fi) + this.frameDuration / 2
      // this.$refs.kvideo.currentTime = time
      // this.$logD('time', time)
      // this.$tween.to(this.$refs.kframes, 0.5, {scrollLeft: (time * this.k)})
    },
    framesScroll (e) {
      // this.$logD('framesScroll', e)
      this.framesScrollLeft = e.target.scrollLeft
    },
    async framesDrag (e) {
      this.$logD('framesDrag', e)
      // if (e.isFirst) {
      //   this.framesDragging = true
      // }
      // if (e.isFinal) {
      //   await this.$wait(600)
      //   this.framesDragging = false
      // }
      // if (this.$q.screen.gt.sm) {
      //   this.$refs.kframes.scrollLeft -= e.delta.x
      // }
    },
    async framesLoad (oid) {
      this.$logD('framesLoad start')
      let content = await this.$store.dispatch('objects/get', { oid, fragmentName: 'contentFragment', priority: 0 })
      // let { data: { objectList: [{frameUrls}] } } = await this.$apollo.query({
      //   query: gql`
      //     query getVideo ($oid: OID!) {
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
    }
  },
  async mounted () {
    this.$logD('mounted')
    this.$set(this, 'frames', await this.framesLoad(this.fragment.content.oid))
  },
  beforeDestroy () {
    this.$logD('beforeDestroy')
  }
}
</script>
