<template lang="pug">
div(
  :style=`{
    position: 'absolute', zIndex: 2200,
    top: '-2px',
    height: 'calc(100% + 4px)',
    borderTop: '2px solid rgb(76,175,79)',
    borderBottom: '2px solid rgb(76,175,79)',
    borderRight: '8px solid rgb(76,175,79)',
    borderLeft: '8px solid rgb(76,175,79)',
    borderRadius: '3px',
  }`
  ).row
  //- figure duration hint reminder max 60sec...
  div(
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
  div(
    v-touch-pan.left.right.prevent.mouse="e => pointDrag(e, 1)"
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
  name: 'tintBarFigure',
  props: ['player', 'convert'],
  data () {
    return {
      pointDragging: false,
      pointDraggingIndex: -1,
    }
  },
  methods: {
    async pointDrag (e, index) {
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
      // this.$log('pointDrag t', t)
      this.player.setCurrentTime(t)
      this.player.figure[index].t = t
      // final
      if (e.isFinal) {
        this.pointDragging = false
        this.pointDraggingIndex = -1
        await this.$wait(300)
        this.$emit('final')
      }
    }
  }
}
</script>
