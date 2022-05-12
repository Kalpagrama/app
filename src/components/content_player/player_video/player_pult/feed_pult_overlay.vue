<style lang="sass" scoped>
.container
  transition: height .3s
</style>

<template lang="pug">
.row.full-width
  //- time bar + actions
  //.row.full-width.content-center.items-center.no-wrap.bb
  //  //q-btn( dense round flat :color="player.muted ? 'red' : 'white'" :icon="player.muted ? 'volume_off' : 'volume_up'" @click="player.mutedToggle()")
  //  small(v-if="$screenProps.isMobile && player.nodeMode === 'edit'").text-grey-2 {{ $time(player.currentTime) }}
  //  small(v-else).text-grey-2 {{ $time(player.currentTime) }} / {{ $time(player.duration) }}
    .col
  // полоса таймлайн
  div(ref="bar" :style=`{ height: '35px'}` v-touch-pan.mouse.prevent="tintOnPan" @mouseout="tintMouseout" @mousemove="tintMousemove" @click="tintClick").row.full-width.relative-position.cursor-pointer
    .row.absolute-top-right
      small(v-if="$screenProps.isMobile && player.nodeMode === 'edit'").text-grey-2 {{ $time(player.currentTime) }}
      small(v-else).text-grey-2 {{ $time(player.currentTime) }} / {{ $time(player.duration) }}
    div(:style=`{ height: '12px', pointerEvents: 'none'}`).row.full-width.absolute-bottom.br-5
      .row.full-width.relative-position.items-center.content-center
        div(:style=`{ height: timelineHeight + '%', pointerEvents: 'none'}`).row.full-width.absolute.b-70.br-5.op-60.container
          //- clusters
          clusters(v-if="player.clusters.length" v-bind="$props" :style=`{ pointerEvents: 'none'}`).br-5
        div(:style=`{ height: '12px', pointerEvents: 'none'}`).row.full-width.absolute.br-5.items-center.content-center
          //- currentTime
          //div(:style=`{ position: 'absolute', left: (player.currentTime/player.duration)*100+'%', height: '50%', width: '2px', pointerEvents: 'none'}`).row.bg-red.br-5
          div(:style=`{ position: 'absolute-left', height: timelineHeight + '%', width: (player.currentTime/player.duration)*100+'%', pointerEvents: 'none'}`).row.bg-red.br-5
          div(:style=`{ position: 'absolute', left: (player.currentTime/player.duration)*100+'%', height: '100%', width: '12px', pointerEvents: 'none', marginLeft: '-5px'}`).row.bg-red.br-15
          //- currentTime hover
          div(v-if="currentTimeHoverPercent && $screenProps.isDesktop"
            :style=`{
                    position: 'absolute',
                    top: '-14px',
                    left: currentTimeHoverPercent+'%',
                    height: '14px',
                  }`).row.items-center.content-center
            small.text-white.text-bold {{ $time(currentTimeHoverTime) }}
          div(
            v-if="currentTimeHoverPercent && $q.screen.gt.sm"
            :style=`{
                position: 'absolute',
                left: currentTimeHoverPercent+'%',
                height: '50%',
                width: '2px',
                pointerEvents: 'none',
              }`
          ).row.bg-red
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
          ).row.bg-green-8.br-5.op-70
</template>

<script>
import clusters from './clusters.vue'
import figuresControls from 'src/components/content_player/player_video/player_pult/figures_controls.vue'

export default {
  name: 'feedPultOverlay',
  props: ['player', 'contentKalpa', 'options'],
  emits: ['touchPan'],
  components: { clusters, figuresControls },
  data () {
    return {
      currentTimeHoverTime: null,
      currentTimeHoverPercent: null,
    }
  },
  computed: {
    figuresAbsolute() {
      return this.player?.node?.items[0]?.layers[0]?.figuresAbsolute || this.player.figures
    },
    contentAvailable() {
      if (this.contentKalpa.payInfo.paid && this.contentKalpa.payInfo.price) return true
      else if (!this.contentKalpa.payInfo.paid && !this.contentKalpa.payInfo.price) return true
      else return false
    },
    timelineHeight() {
      if (this.currentTimeHoverPercent) return 50
      else return 30
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
    tintOnPan (e) { // перетаскивание  playhead
      // this.$logT('tintOnPan')
      let tintRect = this.$refs['bar'].getBoundingClientRect()
      let left = e.position.left - tintRect.left
      let width = tintRect.width
      if (left < 0 || left > width) {
        this.$log('left < 0 || left > width !')
        return
      }
      let t = left / width * this.player.duration
      this.currentTimeHoverPercent = (left / width) * 100
      this.currentTimeHoverTime = (left / width) * this.player.duration
      this.player.setCurrentTime(t)
      this.$emit('touchPan') // чтобы при проматывании не скрывался pult_overlay
      // this.$logT('tintOnPan', this.currentTimeHoverPercent, this.currentTimeHoverTime)

      // let rect = this.$refs['bar'].getBoundingClientRect()
      // let y = e.evt.clientY
      // let x = e.evt.clientX
      // if (y < rect.top || y > rect.bottom || x < rect.left || x > rect.right) {
      //   this.currentTimeHoverPercent = null
      //   this.currentTimeHoverTime = null
      // }
    },
    tintMouseout(e) {
      // this.$logT('tintMouseout')
      this.currentTimeHoverPercent = null
      this.currentTimeHoverTime = null
    },
    tintMousemove (e) {
      let rect = this.$refs['bar'].getBoundingClientRect()
      let y = e.clientY
      let x = e.clientX
      // this.$logT('tintMousemove', {x, y}, e)
      // this.$log({y, yMinutes})
      if (y < rect.top || y > rect.bottom || x < rect.left || x > rect.right) {
        this.currentTimeHoverPercent = null
        this.currentTimeHoverTime = null
      }
      else {
        this.currentTimeHoverPercent = (x - rect.left) / rect.width * 100
        this.currentTimeHoverTime = ((x - rect.left) / rect.width) * this.player.duration
      }
      // this.$logT('tintMousemove', this.currentTimeHoverPercent, this.currentTimeHoverTime)
    },
  },
  // created () {},
  mounted () {
    this.$log('mounted')
  }
}
</script>
