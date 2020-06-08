<template lang="pug">
.row.full-width
  div(
    :style=`{
      order: 2
    }`
    ).row.full-width.q-py-xs
    q-btn(round flat dense color="white" icon="play_arrow")
    q-btn(round flat dense color="white" icon="volume_up")
    .col
    q-btn(round flat dense color="white" icon="fast_rewind")
    q-btn(flat dense color="white")
      span {{ $time(stateExplorer.currentTime) }}
      span.q-mx-xs /
      span {{ $time(stateExplorer.duration) }}
    q-btn(round flat dense color="white" icon="fast_forward")
    .col
    q-btn(round flat dense color="white" icon="tune")
    q-btn(round flat dense color="white" icon="fullscreen")
  div(
    @click="barClick"
    v-touch-pan.mouse.left.right="barDrag"
    :style=`{
      position: 'relative',
      height: '50px',
      borderRadius: '10px',
      overflow: 'hidden',
    }`
    ).row.full-width.b-70.cursor-pointer
    //- now
    div(
      :style=`{
        position: 'absolute',
        zIndex: 1000,
        width: '2px',
        borderRadius: '1px', overflow: 'hidden',
        left: stateExplorer.currentTime/stateExplorer.duration*100+'%',
        pointerEvents: 'none',
      }`
      ).row.full-height.bg-green
    //- now left
    div(
      :style=`{
        position: 'absolute', zIndex: 100,
        left: '0px',
        width: barWidth ? barWidth+'%' : (stateExplorer.currentTime/stateExplorer.duration)*100+'%',
        pointerEvents: 'none',
        opacity: 0.8
      }`
      ).row.full-height.b-100
    //- layers
    div(
      :style=`{
        position: 'absolute', zIndex: 200,
        top: '0px',
        pointerEvents: 'none',
      }`).row.fit
      div(
        v-for="(l,li) in layers" :key="li"
        :style=`{
          position: 'absolute', zIndex: 300+li,
          width: '2px',
          left: l.figuresAbsolute[0].t/stateExplorer.duration*100+'%',
          opacity: 0.5
        }`
        ).row.full-height.bg-white
</template>

<script>
export default {
  name: 'contentProgress',
  props: ['stateExplorer'],
  data () {
    return {
      barWidth: null,
      barDragging: false
    }
  },
  computed: {
    layers () {
      return this.stateExplorer?.contentWs?.layers
    }
  },
  methods: {
    barClick (e) {
      this.$log('barClick', e)
      let width = e.target.clientWidth
      this.$log('width', width)
      let left = e.offsetX
      this.$log('left', left)
      let t = (left / width) * this.stateExplorer.duration
      this.$log('t', t)
      this.stateExplorer.set('currentTime', t)
      this.stateExplorer.player.setCurrentTime(t)
    },
    barDrag (e) {
      this.$log('barDrag', e)
      if (e.isFirst) {
        this.barDragging = true
        let left = e.evt.layerX || e.position.left
        this.$log('left', left)
        // alert('barDrag first' + left)
        // this.$tween.to(this, 0.3, {barHeight: this.barHeightMax})
        this.barWidth = (left / this.$el.clientWidth) * 100
      }
      if (e.isFinal) {
        this.barDragging = false
        // alert('barDrag final')
        // this.$tween.to(this, 0.3, {barHeight: this.barHeightMin})
        this.barWidth = null
      }
      if (!this.barWidth) return
      this.barWidth += (e.delta.x / this.$el.clientWidth) * 100
      let t = (this.barWidth / 100) * this.stateExplorer.duration
      this.$log('t', t)
      if (t > 0) {
        this.stateExplorer.set('currentTime', t)
        this.stateExplorer.player.setCurrentTime(t)
      }
    }
  }
}
</script>
