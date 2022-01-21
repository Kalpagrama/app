<template lang="pug">
.row.full-width
  // полоса
  div(ref="bar" :style=`{ height: '30px'}` v-touch-pan.mouse.prevent="tintOnPan" @click="tintClick").row.full-width.relative-position
    div(:style=`{ height: '12px', pointerEvents: 'none'}`).row.full-width.absolute-bottom.b-70.br-5.op-60
      //- clusters
      clusters(v-if="player.clusters.length" v-bind="$props" :style=`{ pointerEvents: 'none'}`).br-5
      // fragment selected
      div(
        v-if="figuresAbsolute"
        :style=`{
          position: 'absolute',
          top: '-2px',
          left: (figuresAbsolute[0].t/player.duration)*100+'%',
          width: ((figuresAbsolute[1].t-figuresAbsolute[0].t)/player.duration)*100+'%',
          height: 'calc(100% + 4px)',
          border: '1px solid ' + $getPaletteColor('green-5'),
          borderRadius: '2px',
          pointerEvents: 'none',
        }`
      ).row.bg-green-8.br-5.op-50
      //- currentTime
      div(
        :style=`{ position: 'absolute', left: (player.currentTime/player.duration)*100+'%', height: '100%', width: '2px', pointerEvents: 'none'}`
        ).row.bg-green-8.br-5
  //- time bar + actions
  .row.full-width.content-center.items-center.no-wrap
    q-btn( dense round flat :color="player.muted ? 'red' : 'white'" :icon="player.muted ? 'volume_off' : 'volume_up'" @click="player.mutedToggle()")
    small(v-if="$screenProps.isMobile && player.nodeMode === 'edit'").text-grey-2 {{ $time(player.currentTime) }}
    small(v-else).text-grey-2 {{ $time(player.currentTime) }} / {{ $time(player.duration) }}
    .col
    figures-controls(v-if="player.node" :player="player" :contentKalpa="contentKalpa").all-pointer-events
    .col
    q-btn( v-if="player.nodeMode !== 'edit'" dense round flat color="green" icon="add_circle_outline" @click="player.fragmentSelect()")
      q-tooltip(
        anchor="center left" self="center right" :offset="[10, 10]"
        transition-show="jump-right"
        transition-hide="jump-up"
      ) {{$t('Создать ядро')}}
    q-btn( v-else dense round flat color="red" icon="clear" @click="player.fragmentClear()")
      q-tooltip(
        anchor="center left" self="center right" :offset="[10, 10]"
        transition-show="jump-right"
        transition-hide="jump-up"
      ) {{$t('Закрыть')}}
    q-btn(dense round flat :icon="player.isFullscreen ? 'fullscreen_exit': 'fullscreen'" color="grey-5" @click="player.setState('isFullscreen', !player.isFullscreen)")
</template>

<script>
import clusters from './clusters.vue'
import figuresControls from 'src/components/content_player/player_video/player_pult/figures_controls.vue'

export default {
  name: 'playerPultOverlay',
  props: ['player', 'contentKalpa', 'options'],
  components: { clusters, figuresControls },
  computed: {
    figuresAbsolute() {
      return this.player?.node?.items[0]?.layers[0]?.figuresAbsolute || this.player.figures
    }
  },
  watch: {},
  methods: {
    tintClick (e) {
      // this.$log('tintClick', e)
      let left = e.layerX
      let width = e.target.clientWidth
      this.$log({left, width})
      let zoomPercent = left / width
      let t = zoomPercent * this.player.duration
      this.$log('t', t)
      this.player.setCurrentTime(t)
    },
    tintOnPan (e) {
      let tintRect = this.$refs['bar'].getBoundingClientRect()
      let left = e.position.left - tintRect.left
      let width = tintRect.width
      if (left < 0 || left > width) {
        this.$log('left < 0 || left > width !')
        return
      }
      let t = left / width * this.player.duration
      this.player.setCurrentTime(t)
    },
  },
  // created () {},
  mounted () {
    this.$log('mounted')
  }
}
</script>
