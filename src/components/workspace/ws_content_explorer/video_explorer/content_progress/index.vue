<template lang="pug">
.row.full-width.q-pb-sm
  //- tools
  div(
    :style=`{
      order: -1
    }`
    ).row.full-width.q-py-sm
    q-btn(
      @click="stateExplorer.playing ? stateExplorer.player.pause() : stateExplorer.player.play()"
      round flat dense color="grey-4"
      :icon="stateExplorer.playing ? 'pause' : 'play_arrow'")
    q-btn(round flat dense color="grey-4" icon="volume_up")
    .col
    q-btn(round flat dense color="grey-4" icon="fast_rewind" @click="fast(false)")
    q-btn(flat dense color="grey-4")
      span {{ $time(stateExplorer.currentTime) }}
      span.q-mx-xs /
      span {{ $time(stateExplorer.duration) }}
    q-btn(round flat dense color="grey-4" icon="fast_forward" @click="fast(true)")
    .col
    q-btn(
      @click="$store.commit('ui/stateSet', ['appFullscreen', !$store.state.ui.appFullscreen])"
      round flat dense color="grey-4"
      :icon="$store.state.ui.appFullscreen ? 'fullscreen_exit' : 'fullscreen'"
      )
    q-btn(round flat dense color="grey-4" icon="more_vert")
  //- bar
  div(
    @click="barClick"
    v-touch-pan.mouse.left.right="barDrag"
    :style=`{
      position: 'relative',
      height: '40px',
      borderRadius: '10px',
      overflow: 'hidden',
    }`
    ).row.full-width.b-70.cursor-pointer
    //- now
    div(
      :style=`{
        position: 'absolute',
        zIndex: 1000,
        width: '3px',
        borderRadius: '1px', overflow: 'hidden',
        left: stateExplorer.currentTime/stateExplorer.duration*100+'%',
        pointerEvents: 'none',
      }`
      ).row.full-height.bg-red
    //- now left WIDTH
    div(
      :style=`{
        position: 'absolute', zIndex: 100,
        left: '0px',
        width: barWidth ? barWidth+'%' : (stateExplorer.currentTime/stateExplorer.duration)*100+'%',
        pointerEvents: 'none',
        opacity: 0.8
      }`
      ).row.full-height.b-140
    //- LAYERS on the BAR
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
          left: (l.figuresAbsolute[0].t/stateExplorer.duration)*100+'%',
          width: stateExplorer.layerSelected === l.id ? ((l.figuresAbsolute[1].t-l.figuresAbsolute[0].t)/stateExplorer.duration)*100+'%' :'2px',
          background: stateExplorer.layerSelected === l.id ? l.color : 'white',
          opacity: stateExplorer.layerSelected === l.id ? 1 : 0.5,
        }`
        ).row.full-height
</template>

<script>
export default {
  name: 'contentProgress',
  props: ['statePage', 'stateExplorer'],
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
    fast (forward) {
      this.$log('fast', forward)
      let t = this.stateExplorer.currentTime
      if (forward) t += 5
      else t -= 5
      if (t < 0) t = 0
      if (t > this.stateExplorer.duration) t = this.stateExplorer.duration
      this.stateExplorer.set('currentTime', t)
      this.stateExplorer.player.setCurrentTime(t)
    },
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
      // this.$log('barDrag', e)
      if (e.isFirst) {
        this.barDragging = true
        let left = e.evt.layerX || e.position.left
        // this.$log('left', left)
        this.barWidth = (left / this.$el.clientWidth) * 100
      }
      if (e.isFinal) {
        this.barDragging = false
        this.barWidth = null
      }
      if (!this.barWidth) return
      this.barWidth += (e.delta.x / this.$el.clientWidth) * 100
      let t = (this.barWidth / 100) * this.stateExplorer.duration
      // this.$log('t', t)
      if (t >= 0 && t <= this.stateExplorer.duration) {
        this.stateExplorer.set('currentTime', t)
        this.stateExplorer.player.setCurrentTime(t)
      }
    }
  }
}
</script>
