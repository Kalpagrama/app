<template lang="pug">
.column.fit
  div(:style=`{position: 'relative',}`).col.full-width
    player-default(
      v-bind="$props"
      @player="player = $event, $emit('player', $event)")
      template(v-slot:externalOverlay)
        //- Tint bottom - on pause and desktops only and youtube
        transition(appear leave-active-class="animated fadeOut")
          div(
            v-if="player && !player.playing && player.playerType === 'player-youtube' && $q.screen.width > 480"
            v-show="options.showTint"
            :style=`{
            position: 'absolute', zIndex: 10, bottom: '0px',
            height: '100%',
            background: 'linear-gradient(0deg, rgba(0,0,0,1) 200px, rgba(0,0,0,0) 100%)',
          }`
            @click.self="player.play()"
          ).row.full-width.items-center.content-center.justify-center
            q-btn(
              v-show="false && options.showPlayBtn"
              round flat color="white"
              :style=`{
              width: '150px',
              height: '150px',
              borderRadius: '50%',
            }`
              @click="player.play()")
              q-icon(name="fas fa-play" color="white" size="100px").q-ml-md
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
    //- transition(appear enter-active-class="animated fadeIn " leave-active-class="animated fadeOut")
    //  div(
    //    v-if="player && player.duration > 0"
    //    v-show="options.showPult"
    //    :style=`{
    //      position: 'absolute', zIndex: 11, bottom: '0px',
    //    }`
    //    ).row.full-width.justify-center.q-px-md
    //    .row.full-width.justify-center.br
    //      div(
    //        :style=`{
    //          maxWidth: 600+'px',
    //          background: 'rgba(35,35,35,0.7)',
    //          borderRadius: '20px',
    //          //- height: '200px',
    //        }`).row.full-width
    //        slot(name="pult" :player="player")
    //        player-pult(
    //          :player="player"
    //          :contentKalpa="contentKalpa")
    //    .row.full-width.justify-center
    //      div(
    //        :style=`{
    //          maxWidth: 600+'px',
    //        }`
    //        ).row.full-width
    //        slot(name="pult-footer")
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
    isVisible: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    isMini: { type: Boolean, default: false },
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
  }
}
</script>
