<template lang="pug">
.row.full-width.q-px-xs
  //- play/pause
  q-btn(
    @click="playPause()"
    round flat dense
    :icon="player.playing ? 'pause' : 'play_arrow'"
    :color="player.playing ? 'red' : 'white'")
  //- progress wrapper
  .col.q-px-xs
    div(
      :style=`{position: 'relative', borderRadius: '10px',}`
      ).row.fit.items-center.content-center.justify-between.b-90
      //- stats
      div(
        :style=`{position: 'absolute', zIndex: 110, pointerEvents: 'none'}`
        ).row.fit.items-center.content-center.justify-between.q-px-sm
        small.text-black {{$time(layerStart)}}
        small.text-black {{$time(layerDuration)}}
        small.text-black {{$time(layerEnd)}}
      //- progress
      div(
        v-if="player.currentTime >= layerStart && player.currentTime <= layerEnd"
        :style=`{
          position: 'absolute', zIndex: 100, left: '0px',
          width: (player.currentTime-layerStart)/layerDuration*100+'%',
          borderRadius: '10px 0 0 10px',
          pointerEvents: 'none',
        }`
        ).row.full-height.b-180
        //- bar right red line currentTime
        div(
          :style=`{
            position: 'absolute', zIndex: 120, top: '-4px', right: '-2px',
            height: 'calc(100% + 8px)', width: '4px',
            borderRadius: '2px',
            pointerEvents: 'none',
          }`).row.bg-red
  //- refresh
  q-btn(
    @click="refresh()"
    round flat dense icon="refresh"
    color="white")
</template>

<script>
export default {
  name: 'layerEditor__layerBar',
  props: ['layer', 'player', 'layerStart', 'layerEnd', 'layerDuration'],
  data () {
    return {
    }
  },
  methods: {
    playPause () {
      this.$log('playPause')
    },
    refresh () {
      this.$log('refresh')
      this.player.setCurrentTime(this.layerStart)
    }
  }
}
</script>
