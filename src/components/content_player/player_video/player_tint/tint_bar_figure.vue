<template lang="pug">
div(
  accessKey="figure-wrapper"
  :style=`{
    position: 'absolute', zIndex: 2200,
    top: '-2px',
    height: 'calc(100% + 4px)',
    borderTop: '2px solid '+borderColor,
    borderBottom: '2px solid '+borderColor,
    borderRight: '8px solid '+borderColor,
    borderLeft: '8px solid '+borderColor,
    borderRadius: '3px',
  }`
  ).row
  div(
    v-if="!canPublish"
    :style=`{
      position: 'absolute', zIndex: 23300,
      pointerEvents: 'none',
      //- opacity: 0.8,
      background: 'rgba(255,0,0,0.5)',
    }`
    ).row.fit.items-center.content-center.justify-center
    small.text-white Максимум 1 минута
  //- figure duration hint reminder max 60sec...
  //- div(
    :style=`{
      position: 'absolute', zIndex: 100, top: '-18px',
      height: '10px',
      pointerEvents: 'none',
    }`
    ).row.full-width.justify-center
    small(
      :class=`{
        'text-red': player.figure[1].t-player.figure[0].t > 60,
        'text-grey-7': player.figure[1].t-player.figure[0].t <= 60
        }`
      :style=`{
        userSelect: 'none',
        pointerEvents: 'none',
        fontSize: '10px',
      }`
      ) {{$time(player.figure[1].t-player.figure[0].t)}}
  //- header, play
  //- div(
    :style=`{
      position: 'absolute', zIndex: 2001,
      top: '-36px',
      height: '36px',
    }`
    ).row.full-width.bg-red
    q-btn(round flat dense color="white" icon="play_arrow")
  //- drag indicator icon left
  div(
    :style=`{
      pointerEvents: 'none',
      position: 'absolute', zIndex: 2001,
      top: '0px',
      left: '-8px',
      width: '8px',
      height: '100%',
    }`
    ).row.items-center.content-center.justify-center
    q-icon(
      name="more_vert" color="white"
      :size="pointDraggingIndex === 0 ? '18px' : '14px'")
  //- drag handle left
  //- @click.stop.self="pointClick(0)"
  div(
    v-touch-pan.left.right.prevent.mouse="e => pointDrag(e, 0)"
    :class=`{
    }`
    :style=`{
      position: 'absolute', zIndex: 2010,
      top: '-10px',
      left: -25-6+'px',
      width: '50px',
      height: 'calc(100% + 20px)',
      cursor: 'grabbing',
    }`
    ).row
  //- drag actions
  //- div(
    v-if="player.figureFocused === 0"
    :style=`{
      position: 'absolute', zIndex: 2020,
      left: '-36px',
      bottom: '-40px',
    }`).row.no-wrap
    q-btn(
      @click.stop="figureForward(0,false)"
      round flat dense color="white" icon="keyboard_arrow_left")
    q-btn(
      @click.stop="figureForward(0,true)"
      round flat dense color="white" icon="keyboard_arrow_right")
  //- drag anchor
  //- div(
    v-if="player.figureFocused === 0"
    :class=`{
    }`
    :style=`{
      position: 'absolute', zIndex: 2020,
      top: '-38px',
      left: -18+'px',
    }`
    ).row.items-end.content-end
    q-btn(
      @click="player.setState('figureFocused', null)"
      round flat dense color="white" icon="push_pin")
  //- drag indicator icon right
  div(
    :style=`{
      pointerEvents: 'none',
      position: 'absolute', zIndex: 2001,
      top: '0px',
      right: '-8px',
      width: '8px',
      height: '100%',
    }`
    ).row.items-center.content-center.justify-center
    q-icon(
      name="more_vert" color="white"
      :size="pointDraggingIndex === 1 ? '18px' : '14px'")
  //- drag handle right
  //- @click.stop.self="pointClick(1)"
  div(
    v-touch-pan.left.right.prevent.mouse="e => pointDrag(e, 1)"
    :class=`{
    }`
    :style=`{
      position: 'absolute', zIndex: 2020,
      top: '-10px',
      right: -25-6+'px',
      width: '50px',
      height: 'calc(100% + 20px)',
      cursor: 'grabbing',
    }`
    ).row
  //- drag actions
  //- div(
    v-if="player.figureFocused === 1"
    :style=`{
      position: 'absolute', zIndex: 2020,
      right: '-36px',
      bottom: '-40px',
    }`).row.no-wrap
    q-btn(
      @click.stop="figureForward(1,false)"
      round flat dense color="white" icon="keyboard_arrow_left")
    q-btn(
      @click.stop="figureForward(1,true)"
      round flat dense color="white" icon="keyboard_arrow_right")
  //- drag anchor
  //- div(
    v-if="player.figureFocused === 1"
    :class=`{
    }`
    :style=`{
      position: 'absolute', zIndex: 2020,
      top: '-38px',
      right: -18+'px',
    }`
    ).row.items-end.content-end
    q-btn(
      @click="player.setState('figureFocused', null)"
      round flat dense color="white" icon="push_pin")
</template>

<script>
export default {
  name: 'tintBarFigure',
  props: ['player', 'convert'],
  data () {
    return {
      pointDragging: false,
      pointDraggingIndex: -1,
      // pointClicked: null,
      figureForwardTimer: null,
    }
  },
  computed: {
    canPublish () {
      return this.player.figure[1].t - this.player.figure[0].t <= 60
    },
    borderColor () {
      if (this.player.figure) {
        if (this.player.figure[1].t - this.player.figure[0].t > 60) {
          return 'red'
        }
        else {
          return 'rgb(76,175,79)'
        }
      }
      else {
        return 'rgb(76,175,79)'
      }
    }
  },
  methods: {
    async figureForward (pointIndex, goingForward) {
      // this.$log('figureForward', pointIndex, goingForward)
      // this.player.pause()
      let t = this.player.figure[pointIndex].t
      // add tick of 0.1 to t of figure
      if (goingForward) t += 0.1
      else t -= 0.1
      // check t > 0 and t < duration
      if (t < 0) t = 0
      if (t > this.player.duration) t = this.player.duration
      // this.$log('t', t)
      this.$set(this.player.figure[pointIndex], 't', t)
      this.player.setCurrentTime(t)
      // check timer ? clear timeout
      if (this.figureForwardTimer) {
        clearTimeout(this.figureForwardTimer)
        this.figureForwardTimer = null
      }
      // no timer ? its first click !
      else {
        this.$log('figureForward FIRST')
      }
      // wait for the end..
      this.figureForwardTimer = setTimeout(async () => {
        this.$log('figureForward FINAL')
        // this.player.setState('figureFocused', true)
        // if (pointIndex === 0) {
        //   // do nothing ? focus and play
        //   // this.player.play()
        // }
        // if (pointIndex === 1) {
        //   // play last 3 sec if possible ?
        //   // or from the start...
        //   let t = this.player.figure[1].t - 3
        //   if (t < this.player.figure[0].t) {
        //     t = this.player.figure[0].t
        //   }
        //   await this.$wait(300)
        //   this.player.setCurrentTime(t)
        //   // this.player.play()
        // }
      }, 700)
    },
    pointClick (pointIndex) {
      this.$log('pointClick', pointIndex)
      // this.pointClicked = pointIndex
      if (this.player.figureFocused === pointIndex) {
        this.player.setState('figureFocused', null)
      }
      else {
        this.player.setState('figureFocused', pointIndex)
        this.player.setCurrentTime(this.player.figure[pointIndex].t)
      }
    },
    async pointDrag (e, index) {
      // this.$log('pointDrag', e, index)
      // first
      if (e.isFirst) {
        this.$emit('first')
        this.pointClicked = null
        this.pointDragging = true
        this.pointDraggingIndex = index
        this.player.pause()
        this.player.events.emit('figure-forward-start')
      }
      // work
      let tNow = this.player.figure[index].t
      let tDelta = this.convert(e.delta.x)
      let t = tNow + tDelta
      // this.$log('pointDrag t', t)
      this.player.setCurrentTime(t)
      this.player.figure[index].t = t
      // final
      if (e.isFinal) {
        // after dragging start playing
        if (index === 0) {
          this.player.play()
        }
        if (index === 1) {
          let t = this.player.currentTime - 2
          if (t > this.player.figure[0].t) this.player.setCurrentTime(t)
          else this.player.setCurrentTime(this.player.figure[0].t)
          this.player.play()
        }
        this.pointDragging = false
        this.pointDraggingIndex = -1
        await this.$wait(300)
        this.$emit('final')
      }
    }
  }
}
</script>
