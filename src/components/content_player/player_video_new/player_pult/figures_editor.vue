<template lang="pug">
div(
  accessKey="figures-wrapper"
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
    small.text-white {{$t('1 min maximum!')}}
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
</template>

<script>
export default {
  name: 'figureEditor',
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
      return this.player.figures[1].t - this.player.figures[0].t <= 60
    },
    borderColor () {
      if (this.player.figures) {
        if (this.player.figures[1].t - this.player.figures[0].t > 60) {
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
      let t = this.player.figures[pointIndex].t
      // add tick of 0.1 to t of figures
      if (goingForward) t += 0.1
      else t -= 0.1
      // check t > 0 and t < duration
      if (t < 0) t = 0
      if (t > this.player.duration) t = this.player.duration
      // this.$log('t', t)
      this.$set(this.player.figures[pointIndex], 't', t)
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
        this.player.setCurrentTime(this.player.figures[pointIndex].t)
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
        // this.player.events.emit('figures-forward-start')
      }
      // work
      let tNow = this.player.figures[index].t
      let tDelta = this.convert(e.delta.x)
      let t = tNow + tDelta
      // this.$log('pointDrag t', t)
      // handle <0 and  >duration case
      if (t <= 0 || t >= this.player.duration) return
      this.player.setCurrentTime(t)
      this.player.figures[index].t = t
      // final
      if (e.isFinal) {
        // after dragging start playing
        if (index === 0) {
          this.player.play()
        }
        if (index === 1) {
          let t = this.player.currentTime - 2
          if (t > this.player.figures[0].t) this.player.setCurrentTime(t)
          else this.player.setCurrentTime(this.player.figures[0].t)
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
