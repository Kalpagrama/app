<template lang="pug">
div(
  :style=`{
    ...styles,
  }`
  ).column.full-width
  //- debug figureOffset
  //- div(
    :style=`{
      position: 'absolute', zIndex: 3000, right: '0px',
    }`
    ).row.text-white.bg-green
    small {{ figureOffset }}
  player-tint(
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
      :is="playerComponent"
      :contentKalpa="contentKalpa"
      :style=`{
        position: 'absolute',
        zIndex: 100,
        top: 0,
        ...styles,
        opacity: videoOpacity,
      }`
      :styles="styles"
      @player="playerCreated")
</template>

<script>
import playerYoutube from './player_youtube.vue'
import playerKalpa from './player_kalpa.vue'
import playerTint from './player_tint/index.vue'
import assert from 'assert'
import { ContentApi } from 'src/api/content'

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
      // playerComponent: {
      //   YOUTUBE: 'player-youtube',
      //   KALPA: 'player-kalpa',
      // }
    }
  },
  computed: {
    url () { return ContentApi.urlSelect(this.contentKalpa) },
    playerComponent() {
      if (this.url.includes('youtu')) return 'player-youtube' // контент не выкачан - показываем плеер ютуба
      else return 'player-kalpa' // есть выкачаннный контент
    },
    figureOffset () {
      let arr = this.url.split('#t=')
      if (arr.length > 1) {
        let [start, end] = arr[1].split(',')
        return [
          {t: parseFloat(start)},
          {t: parseFloat(end)},
        ]
      }
      else {
        return null
      }
    },
    videoOpacity () {
      if (this.figureOffset && this.player) {
        if (this.player.currentTimeRaw >= this.figureOffset[0].t + 0.05 && this.player.currentTimeRaw < this.figureOffset[1].t - 0.05) {
          return 1
        }
        else {
          return 0
        }
      }
      else {
        return 1
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
