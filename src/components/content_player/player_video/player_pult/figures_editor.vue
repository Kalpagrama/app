<template lang="pug">
// весь таймлайн
.row.full-width.relative-position
  // figure shape
  //div(
  //  :style=`{
  //  left: 'calc(' + (this.player.figures[0].t/player.duration)*100+'% - 0px)',
  //  width:'calc(' + ((this.player.figures[1].t-this.player.figures[0].t)/player.duration)*100+'% + 0px)',
  //  top: '-2px',
  //  height: 'calc(100% + 4px)',
  //  }`
  //).row.absolute.z-max.bb
  div(
    :style=`{
    left: 'calc(' + (this.player.figures[0].t/player.duration)*100+'% - 8px)',
    width:'calc(' + ((this.player.figures[1].t-this.player.figures[0].t)/player.duration)*100+'% + 16px)',
    top: '-2px',
    height: 'calc(100% + 4px)',
    borderTop: '2px solid '+borderColor,
    borderBottom: '2px solid '+borderColor,
    borderRight: '8px solid '+borderColor,
    borderLeft: '8px solid '+borderColor,
    borderRadius: '3px',
    }`
  ).row.absolute
    // guard
    div( v-if="!canPublish"
      :style=`{ pointerEvents: 'none', opacity: 1, background: $getPaletteColor('red-8') }`
    ).row.fit.items-center.content-center.justify-center.absolute
      small.text-white {{$t('1 min maximum!')}}
    //- drag indicator icon left
    div(
      :style=`{ pointerEvents: 'none', top: '0px', left: '-8px', width: '8px', height: '100%'}`
    ).row.items-center.content-center.justify-center.absolute
      q-icon( name="more_vert" color="white" :size="pointDraggingIndex === 0 ? '18px' : '14px'")
    //- drag indicator icon right
    div(
      :style=`{ pointerEvents: 'none',top: '0px',right: '-8px',width: '8px',height: '100%',}`
    ).row.items-center.content-center.justify-center.absolute
      q-icon(name="more_vert" color="white" :size="pointDraggingIndex === 1 ? '18px' : '14px'")
  // drag handle left
  div(
    v-touch-pan.left.right.prevent.mouse="pointDragLeft"
    :style=`{
    top: '-10px',
    left: 'calc('+(this.player.figures[0].t / this.player.duration) * 100+'% - 25px)',
    width: '50px',
    height: 'calc(100% + 20px)',
    cursor: 'grabbing',
  }`
  ).row.absolute
  //- drag handle right
  div(
    v-touch-pan.left.right.prevent.mouse="pointDragRight"
    :style=`{
    top: '-10px',
    left: 'calc('+(this.player.figures[1].t / this.player.duration) * 100+'% - 25px)',
    width: '50px',
    height: 'calc(100% + 20px)',
    cursor: 'grabbing',
  }`
  ).row.absolute
</template>

<script>
import cloneDeep from 'lodash/cloneDeep'
import { assert } from 'src/system/common/utils'

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
          return this.$getPaletteColor('red-8')
        }
        else {
          return this.$getPaletteColor('green-8')
        }
      }
      else {
        return this.$getPaletteColor('green-8')
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
      this.$set_deprecated(this.player.figures[pointIndex], 't', t)
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
    async pointDragLeft(details){
      return await this.pointDrag(details, 0)
    },
    async pointDragRight(details){
      return await this.pointDrag(details, 1)
    },
    async pointDrag (e, index) {
      assert(index === 1 || index === 0)
      this.$log('pointDrag', e, index)
      // First
      if (e.isFirst) {
        this.$emit('first')
        this.pointClicked = null
        this.pointDragging = true
        this.pointDraggingIndex = index
        this.player.pause()
        this.player.events.emit('figures-forward-start')
      }
      // Get time
      let tDelta = this.convert(e.delta.x)
      let t = this.player.figures[index].t + tDelta
      // this.$log('pointDrag t', t)
      // Handle <0 and  >duration case
      if (t <= 0 || t >= this.player.duration) return
      // Handle index 0 > 1
      if (index === 0 && t >= this.player.figures[1].t - 0.4) return
      // Handle index 1 < 0
      if (index === 1 && t <= this.player.figures[0].t + 0.4) return
      // Set time
      this.player.setCurrentTime(t)
      this.player.figures[index].t = t
      // Final
      if (e.isFinal) {
        // after dragging start playing
        if (index === 0) {
          this.player.play()
        }
        if (index === 1) {
          // let t = this.player.currentTime - 2
          // if (t > this.player.figures[0].t) this.player.setCurrentTime(t)
          // else this.player.setCurrentTime(this.player.figures[0].t)
          this.player.play()
        }
        this.pointDragging = false
        this.pointDraggingIndex = -1
        // await this.$wait(300)
        this.$emit('final')
      }
    }
  }
}
</script>
