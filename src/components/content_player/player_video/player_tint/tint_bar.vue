<template lang="pug">
.row.full-width.justify-center.q-px-md
  div(
    :style=`{
      maxWidth: $store.state.ui.pageWidth+'px',
    }`
    ).row.full-width
    div(
      :style=`{
        position: 'relative',
        height: '50px',
      }`
      ).row.full-width
      //- bar background
      div(
        :style=`{
          position: 'relative',
          height: '50px',
          borderRadius: '10px',
          overflow: 'hidden',
        }`
        ).row.full-width.b-40
        div(
          v-for="(f,fi) in player.figures" :key="fi"
          @click="figureIndex = fi"
          @mouseenter="figureHover = fi"
          :style=`{
            //- pointerEvents: 'none',
            position: 'absolute', zIndex: 100+fi,
            background: (figureHover === fi || figureIndex === fi) ? 'rgb(200,200,200,0.5)' : 'none',
            left: (f.figures[0].t/duration)*100+'%',
            width: ((f.figures[1].t-f.figures[0].t)/duration)*100+'%',
            borderLeft: figureIndex === fi ? 'none' : '2px solid rgba(200,200,200,0.4)',
            //- width: '2px',
          }`
          ).row.full-height
      //- bar bottom
      div(
        @click="barClick"
        :style=`{
          position: 'absolute', zIndex: 1000,
          bottom: '0px',
          height: '20px',
          borderRadius: '0 0 10px 10px',
          overflow: 'hidden',
        }`
        ).row.full-width.items-end.content-end
        //- small(
          :style=`{
            fontSize: '10px',
            pointerEvents: 'none',
            userSelect: 'none',
            position: 'absolute', zIndex: 1001,
            left: '4px', top: '0px',
          }`
          ).text-grey-5 {{$time(player.currentTime)}} / {{$time(player.duration)}}
        div(
          :style=`{
            position: 'relative',
            height: '4px',
            width: (player.currentTime/player.duration)*100+'%',
            zIndex: 1000,
            pointerEvents: 'none',
          }`
          ).row.bg-red
    //- footer: time, actions
    div(
      :style=`{
        paddingLeft: '12px',
        paddingRight: '12px',
      }`
      ).row.full-width.items-center.content-center.justify-between.q-py-xs
      small(:style=`{fontSize: '10px'}`).text-white {{$time(player.currentTime)}} / {{$time(player.duration)}}
      q-btn(
        round flat dense color="white" size="md" icon="fullscreen")
//- div(
  v-if="player"
  :style=`{
    //- position: 'absolute', zIndex: 1000, transform: 'translate3d(0,0,10px)',
    //- bottom: '0px',
    //- bottom: '-10px',
  }`
  ).row.full-width.justify-center.q-px-md
  div(
    :style=`{
      position: 'relative',
      maxWidth: $store.state.ui.pageWidth+'px',
      //- borderRadius: '10px 10px 0 0',
      //- overflow: 'hidden',
    }`
    ).row.full-width
    //- time
    small(
      :style=`{
        pointerEvents: 'none',
        userSelect: 'none',
        position: 'absolute', zIndex: 1001,
        left: '4px', top: '4px',
      }`
      ).text-white {{$time(player.currentTime)}} / {{$time(player.duration)}}
    //- top bar
    div(
      @click="barClick"
      ref="bar-top"
      :style=`{
        height: '30px',
      }`
      ).row.full-width.items-end.content-end
      div(
        :style=`{
          pointerEvents: 'none',
          width: (player.currentTime/player.duration)*100+'%',
          height: '4px',
        }`
        ).row.bg-red
    //- bottom bar
    div(
      ref="bar-bottom"
      :style=`{
        position: 'relative',
        height: '40px',
        borderRadius: '10px',
        overflow: 'hidden',
      }`
      ).row.full-width.b-40
      div(
        :style=`{
          pointerEvents: 'none',
          width: (player.currentTime/player.duration)*100+'%',
          height: '40px',
          borderRadius: '10px 0 0 10px',
        }`
        ).row.b-50
      //- figures debug pane
      //- div(
        :style=`{
          position: 'absolute', zIndex: 10000,
          left: '0px', top: '-300px',
          width: '500px', height: '300px',
        }`
        ).column.b-30
        .col.full-width.scroll
          div(v-for="(f,fi) in player.figures" :key="fi").row.full-width.q-pa-xs.q-mb-xs.bg
            small.text-white {{ $time(f.figures[0].t) }}
      //- points
      //- figures
      div(
        v-for="(f,fi) in player.figures" :key="fi"
        @click="figureIndex = fi"
        @mouseenter="figureHover = fi"
        :style=`{
          //- pointerEvents: 'none',
          position: 'absolute', zIndex: 10+fi,
          background: (figureHover === fi || figureIndex === fi) ? 'rgb(200,200,200,0.5)' : 'none',
          left: (f.figures[0].t/duration)*100+'%',
          width: ((f.figures[1].t-f.figures[0].t)/duration)*100+'%',
          borderLeft: figureIndex === fi ? 'none' : '2px solid rgba(200,200,200,0.4)',
          //- width: '2px',
        }`
        ).row.full-height
        div(
          v-if="figureIndex === fi"
          :style=`{
            position: 'absolute',
            zIndex: 100+fi,
            top: '-70px',
            left: '0px',
            height: '50px',
            //- width: '100px',
            borderRadius: '10px',
          }`
          ).row.items-start.content-start
          img(
            draggable="false"
            :src="player.figures[fi].thumbUrl"
            :style=`{
              height: '50px',
              borderRadius: '10px',
            }`
            )
          .row.full-width.q-px-sm
            small(:style=`{whiteSpace: 'nowrap',}`).text-white {{ player.figures[fi].name }}
          //- small.text-white {{ $time(player.figures[fi].figures[0].t) }}
</template>

<script>
export default {
  name: 'tintBar',
  props: ['player', 'options'],
  computed: {
    duration () {
      return this.player.duration
    }
  },
  data () {
    return {
      figureIndex: null,
      figureHover: null,
    }
  },
  watch: {
    figureIndex: {
      handler (to, from) {
        if (to >= 0) {
          this.player.setCurrentTime(this.player.figures[to].figures[0].t)
        }
      }
    }
  },
  methods: {
    barClick (e) {
      this.$log('barClick', e)
      // this.$emit('started')
      let left = e.layerX
      let width = e.target.clientWidth
      // if (left > width) return
      // this.$log('left/width', left, width)
      let t = (left / width) * this.duration
      // this.$log('t', this.$time(t))
      // this.player.events.emit('bar-click', {t: t})
      // this.setCurrentTime(t)
      this.player.setCurrentTime(t)
      this.player.play()
    },
    onKeyDown (e) {
      this.$log('onKeyDown', this.figureIndex)
      if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
        if (this.figureIndex === null) {
          this.figureIndex = 0
        }
        else {
          let i = e.key === 'ArrowLeft' ? this.figureIndex - 1 : this.figureIndex + 1
          if (i < 0) {
            this.figureIndex = this.player.figures.length - 1
          }
          else if (i > this.player.figures.length - 1) {
            this.figureIndex = 0
          }
          else {
            this.figureIndex = i
          }
        }
      }
    }
  },
  mounted () {
    this.$log('mounted')
    window.addEventListener('keydown', this.onKeyDown)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    window.removeEventListener('keydown', this.onKeyDown)
  }
}
</script>
