<template lang="pug">
div(
  :style=`{
    ...styles,
    borderRadius: '10px', overflow: 'hidden',
  }`
  ).column.full-width
  //- header: context
  transition(enter-active-class="animated slideInDown" leave-active-class="animated slideOutUp")
    div(
      v-if="player && player.duration && options.showHeader"
      :style=`{
        position: 'absolute', zIndex: 1000,
        left: '0px', top: '0px',
        background: 'linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.666) 100%)',
        borderRadius: '8px',
      }`
      ).row.full-width
      q-btn(
        flat color="white" no-caps dense
        :to="contentLink"
        :style=`{
          overflow: 'hidden',
        }`).row.q-py-sm.q-pr-sm
        q-icon(
          name="select_all" size="20px"
          :class=`{
            'q-mr-sm': !isMini
          }`
          :style=`{marginLeft: '10px',}`)
        div(
          v-show="!isMini && $q.screen.gt.sm"
          :style=`{
            overflow: 'hidden',
          }`
          ).col
          span(:style=`{whiteSpace: 'nowrap'}`) {{ contentKalpa.name }}
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
    transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
      div(
        v-if="player && player.figure"
        :style=`{
          position: 'absolute', zIndex: 500,
          background: 'rgba(0,0,0,0.8)',
          //- paddingTop: '100px',
        }`
        ).row.fit.items-center.content-center.justify-center.br
        q-input(
          v-model="node.name"
          borderless dark
          placeholder="В чем суть ?"
          :input-style=`{
            fontSize: '30px',
            textAlign: 'center',
            color: 'white',
          }`
          ).full-width.br
  //- tint
  //- footer
  transition(enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
    div(
      v-if="player && player.duration"
      :style=`options.footerOverlay ?
        {
          position: 'absolute', zIndex: 1000,
          bottom: '0px',
          background: 'linear-gradient(0deg, rgba(0,0,0,0.666) 0%, rgba(0,0,0,0) 100%)',
          borderRadius: '0 0 6px 6px',
          opacity: options.showFooter ? 1 : 0,
        }
        :
        {
          position: 'relative',
          opacity: options.showFooter ? 1 : 0,
        }`
      ).row.full-width.justify-center
      div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width.q-pa-xs
        tint-bar-new(
          :player="player" :contentKalpa="contentKalpa"
          :options="options"
          :style=`{
          }`).full-width
          //- template(v-slot:actions)
            .row
              q-btn(
                v-if="player"
                @click="volumeToggle()"
                round flat dense size="md"
                :color="player.muted ? 'red' : 'grey-6'"
                :icon="player.muted ? 'volume_off' : 'volume_up'"
                :style=`{
                }`)
  transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    q-btn(
      v-if="player"
      @click="volumeToggle()"
      round flat dense size="md"
      :color="player.muted ? 'red' : 'grey-6'"
      :icon="player.muted ? 'volume_off' : 'volume_up'"
      :style=`{
        position: 'absolute', zIndex: 1000,
        right: '12px',
        //- top: 'calc(50% - 20px)',
        bottom: '30%',
      }`)
</template>

<script>
// import playerBarMini from './player_bar_mini.vue'
// import playerTint from './player_tint/index.vue'
import tintBarNew from './player_tint/tint_bar_new.vue'

export default {
  name: 'contentPlayer_video',
  components: {
    playerYoutube: () => import('./player_youtube.vue'),
    playerKalpa: () => import('./player_kalpa.vue'),
    // playerBarMini,
    // playerTint,
    tintBarNew
  },
  props: {
    contentKalpa: {type: Object, required: true},
    isVisible: {type: Boolean, default: true},
    isActive: {type: Boolean, default: true},
    isMini: {type: Boolean, default: false},
    options: {type: Object, default: {}},
    figures: {type: Array},
    styles: {type: Object},
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
      node: {
        name: ''
      }
    }
  },
  computed: {
    contentLink () {
      let res = '/content/' + this.contentKalpa.oid
      if (this.options.nodeOid) {
        res += '?nodeOid=' + this.options.nodeOid
      }
      return res
    }
  },
  watch: {
    tintShow: {
      async handler (to, from) {
        this.$log('tintShow TO', to)
        if (to) {
          // await this.$wait(2500)
          // this.tintShow = false
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
