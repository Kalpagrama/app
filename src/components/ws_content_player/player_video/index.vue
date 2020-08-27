<template lang="pug">
component(
  :is="playerComponent[source]"
  :url="url"
  @player="player = $event, $emit('player', $event)")
  div(
    v-if="player"
    :style=`{
      position: 'absolute', zIndex: 1000, bottom: '6px',
    }`
    ).row.full-width.justify-center.q-px-lg
    //- actions wrapper
    div(
      v-if="options.showActions"
      ).row.full-width.justify-center
      player-actions(v-if="player" :player="player" :style=`{maxWidth: '600px'}`)
        template(v-slot)
          slot(name="actions")
    //- bar wrapper
    div(
      v-if="options.showBar"
      ).row.full-width.justify-center
      player-bar(v-if="player" :player="player" :options="options" :style=`{maxWidth: '600px'}`)
</template>

<script>
import playerActions from './player_actions.vue'
import playerBar from './player_bar.vue'

export default {
  name: 'wsContentPlayer__playerVideo',
  components: {
    playerYoutube: () => import('./player_youtube.vue'),
    playerKalpa: () => import('./player_kalpa.vue'),
    playerActions,
    playerBar,
  },
  // props: ['source', 'url', 'options'],
  props: {
    source: {type: String, required: true},
    url: {type: String, required: true},
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
    }
  }
}
</script>
