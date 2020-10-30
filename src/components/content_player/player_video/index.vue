<template lang="pug">
div(
  :style=`{
    //- position: 'relative',
    borderRadius: '10px',
  }`
  ).row.full-width.items-start.content-start.bg-black
  div(:style=`{position: 'relative',}`).row.full-width.items-start.content-start
    img(
      draggable="false"
      :src="thumbUrl"
      :style=`{
        borderRadius: '10px', overflow: 'hidden',
        maxHeight: $q.screen.height/2+'px',
      }`).full-width.br
    component(
      :is="playerComponent[source]"
      :url="url"
      @player="player = $event, $emit('player', $event)"
      :style=`{
        position: 'absolute', zIndex: 100, top: 0,
      }`).fit.bg-black
  div(
    :style=`{
      //- height: '40px',
      position: 'relative',
    }`
    ).row.full-width.justify-center
    player-actions(
      v-if="player" :player="player"
      :style=`{
        position: 'absolute', zIndex: 400, top: '-34px',
        maxWidth: '770px',
      }`)
      template(v-slot)
        slot(name="actions")
    player-bar(v-if="player" :player="player" :options="options" :style=`{maxWidth: '770px'}`)
  //- .col.full-width
  //- .row.full-width.bg-red.q-pa-md
  //- component(
    :is="playerComponent[source]"
    :url="url"
    @player="player = $event, $emit('player', $event)").br
    div(
      v-if="player"
      :style=`{
        position: 'absolute', zIndex: 1000, bottom: '6px',
      }`
      ).row.full-width.justify-center.q-px-lg.bg
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
    }
  }
}
</script>
