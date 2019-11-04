<template lang="pug">
div(:style=`{height: '66px'}`).row.full-width.items-end.content-end
  //- top actions
  div(:style=`{height: '48px', paddingLeft: '10px', paddingRight: '20px'}`).row.full-width
    //- play/pause button
    div(:style=`{height: '48px', width: '48px'}`).row.items-center.justify-center
      q-btn(round flat color="white" :icon="video.playStarted ? 'pause' : 'play_arrow'" @click="video.click()")
    .col.full-height
      .row.fit.items-center.q-px-sm
        span(style=`user-select: none`).text-white {{ $time(now) }}/{{ $time(duration) }}
    //- volume up/down button
    div(:style=`{height: '48px', minWidth: '48px'}`).row.items-center.content-center.justify-center
      q-btn(round flat color="white" icon="fullscreen")
      q-btn(round flat color="white" icon="volume_up")
  //- bottom line with points
  div(:style=`{height: '18px', paddingLeft: '30px', paddingRight: '30px'}`).row.full-width
    div(
      @click="timelineClick"
      v-touch-pan.mouse.stop="timelinePan"
      :style=`{position: 'relative', height: '18px', borderRadius: '2px', overflow: 'hidden'}`).row.full-width.items-end.bg-grey-6
      div(:style=`{pointerEvents: 'none', height: '18px', width: now/duration*100+'%'}`).row.bg-white
      //- div(
      //-   v-for="(p, pi) in fragment.relativePoints" :key="pi" v-if="(pi+1) % 2 !== 0"
      //-   :style=`{
      //-     position: 'absolute', left: (p.x/duration)*100+'%', pointerEvents: 'none',
      //-     borderRadius: '1px',
      //-     width: Math.abs(p.x - fragment.relativePoints[pi + 1].x)/duration*100+'%',
      //-     height: '9px', background: $randomColor(pi)}`).row
</template>

<script>
export default {
  name: 'videoTools',
  props: ['video', 'now', 'duration', 'fragment'],
  data () {
    return {
    }
  },
  methods: {
    async timelineClick (e) {
      this.$log('timelineClick start')
      let left = e.layerX
      let w = e.target.clientWidth
      let now = this.duration * left / w
      // this.$log('now', now)
      await this.video.go(now)
      // this.$emit('now', now)
      this.$log('timelineClick done')
    },
    timelinePan (e) {
      // this.$log('timelinePan', e)
      let left = e.position.left - 30
      let w = this.$q.screen.width - 60
      let now = this.duration * left / w
      // this.$log('now', now)
      this.video.go(now)
    }
  },
  mounted () {
    this.$log('mounted', this.video)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
