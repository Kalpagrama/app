<template lang="pug">
div(
  :style=`{
    ...styles,
  }`
  ).column.full-width.q-pb-sm
  //- body
  div(
    :style=`{
      position: 'relative',
      overflow: 'hidden',
    }`
    ).col.full-width
    component(
      v-if="isActiveLocal"
      :is="playerComponent[source]"
      :url="url"
      @player="player = $event, $emit('player', $event)"
      :style=`{
        position: 'absolute', zIndex: 1000, top: 0,
      }`).fit
  //- footer
  div(:style=`{position: 'relative'}`).row.full-width.q-px-xl.q-py-sm
    player-bar(v-if="player && options.showBar" :player="player" :options="options" :style=`{maxWidth: '770px'}`)
</template>

<script>
import playerActions from './player_actions.vue'
import playerBar from './player_bar.vue'

export default {
  name: 'contentPlayer_video',
  components: {
    playerYoutube: () => import('./player_youtube.vue'),
    playerKalpa: () => import('./player_kalpa.vue'),
    playerBar,
  },
  props: {
    isActive: {type: Boolean, default: true},
    isVisible: {type: Boolean, default: true},
    source: {type: String, required: true},
    url: {type: String, required: true},
    thumbUrl: {type: String, required: true},
    styles: {type: Object},
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
