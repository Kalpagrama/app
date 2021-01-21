<template lang="pug">
div(
  :style=`{
    position: 'absolute', zIndex: 2000,
    top: '-2px',
    height: 'calc(100% + 4px)',
    borderTop: '2px solid rgb(76,175,79)',
    borderBottom: '2px solid rgb(76,175,79)',
    borderRight: '8px solid rgb(76,175,79)',
    borderLeft: '8px solid rgb(76,175,79)',
    borderRadius: '3px',
  }`
  ).row
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
  div(
    v-touch-pan.left.right.prevent.mouse="e => pointDrag(e, 0)"
    :style=`{
      position: 'absolute', zIndex: 2010,
      top: '-6px',
      left: -8-6+'px',
      width: '20px',
      height: 'calc(100% + 12px)',
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
  div(
    v-touch-pan.left.right.prevent.mouse="e => pointDrag(e, 1)"
    :style=`{
      position: 'absolute', zIndex: 2020,
      top: '-6px',
      right: -8-6+'px',
      width: '20px',
      height: 'calc(100% + 12px)',
      cursor: 'grabbing',
    }`
    ).row
</template>

<script>
export default {
  name: 'tintBarFigure',
  props: ['player', 'convert'],
  data () {
    return {
      pointDragging: false,
      pointDraggingIndex: -1,
    }
  },
  methods: {
    pointDrag (e, index) {
      // this.$log('pointDrag', e, index)
      // first
      if (e.isFirst) {
        this.$emit('first')
        this.pointDragging = true
        this.pointDraggingIndex = index
        this.player.pause()
      }
      // work
      let tNow = this.player.figure[index].t
      let tDelta = this.convert(e.delta.x)
      let t = tNow + tDelta
      this.$log('pointDrag t', t)
      this.player.setCurrentTime(t)
      this.player.figure[index].t = t
      // final
      if (e.isFinal) {
        this.$emit('final')
        this.pointDragging = false
        this.pointDraggingIndex = -1
      }
    }
  }
}
</script>
