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
  //- footer styles ? position relative/absolute paddingBottom ???
  transition(enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
    div(
      v-if="player && player.duration > 0"
      :class=`{
        'q-px-xl': !options.mini,
      }`
      :style=`{
        ...(() => options.mini ? {position: 'absolute', bottom: '0px', zIndex: 1000} : {position: 'relative', paddingTop: '8px', paddingBottom: '16px'})(),
      }`
      ).row.full-width
      player-bar(
        v-if="player"
        :player="player"
        :start="start"
        :end="end"
        :mini="options.mini"
        :style=`{maxWidth: '770px'}`)
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
    figures: {type: Array},
    options: {
      type: Object,
      default () {
        return {
          mini: false,
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
