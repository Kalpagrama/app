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
      :objectFit="styles.objectFit"
      :style=`{
        position: 'absolute',
        zIndex: 100, top: 0,
      }`
      @player="player = $event, $emit('player', $event)").fit
    //- add
    //- q-btn(
      @click="$emit('add')"
      round flat color="green" icon="add_circle_outline"
      size="lg"
      :style=`{
        position: 'absolute', zIndex: 1100, top: 'calc(50% - 20px)', right: '8px',
        borderRadius: '50%',
      }`)
    //- taps arrows
    div(
      v-for="(t,ti) in 2" :key="ti"
      @click="tapClick(ti)"
      :style=`{
        position: 'absolute', zIndex: 1000, top: '0px', left: ti === 0 ? '0px' : '70%',
        width: '40%',
        borderRadius: '10px',
      }`
      ).row.full-height.items-center.content-center.justify-center.cursor-pointer
      q-btn(
        v-if="tapIndex === ti && tapCount > 1"
        flat color="white" no-caps
        :icon="ti === 0 ? 'fast_rewind' : 'null'"
        :icon-right="ti === 1 ? 'fast_forward' : 'null'"
        :style=`{
          userSelect: 'none !important',
          opacity: 0.8
        }`).fit
        span(
          :style=`{userSelect: 'none !important'}`
          ).text-white.text-bold {{ $time(5 * (tapCount - 1)) }}
  //- footer
  //- div(v-if="!options.mini" :style=`{height: '12px',}`).row.full-width.br
  div(v-if="!options.mini" :style=`{height: '20px',}`).row.full-width
  transition(enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
    div(
      v-if="player"
      v-show="options.showBar"
      :class=`{
        //- 'q-px-xl': !options.mini,
        //- 'q-px-sm': !options.mini,
      }`
      :style=`{
        position: 'absolute', zIndex: 3000,
        transform: 'translate3d(0,0,10px)',
        bottom: options.mini ? '0px' : '0px',
        opacity: options.mini ? 0.6 : 1,
      }`
      ).row.full-width
      player-bar(
        v-if="player"
        :player="player"
        :start="start"
        :end="end"
        :mini="options.mini"
        :style=`{maxWidth: '770px'}`)
  //- div(v-if="!options.mini" :style=`{height: '12px',}`).row.full-width
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
      isActiveLocal: false,
      tapTimer: null,
      tapIndex: null,
      tapCount: 0,
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
  },
  methods: {
    tapClick (index) {
      this.$log('tapClick', this.tapTimer)
      this.tapIndex = index
      this.tapCount += 1
      if (this.tapTimer) {
        this.$log('tapTimer restart')
        clearTimeout(this.tapTimer)
        // this.tapTimer = null
      }
      // if more that one click in 200 we do the math
      // handle TWO and more clicks to stack T
      if (this.tapCount > 1) {
        this.$log('dbClick', this.tapCount)
        let t = this.player.currentTime
        let d = 5 * (this.tapCount - 1)
        this.$log('d', d)
        if (index === 0) t -= d
        else t += d
        // check borders
        if (t < 0) t = 0
        if (t > this.player.duration) t = this.player.duration
        // set currentTime
        this.player.setCurrentTime(t)
      }
      // // handle ONE click
      // if (this.tapCount === 1) {
      //   if (this.player.playing) this.player.pause()
      //   else this.player.play()
      // }
      this.tapTimer = setTimeout(() => {
        this.$log('tapTimer work')
        // handle ONE click
        if (this.tapCount === 1) {
          if (this.player.playing) this.player.pause()
          else this.player.play()
        }
        this.tapCount = 0
        this.tapTimer = null
        this.tapIndex = null
      }, 200)
    }
  }
}
</script>
