<template lang="pug">
.row.full-width
  div(
    :style=`{
      order: 2
    }`
    ).row.full-width.q-py-xs
    q-btn(
      @click="stateExplorer.playing ? stateExplorer.player.pause() : stateExplorer.player.play()"
      round flat dense color="white"
      :icon="stateExplorer.playing ? 'pause' : 'play_arrow'")
    q-btn(round flat dense color="white" icon="volume_up")
    .col
    q-btn(round flat dense color="white" icon="fast_rewind" @click="fast(false)")
    q-btn(flat dense color="white")
      span {{ $time(stateExplorer.currentTime) }}
      span.q-mx-xs /
      span {{ $time(stateExplorer.duration) }}
    q-btn(round flat dense color="white" icon="fast_forward" @click="fast(true)")
    .col
    q-btn(round flat dense color="white" icon="tune")
    q-btn(
      v-if="true"
      @click="$store.commit('ui/stateSet', ['appFullscreen', !$store.state.ui.appFullscreen])"
      round flat dense color="white"
      :icon="$store.state.ui.appFullscreen ? 'fullscreen_exit' : 'fullscreen'"
      )
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
