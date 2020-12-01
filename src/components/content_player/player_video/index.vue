<template lang="pug">
div(
  :style=`{
    //- borderRadius: '10px',
  }`
  ).row.full-width.items-start.content-start.bg-black
  //- player wrapper:
  div(:style=`{position: 'relative',}`).row.full-width.items-start.content-start
    img(
      draggable="false"
      :src="thumbUrl"
      :style=`{
        borderRadius: '10px', overflow: 'hidden',
        maxHeight: $q.screen.height/2+'px',
      }`).full-width
    q-btn(
      v-if="!isActiveLocal"
      @click="isActiveLocal = true"
      flat color="white"
      :style=`{position: 'absolute', zIndex: 1000, top: 0, borderRadius: '10px',}`
      ).fit
      q-icon(color="white" size="100px" name="play_arrow")
    component(
      v-if="isActiveLocal"
      :is="playerComponent[source]"
      :url="url"
      @player="player = $event, $emit('player', $event)"
      :style=`{
        position: 'absolute', zIndex: 1000, top: 0,
      }`).fit.bg-black
    //- actions slots...
    div(:style=`{position: 'absolute', zIndex: 1100, left: '0px', bottom: '0px'}`).row
      slot(name="left-bottom")
    div(:style=`{position: 'absolute', zIndex: 1100, right: '0px', top: '50%'}`).row
      slot(name="right")
    //- actions player
  //- footer:
  div(v-if="showActions || isActiveLocal" :style=`{position: 'relative', height: '20px', borderRadius: '0 0 10px 10px',}`).row.full-width.justify-center.bg-black
    div(:style=`{position: 'absolute', zIndex: 1101, bottom: '0px'}`).row.full-width.justify-center.q-px-xl
      //- player-actions(
        v-if="player && !player.playing && options.showActions"
        :player="player" :style=`{maxWidth: '770px',}`)
      player-bar(v-if="player && options.showBar" :player="player" :options="options" :style=`{maxWidth: '770px'}`)
        template(v-slot:bar)
          slot(name="bar")
        template(v-slot:bar-current-time="data")
          slot(name="bar-current-time" v-bind="data")
  slot(name="footer")
</template>

<script>
import playerActions from './player_actions.vue'
import playerBar from './player_bar.vue'

export default {
  name: 'contentPlayer_video',
  components: {
    playerYoutube: () => import('./player_youtube.vue'),
    playerKalpa: () => import('./player_kalpa.vue'),
    playerActions,
    playerBar,
  },
  props: {
    isActive: {type: Boolean, default: true},
    isVisible: {type: Boolean, default: true},
    source: {type: String, required: true},
    url: {type: String, required: true},
    thumbUrl: {type: String, required: true},
    options: {
      type: Object,
      default () {
        return {
          showActions: true,
          showBar: true
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
      isActiveLocal: false,
    }
  },
  watch: {
    isActive: {
      immediate: true,
      handler (to, from) {
        this.$log('isActive TO', to)
        this.isActiveLocal = to
      }
    }
  }
}
</script>
