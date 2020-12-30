<template lang="pug">
div(
  :style=`{
    ...styles
  }`
  ).column.full-width
  //- body
  div(
    :style=`{
      position: 'relative',
    }`
    ).col.full-width
    component(
      v-if="true"
      :is="playerComponent[contentKalpa.contentSource]"
      :contentKalpa="contentKalpa"
      :style=`{
        position: 'absolute',
        zIndex: 100, top: 0,
      }`
      @player="player = $event, $emit('player', $event)").fit
    //- div(
      v-show="showTint"
      :style=`{
        position: 'absolute', zIndex: 2000,
        background: 'rgba(0,0,0,0.5)',
      }`
      ).row.fit.bg-red
    //- player-taps(
      v-if="player"
      :player="player")
  //- footer
  div(v-if="!options.mini" :style=`{height: '28px',}`).row.full-width
  transition(enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
    //- v-show="options.showBar"
    div(
      v-if="player"
      v-show="true && options.showBar"
      :class=`{
      }`
      :style=`{
        position: 'absolute', zIndex: 3000,
        bottom: options.mini ? '16px' : '16px',
        //- opacity: options.mini ? 0.6 : 1,
        paddingRight: '56px',
        paddingLeft: '56px',
      }`
      ).row.full-width.justify-center
      player-bar(
        v-if="player"
        :player="player"
        :contentKalpa="contentKalpa"
        :figures="figures"
        :start="start"
        :end="end"
        :mini="options.mini"
        :style=`{
          maxWidth: $store.state.ui.pageWidth-112+'px'
        }`)
  div(v-if="!options.mini" :style=`{height: '16px',}`).row.full-width
</template>

<script>
import playerTaps from './player_taps.vue'
import playerBar from './player_bar.vue'

export default {
  name: 'contentPlayer_video',
  components: {
    playerYoutube: () => import('./player_youtube.vue'),
    playerKalpa: () => import('./player_kalpa.vue'),
    playerTaps,
    playerBar,
  },
  props: {
    contentKalpa: {type: Object, required: true},
    isActive: {type: Boolean, default: true},
    styles: {type: Object},
    figures: {type: Array},
    options: {
      type: Object,
      default () {
        return {
          mini: false,
          showBar: true,
        }
      }
    }
  },
  data () {
    return {
      player: null,
      playerComponent: {
        YOUTUBE: 'player-youtube',
        KALPA: 'player-kalpa',
      },
      showTint: true,
    }
  },
  computed: {
    start () {
      if (this.figures) {
        return this.figures[0].t
      }
      else {
        return false
      }
    },
    end () {
      if (this.figures) {
        return this.figures[1].t
      }
      else {
        return false
      }
    }
  }
}
</script>
