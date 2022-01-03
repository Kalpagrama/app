// образы на суть
<template lang="pug">
.row
  .column.fit.relative-position
    player-default(
      :contentKalpa="content"
      @player="player = $event, $emit('player', $event)").fit.bg-black
    transition(appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
      div(
        v-if="player && !player.playing && player.playerType === 'player-youtube' && $q.screen.width > 480"
        :style=`{
          position: 'absolute', zIndex: 10, bottom: '0px',
          height: '100%',
          background: 'linear-gradient(0deg, rgba(0,0,0,1) 200px, rgba(0,0,0,0) 100%)',
        }`
        @click.self="player.play()"
      ).row.full-width.items-center.content-center.justify-center
        q-btn(
          round flat color="white"
          :style=`{
            width: '150px',
            height: '150px',
            borderRadius: '50%',
          }`
          @click="player.play()")
          q-icon(name="fas fa-play" color="white" size="100px").q-ml-md
</template>

<script>

import playerDefault from 'src/components/content_player/player_video/player_default/index.vue'

export default {
  name: 'pageContentVideo',
  components: {playerDefault},
  props: ['content', 'isFullscreen', 'isActive'],
  data () {
    return {
      player: null
    }
  },
  computed: {
  },
  watch: {
  },
  async created () {
    this.$log('created ')
  },
  beforeUnmount () {
    this.$log('beforeDestroy')
  }
}
</script>
