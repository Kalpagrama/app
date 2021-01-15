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
      :is="playerComponent[contentKalpa.contentSource]"
      :contentKalpa="contentKalpa"
      :style=`{
        position: 'absolute',
        zIndex: 100,
        top: 0,
        ...styles,
      }`
      :styles="styles"
      @player="player = $event, $emit('player', $event)")
  //- player tint caller
  transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    div(
      v-if="tintShow === false"
      @click="player.muted ? player.setState('muted', false) : tintShow = true"
      :style=`{
        position: 'absolute', zIndex: 900,
      }`
      ).row.fit
  //- player tint
  transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    div(
      v-if="tintShow === true"
      @click.self="tintShow = false"
      :style=`{
        position: 'absolute', zIndex: 900,
        background: 'rgba(0,0,0,0.5)',
        borderRadius: '10px',
      }`
      ).row.fit.items-center.content-center.justify-center
      //- CONTENT: routerLink: contentName, actions
      q-btn(
        v-if="showHeader"
        flat dense color="white" no-caps align="left"
        :to="'/content/'+contentKalpa.oid"
        :style=`{
          position: 'absolute', zIndex: 901,
          top: '8px', left: '48px',
          overflow: 'hidden',
          maxWidth: 'calc(100% - 96px)',
        }`).row.full-width.no-wrap.q-px-xs
        span(:style=`{whiteSpace: 'nowrap', pointerEvents: 'none', userSelect: 'none',}`).text-white {{ contentKalpa.name }}
      //- ACTIONS: replay,play/pause,forward
      div(
        :style=`{
          position: 'relative',
        }`
        ).row.items-center.content-center.justify-center
        q-btn(
          v-if="!isMini"
          @click="tapClick(0)"
          round flat color="white" size="md"
          :style=`{
            borderRadius: '50%',
          }`)
          q-icon(
            name="replay_5" size="40px" color="white")
        q-btn(
          @click="player.playing ? player.pause() : player.play()"
          round flat color="white" size="lg"
          :style=`{
            borderRadius: '50%',
          }`).q-mx-lg
          q-icon(
            size="60px" color="white"
            :name="player.playing ? 'pause' : 'play_arrow'")
        q-btn(
          v-if="!isMini"
          @click="tapClick(1)"
          round flat color="white" size="md"
          :style=`{
            borderRadius: '50%',
          }`)
          q-icon(
            name="forward_5" size="40px" color="white")
  //- context
  transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    q-btn(
      v-if="player"
      round flat dense
      :to="'/content/'+contentKalpa.oid"
      color="white"
      icon="select_all"
      :style=`{
        position: 'absolute', zIndex: 1000,
        left: '8px', top: '8px',
      }`)
  //- sound
  transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    q-btn(
      v-if="player"
      @click="volumeToggle()"
      round flat dense
      :color="player.muted ? 'red' : 'white'"
      :icon="player.muted ? 'volume_off' : 'volume_up'"
      :style=`{
        position: 'absolute', zIndex: 1000,
        right: '8px', top: '8px',
      }`)
  //- player mini-bar
  //- @started="tintShow = true"
  transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    player-bar-mini(
      v-if="player" :player="player" :figures="figures"
      :mini="isMini || !tintShow"
      :style=`{
        position: 'absolute',
        zIndex: 1000,
        transform: 'translate3d(0,0,10px)',
        bottom: '-15px',
      }`)
  //- subtitles
  //- div(
    :style=`{
      position: 'absolute', zIndex: 901,
      bottom: '8px',
    }`
    ).row.full-width.items-center.content-center.justify-center
    small(
      :style=`{
        borderRadius: '10px',
      }`
    ).text-white.bg-black.q-pa-sm lorem ipsum subtitles
  //- div(v-if="!isMini" :style=`{height: '20px',}`).row.full-width
</template>

<script>
import playerBarMini from './player_bar_mini.vue'

export default {
  name: 'contentPlayer_video',
  components: {
    playerYoutube: () => import('./player_youtube.vue'),
    playerKalpa: () => import('./player_kalpa.vue'),
    playerBarMini,
  },
  props: {
    contentKalpa: {type: Object, required: true},
    isVisible: {type: Boolean, default: true},
    isActive: {type: Boolean, default: true},
    isMini: {type: Boolean, default: false},
    options: {type: Object, default: {}},
    figures: {type: Array},
    styles: {
      type: Object,
      default () {
        return {
          global: {},
          padding: {}
        }
      }
    },
  },
  data () {
    return {
      player: null,
      playerComponent: {
        YOUTUBE: 'player-youtube',
        KALPA: 'player-kalpa',
      },
      tintShow: false,
      moveTimer: null,
    }
  },
  computed: {
  },
  watch: {
    tintShow: {
      async handler (to, from) {
        this.$log('tintShow TO', to)
        if (to) {
          await this.$wait(2500)
          this.tintShow = false
        }
        else {
          // do nothing
        }
      }
    }
  },
  methods: {
    tapClick (index) {
      this.$log('tapClick', this.tapTimer)
      let t = this.figures ? this.player.currentTime - this.figures[0].t : this.player.currentTime
      if (index === 0) t -= 5
      else t += 5
      this.$log('t', t)
      if (this.figures) {
        this.player.setCurrentTime(t + this.figures[0].t)
      }
      else {
        this.player.setCurrentTime(t)
      }
    },
    tintClick () {
      this.$log('tintClick', this.tintShow)
      if (this.tintShow) {
        // do stuff
      }
      else {
        // this.player.play()
        if (this.player.playing) this.player.pause()
        else this.player.play()
      }
      this.tintShow = !this.tintShow
    },
    volumeToggle () {
      this.$log('volumeToggle')
      if (this.player.muted) {
        this.player.setState('muted', false)
        // localStorage.setItem('k_volume', 'on')
      }
      else {
        this.player.setState('muted', true)
        // localStorage.removeItem('k_volume')
      }
    }
  }
}
</script>
