<template lang="pug">
div(
  :style=`{
    position: 'relative',
  }`).row.full-width.q-px-sm
  div(
    :style=`{
      position: 'relative',
      height: heightWrapper+'px',
      //- opacity: options.showBar ? 1 : 0,
    }`
    ).row.full-width
    //- middle nodeEditor...
    transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
      tint-bar-node(
        v-if="player && player.figure"
        :player="player"
        :convert="convertPxToTime"
        :style=`{
          position: 'absolute', zIndex: 1000,
          top: '-16px',
        }`
        @first="zoomWorking = true"
        @final="zoomWorking = false")
    //- middle currentTime
    div(
      v-if="zoomed"
      :style=`{
        position: 'absolute', zIndex: 200, left: 'calc(50% + 1px)',
        width: '2px',
        height: '100%',
        pointerEvents: 'none',
      }`
      ).row.bg-red
    //- scroll
    div(
      ref="zoom-wrapper"
      @scroll="zoomWrapperOnScroll"
      :class=`{
        //- br: zoomWrapperScrolling
      }`
      :style=`{
        position: 'absolute', zIndex: 100,
        overflowY: 'hidden',
      }`
      ).row.fit.items-center.content-center.scroll.scroll-clear.q-py-sm
      .row.no-wrap
        //- left padding
        div(
          @click="zoomed = false"
          :style=`{
            width: leftRightMarginWidth+'px',
            minWidth: leftRightMarginWidth+'px',
            height: heightBar+'px',
          }`
          ).row
        //- middle wrapper
        div(
          ref="minutes-wrapper"
          :style=`{
            position: 'relative',
            height: heightBar+'px',
            overflow: 'visible',
          }`
          ).row.no-wrap
          //- tint
          div(
            v-if="!zoomed"
            @click="tintClick"
            v-touch-pan.mouse.prevent="tintOnPan"
            :style=`{
              position: 'absolute', zIndex: 3000,
            }`
            ).row.fit
          //- figure editor
          transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
            tint-bar-figure(
              v-if="player && player.figure"
              :player="player"
              :convert="convertPxToTime"
              :style=`{
                left: 'calc(' + (player.figure[0].t/player.duration)*100+'% - 6px)',
                width:'calc(' + ((player.figure[1].t-player.figure[0].t)/player.duration)*100+'% + 16px)',
              }`
              @first="zoomWorking = true"
              @final="zoomWorking = false")
          //- figures
          div(
            v-for="(f,fi) in player.figures" :key="fi"
            :style=`{
              position: 'absolute', zIndex: 1000+fi,
              left: (f.figures[0].t/player.duration)*100+'%',
              width: ((f.figures[1].t-f.figures[0].t)/player.duration)*100+'%',
              height: '100%',
              //- background: 'rgba(200,200,200,0.3)',
              background: $rateMeta.find(r => f.node.rate >= r.valueMin && f.node.rate < r.valueMax).colorBackground,
              opacity: 0.2,
            }`
            ).row
          //- currentTime
          transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
            div(
              v-if="!zoomed"
              :style=`{
                position: 'absolute', zIndex: 2000,
                left: (player.currentTime/player.duration)*100+'%',
                height: '100%',
                width: '2px',
                pointerEvents: 'none',
              }`
              ).row.bg-red
          //- minutes
          div(
            v-for="(m,mi) in minCount" :key="mi"
            :style=`{
              zIndex: 101+mi,
              //- height: heightBar+'px',
              height: '100%',
              width: (mi === minCount-1) ? minWidth*minDelta+'px' : minWidth+'px',
              minWidth: (mi === minCount-1) ? minWidth*minDelta+'px' : minWidth+'px',
              //- borderLeft: (minWidthMin < 40 && mi !== 0) ?  : '1px solid rgb(200,200,200,0.1)' : 'none',
              borderLeft: (mi !== 0 && (minWidthMin > 40 || zoomed)) ? '1px solid rgb(200,200,200,0.1)' : 'none'
            }`
            ).row
            small(
              v-if="zoomed ? true : minWidthMin > 50"
              :style=`{
                fontSize: '8px',
                marginLeft: mi === 0 ? '8px' : '4px',
              }`).text-grey-6 {{ mi < 60 ? mi + 'm' : $time(mi * 60, true) }}
          //- background
          div(
            :style=`{
              position: 'absolute', zIndex: 100,
              borderRadius: '10px',
              opacity: 0.8
            }`
            ).row.fit.b-40
        //- right padding
        div(
          @click="zoomed = false"
          :style=`{
            width: leftRightMarginWidth+'px',
            minWidth: leftRightMarginWidth+'px',
            height: heightBar+'px',
          }`
          ).row
  //- footer:
  //- actions figure
  //- div(
    v-if="player && player.figure"
    ).row.full-width.justify-center
    div(:style=`{maxWidth: '300px'}`).row.full-width.items-center.content-center.q-px-sm
      q-btn(round flat dense color="grey-8" icon="flip" @click="layerSet(0)" :style=`{position: 'relative'}`).rotate-180
      .col
      q-btn(round flat dense color="grey-8" @click="layerForward(0,false)")
        q-icon(name="keyboard_arrow_left" color="grey-8" size="30px")
      q-btn(round flat dense color="grey-8" @click="layerForward(0,true)")
        q-icon(name="keyboard_arrow_right" color="grey-8" size="30px")
      .col
      small(
        :class=`{
          'text-red': player.figure[1].t-player.figure[0].t > 60,
          'text-grey-7': player.figure[1].t-player.figure[0].t <= 60
        }`
        :style=`{
          userSelect: 'none',
          pointerEvents: 'none',
        }`
        ) {{$time(player.figure[1].t-player.figure[0].t)}}
      .col
      q-btn(round flat dense color="grey-8" @click="layerForward(1,false)")
        q-icon(name="keyboard_arrow_left" color="grey-8" size="30px")
      q-btn(round flat dense color="grey-8" @click="layerForward(1,true)")
        q-icon(name="keyboard_arrow_right" color="grey-8" size="30px")
      .col
      q-btn(round flat dense color="grey-8" icon="flip" @click="layerSet(1)" :style=`{position: 'relative'}`)
  //- debug
  //- div(
    v-if="player"
    :style=`{
      height: '50px',
    }`
    ).row.full-width.text-white.br
    //- small width: {{width}}, minWidthTotal: {{minWidthTotal}}, minWidthMin: {{minWidthMin}}, minWidth: {{minWidth}}, minWidthMax: {{minWidthMax}}
    //- small minDelta: {{minDelta}}, minCount: {{minCount}},
    small player.figureOffset {{player.figureOffset}}
  //- actions global
  div(
    :style=`{
      position: 'relative',
    }`
    ).row.full-width.items-center.content-center.q-pl-sm
    //- time
    small(
      :style=`{
        userSelect: 'none',
        pointerEvents: 'none',
      }`
      ).text-grey-6.q-mr-xs {{$time(player.currentTime)}}
    small(
      :style=`{
        userSelect: 'none',
        pointerEvents: 'none',
      }`
      ).text-grey-6 / {{$time(player.duration)}}
    .col
    //- middle: zoomIn/zoomOut
    div(
      :style=`{
        position: 'absolute', zIndex: 100,
        left: 'calc(50% - 58px)',
      }`
      ).row.full-height.items-center.content-center
      q-btn(
        @click="tapClick(0)"
        round flat dense  color="grey-6" icon="replay_5" :size="actionsSize").q-mr-sm
      q-btn(
        v-if="zoomed"
        @click="zoomOut()"
        round flat dense color="grey-6" :size="actionsSize")
        q-icon(name="unfold_less").rotate-90
      q-btn(
        v-if="!zoomed"
        @click="zoomIn()"
        round flat dense color="grey-6" :size="actionsSize")
        q-icon(name="unfold_more").rotate-90
      q-btn(
        @click="tapClick(1)"
        round flat dense  color="grey-6" icon="forward_5" :size="actionsSize").q-ml-sm
    //- right side
    //- q-btn(
      round flat dense color="grey-6" icon="more_vert" :size="actionsSize").q-mr-sm
    //- q-btn(
      round flat dense color="grey-6" icon="fullscreen" :size="actionsSize").q-mr-sm
    q-btn(
      v-if="player && !player.figure"
      @click="nodeCreate()"
      round flat dense color="green" icon="add_circle_outline")
    slot(name="actions")
</template>

<script>
export default {
  name: 'tintBarNew',
  props: ['player', 'contentKalpa', 'options'],
  components: {
    tintBarFigure: () => import('./tint_bar_figure.vue'),
    tintBarNode: () => import('./tint_bar_node.vue'),
  },
  data () {
    return {
      width: 0,
      height: 0,
      heightBar: 20,
      heightBarMin: 20,
      heightBarMax: 30,
      heightWrapper: 36,
      heightWrapperMin: 36,
      heightWrapperMax: 46,
      minWidth: 0,
      zoomed: null,
      zoomWorking: false,
      zoomPercent: null,
      zoomWrapperScrollingTimer: null,
      zoomWrapperScrolling: false,
      zoomWrapperScrollingAuthor: null,
      playerCurrentTimeTimer: null,
      leftRightMarginWidth: 0,
      tintPanning: false,
      tintRect: null,
      convertRect: null,
      actionsSize: 'md'
    }
  },
  created () {
    // if (this.start) {
    // }
    this.$log('created')
    // this.player.play()
    if (this.$q.platform.is.capacitor || this.$q.platform.is.desktop) {
      let muted = localStorage.getItem('k_muted')
      if (muted === 'false') {
        this.player.setState('muted', false)
      }
    }
  },
  computed: {
    minCount () {
      return Math.ceil(this.player.duration / 60)
    },
    minDelta () {
      let p = this.player.duration % 60
      return p / 60
    },
    minWidthMin () {
      let minWidthMin = this.width / this.minCount
      let width = 0
      for (let i = 0; i < this.minCount; i++) {
        if (i + 1 === this.minCount) {
          width += minWidthMin * this.minDelta
        }
        else {
          width += minWidthMin
        }
      }
      // this.$log('width/this.width', {width: width, 'this.width': this.width})
      // if we got smaller then width...
      if (width < this.width) {
        return minWidthMin / (width / this.width)
        // return minWidthMin
      }
      else {
        return minWidthMin
      }
    },
    minWidthMax () {
      let minWidthMax = this.width * 0.8
      let width = 0
      for (let i = 0; i < this.minCount; i++) {
        if (i + 1 === this.minCount) {
          width += minWidthMax * this.minDelta
        }
        else {
          width += minWidthMax
        }
      }
      if (width < this.width) {
        return this.minWidthMin
      }
      else {
        return minWidthMax
      }
    },
    minWidthTotal () {
      let width = 0
      for (let i = 0; i < this.minCount; i++) {
        if (i + 1 === this.minCount) {
          width += this.minWidthMin * this.minDelta
        }
        else {
          width += this.minWidthMin
        }
      }
      return width
    },
    duration () {
      return this.player.duration
    }
  },
  watch: {
    'player.currentTime': {
      async handler (to, from) {
        if (this.zoomWrapperScrolling) return
        if (!this.zoomed) return
        if (this.zoomWorking) return
        this.$log('player.currentTime TO', to)
        let ref = this.$refs['minutes-wrapper']
        let {width} = ref.getBoundingClientRect()
        let scrollLeft = (to / this.player.duration) * width
        this.zoomWrapperScrollingAuthor = 'player'
        this.$refs['zoom-wrapper'].scrollLeft = scrollLeft
        if (this.playerCurrentTimeTimer) {
          clearTimeout(this.playerCurrentTimeTimer)
          this.playerCurrentTimeTimer = null
        }
        this.playerCurrentTimeTimer = setTimeout(() => {
          this.zoomWrapperScrollingAuthor = null
        }, 200)
      }
    },
    'player.figure': {
      async handler (to, from) {
        this.$log('player.figure TO', to)
        if (to) {
          this.zoomIn()
          this.$tween.to(this, 0.5, {
            heightBar: this.heightBarMax,
            heightWrapper: this.heightWrapperMax,
          })
        }
        else {
          this.zoomOut()
          this.$tween.to(this, 0.5, {
            heightBar: this.heightBarMin,
            heightWrapper: this.heightWrapperMin,
          })
        }
      }
    },
    zoomed: {
      // immediate: true,
      handler (to, from) {
        this.$log('zoomed TO', to)
        this.zoomWorking = true
        this.$tween.to(this, 0.5, {
          leftRightMarginWidth: to ? this.width / 2 : 0,
          minWidth: to ? this.minWidthMax : this.minWidthMin,
          onCopmplete: async () => {
            this.$log('zoomed onComplete')
            this.zoomWorking = false
          },
          onUpdate: () => {
            if (!this.zoomPercent) return
            // this.$log('zoomed onUpdate')
            let ref = this.$refs['minutes-wrapper']
            let {width} = ref.getBoundingClientRect()
            let scrollLeft = (this.zoomPercent * width)
            // this.$log('zoomed onUpdate scrollLeft', scrollLeft)
            this.$refs['zoom-wrapper'].scrollLeft = scrollLeft
          }
        })
      }
    },
  },
  methods: {
    nodeCreate () {
      this.$log('nodeCreate')
      let start = this.player.currentTime
      let end = start + 30 > this.player.duration ? this.player.duration : start + 30
      // let composition = {
      //   id: Date.now().toString(),
      //   thumbUrl: this.contentKalpa.thumbUrl,
      //   thumbHeight: this.contentKalpa.thumbHeight,
      //   thumbWidth: this.contentKalpa.thumbWidth,
      //   outputType: 'VIDEO',
      //   layers: [
      //     {id: Date.now().toString(), contentOid: this.contentKalpa.oid, figuresAbsolute: [{t: start, points: []}, {t: end, points: []}]},
      //   ],
      //   operation: { items: null, operations: null, type: 'CONCAT'},
      //   __typename: 'Composition',
      // }
      let figure = [{t: start, points: []}, {t: end, points: []}]
      this.player.setState('figure', figure)
    },
    tapClick (index) {
      this.$log('tapClick', index)
      let t = this.player.currentTime
      if (index === 0) t -= 5
      if (index === 1) t += 5
      if (t < 0) t = 0
      if (t > this.player.duration) t = this.player.duration
      this.player.setCurrentTime(t)
    },
    convertPxToTime (px, _width) {
      // width (300px) ___ player.duration
      // px                t
      if (this.convertRect === null) {
        this.convertRect = this.$refs['minutes-wrapper'].getBoundingClientRect()
      }
      let width = _width || this.convertRect.width
      let t = (px * this.duration) / width
      return t
    },
    setCurrentTime (t) {
      // this.$log('setCurrentTime', t)
      // TODO: handle figures/offset here...
      this.player.setCurrentTime(t)
    },
    zoomWrapperOnScroll (e) {
      // this.$log('zoomWrapperOnScroll', this.zoomWrapperScrollingAuthor)
      if (this.zoomWrapperScrollingTimer) {
        clearTimeout(this.zoomWrapperScrollingTimer)
        this.zoomWrapperScrollingTimer = null
      }
      else {
        this.player.pause()
      }
      this.zoomWrapperScrolling = true
      this.zoomWrapperScrollingTimer = setTimeout(() => {
        this.zoomWrapperScrolling = false
      }, 200)
      // whos first?
      if (this.zoomWorking) return
      if (this.zoomWrapperScrollingAuthor === 'player') return
      // do stuff
      let ref = this.$refs['zoom-wrapper']
      let scrollWidth = ref.scrollWidth - (this.leftRightMarginWidth * 2)
      let scrollLeft = ref.scrollLeft
      let t = (scrollLeft / scrollWidth) * this.player.duration
      // handle t figureOffset
      if (t < 0) t = 0
      if (t > this.player.duration) t = this.player.duration
      // this.$log({scrollWidth: scrollWidth, scrollLeft: scrollLeft, t: t})
      this.player.setCurrentTime(t)
    },
    zoomWrapperOnPan (e) {},
    async zoomIn () {
      this.$log('zoomIn')
      // this.zoomWrapperScrollingAuthor = 'player'
      this.zoomPercent = this.player.currentTime / this.duration
      this.zoomed = true
      // await this.$wait(500)
      // this.zoomWrapperScrollingAuthor = null
      // do someting to save currentPosition...
    },
    async zoomOut () {
      this.$log('zoomOut')
      this.zoomed = false
      this.player.pause()
      // need to save currentTime
      this.zoomWrapperScrollingAuthor = 'player'
      await this.$wait(550)
      this.zoomWrapperScrollingAuthor = null
    },
    tintClick (e) {
      // this.$log('tintClick', e)
      let left = e.layerX
      let width = e.target.clientWidth
      this.$log({left, width})
      this.zoomPercent = left / width
      // this.zoomed = !this.zoomed
      let t = this.zoomPercent * this.player.duration
      this.$log('t', t)
      this.player.setCurrentTime(t)
    },
    tintOnPan (e) {
      // this.$log('tintOnPan', e)
      if (e.isFirst) {
        this.$emit('started')
        this.tintPanning = true
      }
      if (e.isFinal) {
        this.$emit('ended')
        this.tintPanning = false
      }
      // get rect position...
      if (this.tintRect === null) {
        this.tintRect = this.$refs['minutes-wrapper'].getBoundingClientRect()
        // this.tintRectLeft = rect.left
      }
      let left = e.position.left - this.tintRect.left
      let width = this.tintRect.width
      // this.$log('left/width', left, width)
      if (left < 0 || left > width) {
        this.$log('left < 0 || left > width !')
        return
      }
      let t = left / width * this.duration
      // this.$log('t', t)
      this.setCurrentTime(t)
      // this.barClick({layerX: left, target: {clientWidth: width}})
    },
  },
  mounted () {
    this.$log('mounted', this.player.duration)
    // this.zoomed = true
    let {width, height} = this.$refs['zoom-wrapper'].getBoundingClientRect()
    this.$set(this, 'width', width)
    this.$set(this, 'height', height)
    // this.width = width
    // this.height = height
    this.$log('mounted', {minCount: this.minCount, minWidthMin: this.minWidthMin, minWidth: this.minWidth, minWidthMax: this.minWidthMax, width, height})
    // let minCount = Math.ceil(this.player.duration / 60)
    // let minWidthMin = this.width / minCount
    // this.$log({minWidthMin: minWidthMin, minCount: minCount, width: width})
    this.minWidth = this.minWidthMin
  }
}
</script>
