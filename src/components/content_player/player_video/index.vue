<template lang="pug">
div(
  :style=`{
    ...styles
  }`
  ).column.full-width
  //- body
  div(
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @mousemove="onMouseMove"
    :style=`{
      position: 'relative',
    }`
    ).col.full-width
    component(
      :is="playerComponent[contentKalpa.contentSource]"
      :contentKalpa="contentKalpa"
      :style=`{
        position: 'absolute',
        zIndex: 100, top: 0,
      }`
      @player="player = $event, $emit('player', $event)").fit
    //- transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
      div(
        v-if="player"
        v-show="player && showTint"
        :style=`{
          position: 'absolute', zIndex: 2000,
          background: 'rgba(0,0,0,0.5)',
          borderRadius: '10px',
          pointerEvents: 'none',
          //- opacity: 0.5,
        }`
        ).row.fit.items-center-content-center.justify-center
        q-btn(
          @click=""
          round flat color="white" size="xl"
          :icon="player.playing ? 'pause' : 'play_arrow'")
    //- player-taps(
      v-if="player"
      :player="player")
    //- div(
      v-if="player && player.muted && !options.showBar"
      @click="player.setState('muted', false)"
      :style=`{
        position: 'absolute', zIndex: 900,
        //- background: 'rgba(0,0,0,0.5)',
      }`
      ).row.fit
    //- q-btn(
      v-if="player && !options.showBar"
      @click="volumeToggle()"
      round flat dense
      :color="player.muted ? 'red' : 'white'"
      :style=`{
        position: 'absolute', zIndex: 1000, right: '8px',
        top: 'calc(50% - 20px)',
        //- bottom: '40px',
      }`)
      q-icon(
        :name="player.muted ? 'volume_off' : 'volume_up'"
        :color="player.muted ? 'red' : 'white'"
        size="20px")
  //- footer
  //- div(v-if="!options.mini" :style=`{height: '46px',}`).row.full-width
  //- transition(enter-active-class="animated slideInUp" leave-active-class="animated fadeOut")
    //- v-show="options.showBar"
    div(
      v-if="player"
      v-show="false && options.showBar"
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
  //- div(v-if="!options.mini" :style=`{height: '16px',}`).row.full-width
  //- player tint
  transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    div(
      v-if="tintShow === false"
      @click="tintShow = true"
      :style=`{
        position: 'absolute', zIndex: 900,
      }`
      ).row.fit
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
      //- routerLink: contentName, actions
      div(
        :style=`{
          position: 'absolute', zIndex: 901,
          top: '0px', left: '0px,'
        }`
        ).row.full-width.items-center.content-center.q-pa-sm
        router-link(
          :to="'/content/'+contentKalpa.oid"
          :style=`{overflow: 'hidden'}`
          ).col
          .row.full-width.items-center.content-center
            q-btn(
              round flat dense color="white" icon="select_all" no-caps).q-px-xs
              //- div(:style=`{overflow: 'hidden',}`).col
              span(:style=`{userSelect: 'none'}`).text-white.q-pl-sm {{ contentKalpa.name }}
        q-btn(
          round flat dense color="white" icon="more_vert")
      //- replay,play/pause,forward
      div(
        :style=`{
          position: 'relative',
        }`
        ).row.items-center.content-center.justify-center
        q-btn(
          @click="tapClick(0)"
          round flat color="white" size="lg"
          :style=`{
            borderRadius: '50%',
          }`)
          q-icon(
            name="replay_5" size="40px" color="white")
        q-btn(
          @click="player.playing ? player.pause() : player.play()"
          round flat color="white" size="xl"
          :style=`{
            borderRadius: '50%',
          }`).q-mx-lg
          q-icon(
            size="60px" color="white"
            :name="player.playing ? 'pause' : 'play_arrow'")
        q-btn(
          @click="tapClick(1)"
          round flat color="white" size="lg"
          :style=`{
            borderRadius: '50%',
          }`)
          q-icon(
            name="forward_5" size="40px" color="white")
      //- footer
      //- subtitles
      //- sound
      q-btn(
        @click="volumeToggle()"
        round flat dense
        :color="player.muted ? 'red' : 'white'"
        :icon="player.muted ? 'volume_off' : 'volume_up'"
        :style=`{
          position: 'absolute', zIndex: 901,
          right: '8px',
          //- bottom: '8px',
          bottom: 'calc(50% - 16px)',
        }`)
      //- div(
        :style=`{
          position: 'absolute', zIndex: 901,
          bottom: '0px', left: '0px,'
        }`
        ).row.full-width.items-center.content-center.q-pa-sm.br
        .col
        q-btn(
          round flat dense color="white"
          icon="volume_off")
  //- player mini-bar
  player-bar-mini(
    v-if="player" :player="player" :figures="figures"
    @started="tintShow = true"
    :mini="!tintShow"
    :style=`{
      position: 'absolute',
      //- zIndex: tintShow ? 100000 : 1000,
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
  //- div(v-if="!options.mini" :style=`{height: '20px',}`).row.full-width
</template>

<script>
import playerTaps from './player_taps.vue'
import playerBar from './player_bar.vue'
import playerBarMini from './player_bar_mini.vue'

export default {
  name: 'contentPlayer_video',
  components: {
    playerYoutube: () => import('./player_youtube.vue'),
    playerKalpa: () => import('./player_kalpa.vue'),
    playerTaps,
    playerBar,
    playerBarMini,
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
      tintShow: false,
      moveTimer: null,
    }
  },
  computed: {
    // start () {
    //   if (this.figures) {
    //     return this.figures[0].t
    //   }
    //   else {
    //     return false
    //   }
    // },
    // end () {
    //   if (this.figures) {
    //     return this.figures[1].t
    //   }
    //   else {
    //     return false
    //   }
    // }
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
    },
    onMouseMove (e) {
      // this.$log('onMouseMove', e)
      if (this.moveTimer) {
        clearTimeout(this.moveTimer)
        this.moveTimer = null
      }
      if (!this.showTint) {
        this.showTint = true
      }
      this.moveTimer = setTimeout(() => {
        this.moveTimer = null
        this.showTint = false
      }, 2000)
    },
    onMouseEnter (e) {
      this.$log('onMouseEnter', e)
      this.showTint = true
    },
    async onMouseLeave (e) {
      this.$log('onMouseLeave', e)
      // await this.$wait(300)
      // this.showTint = false
    }
  }
}
</script>
