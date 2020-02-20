<template lang="pug">
div(
  :style=`{
    position: 'absolute', bottom: '16px', left: 0, zIndex: 300}`
  ).row.full-width.items-start.content-start
  //- pregress wrapper
  .row.full-width.items-start.content-start.q-px-sm
    //- progress actions
    div(:style=`{height: '60px'}`).row.full-width.items-center
      //- play/pause
      div(
        v-show="true"
        :style=`{width: '44px'}`
        ).row.full-height.items-center.content-center.justify-center
        q-btn(
          round flat color="green" @click="videoPlayPause"
          :icon="playing === true ? 'pause' : 'play_arrow'"
          :style=`{background: 'rgba(0,0,0,0.3)'}`)
      //- stats
      .col
        .row.fit.items-center.content-center
          span(
            :style=`{pointerEvents: 'none', borderRadius: '10px', background: 'rgba(0,0,0,0.3)'}`
            ).text-white.q-pa-sm.q-ml-sm {{$time(now)+' / '+$time(duration)}}
      //- fullscreen
      div(
        v-show="false"
        :style=`{width: '44px'}`
        ).row.full-height.items-center.content-center.justify-center
        q-btn(
          round flat color="green" @click="videoFullscreen()"
          :icon="$q.fullscreen.isActive ? 'fullscreen_exit' : 'fullscreen'"
          :style=`{background: 'rgba(0,0,0,0.3)'}`)
    //- progress bar & time
    div(
      :style=`{height: height+'px', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.bg-grey-10
      //- progress
      .col.full-height
        div(
          @click="progressClick"
          :style=`{position: 'relative', zIndex: 200, borderRadius: '10px', overflow: 'hidden'}`
          ).row.fit.bg-grey-9.cursor-pointer
          //- progress %
          div(:style=`{
            position: 'absolute', zIndex: 100, left: 0, width: (now/duration)*100+'%',
            pointerEvents: 'none', borderRight: '2px solid #4caf50'}`
            ).row.full-height.bg-grey-7
</template>

<script>
// TODO hide when playing...
export default {
  name: 'playerVideoProgress',
  props: ['player', 'now', 'duration', 'videoUpdate'],
  data () {
    return {
      height: 20
    }
  },
  methods: {
    progressClick (e) {
      // this.$log('progressClick', e)
      let w = e.target.clientWidth
      let x = e.offsetX
      let to = (this.duration * x) / w
      this.player.setCurrentTime(to)
      this.videoUpdate(to)
    }
  }
}
</script>
