<template lang="pug">
div(
  :style=`{
    position: 'absolute', bottom: '0px', left: 0, zIndex: 20000}`
  ).row.full-width.items-start.content-start
  //- pregress wrapper
  .row.full-width.items-start.content-start.q-px-xl
    //- progress bar & time
    div(
      @click="progressClick"
      :style=`{height: height+'px', borderRadius: '10px'}`).row.full-width.items-center.content-center
      //- progress
      div(
        :style=`{position: 'relative', height: '20px', zIndex: 200, borderRadius: '10px', overflow: 'hidden'}`
        ).row.full-width.bg-grey-9.cursor-pointer
        //- progress %
        div(:style=`{
          position: 'absolute', zIndex: 100, left: 0, width: (now/duration)*100+'%',
          pointerEvents: 'none', borderRight: '2px solid #4caf50'}`
          ).row.full-height.bg-grey-3
          div(:style=`{position: 'absolute', right: '-10px', top: '0px', height: '20px', width: '20px', borderRadius: '50%'}`).bg-green
    //- progress actions
    div(:style=`{height: '60px'}`).row.full-width.items-center
      //- play/pause
      div(
        :style=`{width: '60px', height: '60px'}`
        ).row.full-height.items-center.content-center.justify-center
        q-btn(
          round push  @click="videoPlayPause"
          :color="meta.playing ? 'red' : 'green'"
          :icon="meta.playing ? 'pause' : 'play_arrow'"
          :style=`{background: 'rgba(0,0,0,0.3)'}`)
      //- stats
      .col
        .row.fit.items-center.content-center
          span(
            :style=`{pointerEvents: 'none', borderRadius: '10px', background: 'rgba(0,0,0,0.3)'}`
            ).text-white.q-pa-sm.q-ml-sm {{ $time(now)+' / '+$time(duration) }}
      //- sound
      div(
        :style=`{width: '60px', height: '60px'}`
        ).row.full-height.items-center.content-center.justify-center
        q-btn(
          round outline @click="$emit('meta', ['muted', !meta.muted]), player.setMuted(meta.muted)"
          color="white"
          :icon="meta.muted ? 'volume_up' : 'volume_off'"
          :style=`{background: 'rgba(0,0,0,0.3)'}`)
      //- fullscreen
      //- div(
      //-   v-show="false"
      //-   :style=`{width: '44px'}`
      //-   ).row.full-height.items-center.content-center.justify-center
      //-   q-btn(
      //-     round flat color="green" @click="videoFullscreen()"
      //-     :icon="$q.fullscreen.isActive ? 'fullscreen_exit' : 'fullscreen'"
      //-     :style=`{background: 'rgba(0,0,0,0.3)'}`)
</template>

<script>
// TODO hide when playing...
export default {
  name: 'playerVideoProgress',
  props: ['player', 'now', 'duration', 'videoUpdate', 'videoPlayPause', 'meta'],
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
      this.$emit('meta', ['mode', 'watch'])
      this.$emit('meta', ['layerIndexPlay', -1])
      this.player.setCurrentTime(to)
      this.videoUpdate(null, to)
    }
  }
}
</script>
