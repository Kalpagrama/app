<template lang="pug">
div(
  :style=`{
    ...styles,
  }`
  ).column.full-width
  player-tint(
    v-if="player"
    v-bind="$props"
    :player="player")
    template(v-slot:tint-bar=`{tintFocused}`)
      slot(name="tint-bar" :tintFocused="tintFocused")
    template(v-slot:tint=`{tintFocused}`)
      slot(name="tint" :tintFocused="tintFocused")
  //- body
  div(
    :style=`{
      position: 'relative',
    }`
    ).col.full-width
    component(
      :is="playerComponent[contentKalpa.contentSource]"
      :contentKalpa="contentKalpa"
      :style=`{
        position: 'absolute',
        zIndex: 100,
        top: 0,
        ...styles,
      }`
      :styles="styles"
      @player="playerCreated")
</template>

<script>
import playerYoutube from './player_youtube.vue'
import playerKalpa from './player_kalpa.vue'
import playerTint from './player_tint/index.vue'

export default {
  name: 'contentPlayer_video',
  components: {
    playerYoutube,
    playerKalpa,
    playerTint,
  },
  props: {
    contentKalpa: {type: Object, required: true},
    isVisible: {type: Boolean, default: true},
    isActive: {type: Boolean, default: true},
    isMini: {type: Boolean, default: false},
    options: {type: Object, default: {}},
    styles: {type: Object},
  },
  data () {
    return {
      player: null,
      playerComponent: {
        YOUTUBE: 'player-youtube',
        KALPA: 'player-kalpa',
      }
    }
  },
  methods: {
    playerCreated (player) {
      // this.$log('playerCreated')
      this.player = player
      this.$emit('player', player)
      if (this.$q.platform.is.capacitor || this.$q.platform.is.desktop) {
        let muted = localStorage.getItem('k_muted')
        if (muted === 'false') {
          this.player.setState('muted', false)
        }
      }
    },
  }
}
</script>
