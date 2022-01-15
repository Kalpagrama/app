<template lang="pug">
.column.full-width
  div(:style=`{position: 'relative',}`).col.full-width
    player-default(
      v-bind="$props"
      @player="player = $event, $emit('player', $event)")
      template(v-slot:externalOverlay)
        //- Tint bottom - on pause and desktops only and youtube
        transition(appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
          div(
            v-if="player && !player.playing && player.playerType === 'player-youtube' && $q.screen.width > 480"
            v-show="options.showTint"
            :style=`{
              background: 'linear-gradient(0deg, rgba(0,0,0,1) 200px, rgba(0,0,0,0) 100%)',
            }`
          ).row.full-width
    .row.full-width.absolute-bottom.justify-center
      slot(name="video-footer")
    //- Pult
    div(:style=`{position: 'absolute', zIndex: 11, bottom: '0px', }`).row.full-width.justify-center
      div(:style=`{maxWidth: 600+'px',}`).row.full-width
        div(:style=`{maxWidth: 600+'px', position: 'absolute', zIndex: 11, bottom: '0px',}`).row.full-width.q-px-md
          slot(name="pult-header")
          transition(appear enter-active-class="animated fadeIn " leave-active-class="animated fadeOut")
            div(
              v-if="player && player.duration > 0"
              v-show="options.showPult"
              :style=`{
              maxWidth: 600+'px',
              background: 'rgba(35,35,35,0.7)',
              borderRadius: '20px',
            }`).row.full-width
              slot(name="pult" :player="player")
              player-pult(
                :player="player"
                :contentKalpa="contentKalpa")
          slot(name="pult-footer")
  //- footer
  .row.full-width.justify-center
    div(:style=`{maxWidth: 600+'px'}`).row.full-width
      slot(name="footer")
</template>

<script>
import playerDefault from './player_default/index.vue'
import playerPult from './player_pult/index.vue'

export default {
  name: 'contentPlayer__video',
  components: {
    playerDefault,
    playerPult
  },
  props: {
    contentKalpa: { type: Object, required: true },
    options: {
      type: Object,
      default () {
        return {}
      }
    }
  },
  emits: ['player'],
  data () {
    return {
      player: null
    }
  },
  computed: {
    fullscreen() {
      return this.player && this.player.fullscreen
    },
  }
}
</script>
