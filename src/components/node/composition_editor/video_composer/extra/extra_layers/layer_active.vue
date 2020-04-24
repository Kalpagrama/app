<template lang="pug">
div(
  :style=`{position: 'relative'}`
  ).row.full-width
  q-btn(
    flat round color="grey-2" icon="more_vert"
    :style=`{position: 'absolute', zIndex: 1000, bottom: '0px', right: '0px'}`)
    q-menu(cover anchor="bottom right")
      layer-editor-actions(v-bind="$props")
  //- play layer...
  div(:style=`{height: '40px'}`).row.full-width.items-center.content-center.q-px-xs
    q-btn(
      round flat dense color="grey-2" @click="layerPlay()"
      :icon="layerPlaying ? 'pause' : 'play_arrow'" )
    .col
      .row.fit.items-center.content-center.q-px-sm
        //- bar
        div(
          @click="layerBarClick"
          :style=`{position: 'relative', height: '24px'}`
          ).row.full-width.items-center.content-center.cursor-pointer
          div(:style=`{position: 'relative', height: '4px', borderRadius: '2px'}`).row.full-width.bg-grey-2
            //- bar point
            div(
              :style=`{
                position: 'absolute',
                top: '-8px',
                left: layerPointPercent+'%',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                pointerEvents: 'none',
                background: $randomColor(index)
              }`).row
    q-btn(round flat dense color="grey-2" icon="refresh" @click="layerRefresh()")
  //- ticks left/right
  div(:style=`{height: '40px', padding: '0 30px 0'}`).row.full-width
    q-btn(round flat color="grey-2" icon="keyboard_arrow_left" @click="layerTick(true, false)")
    q-btn(round flat color="grey-2" icon="keyboard_arrow_right" @click="layerTick(true, true)")
    .col
    q-btn(round flat color="grey-2" icon="keyboard_arrow_left" @click="layerTick(false, false)")
    q-btn(round flat color="grey-2" icon="keyboard_arrow_right" @click="layerTick(false, true)")
  //- actions: delete, export, save, share...
  div(
    v-if="false"
    :style=`{height: '50px'}`).row.full-width.q-px-sm
    q-btn(round flat dense color="red-4" icon="delete_outline")
    q-btn(round flat dense color='grey-2' icon="")
</template>

<script>
import layerEditorActions from './layer_editor_actions'

export default {
  name: 'extraLayers-layerActive',
  components: {layerEditorActions},
  props: ['composition', 'player', 'meta', 'layer', 'index'],
  data () {
    return {
    }
  },
  computed: {
    layerStart () {
      return this.layer.figuresAbsolute[0].t
    },
    layerEnd () {
      return this.layer.figuresAbsolute[1].t
    },
    layerLength () {
      return this.layer.figuresAbsolute[1].t - this.layer.figuresAbsolute[0].t
    },
    layerPointPercent () {
      let p = (this.meta.now - this.layerStart) / this.layerLength * 100
      if (p > 100) return 100
      else return p
    },
    layerPlaying () {
      if (this.meta.playing && this.meta.layerIndexPlay === this.index) {
        return true
      }
      else {
        return false
      }
    }
  },
  methods: {
    layerPlay () {
      this.$log('layerPlay', this.layer.figuresAbsolute[0].t)
      if (this.layerPlaying) {
        this.player.pause()
      }
      else {
        this.player.setCurrentTime(this.layer.figuresAbsolute[0].t)
        this.player.play()
        this.player.update()
      }
    },
    layerTick (isStart, isForward) {
      this.$log('layerTick', isStart, isForward)
      let figureIndex = isStart ? 0 : 1
      let from = this.layer.figuresAbsolute[figureIndex].t
      let to = isForward ? from + 0.1 : from - 0.1
      if (to > 0 && to < this.meta.content.duration) {
        this.$log('layerTick figureIndex', figureIndex)
        this.player.setCurrentTime(to)
        this.layer.figuresAbsolute[figureIndex].t = to
      }
    },
    async layerBarClick (e) {
      this.$log('layerBarClick', e)
      this.$log('left/width', e.layerX, e.target.clientWidth)
      let to = (this.layerLength * e.layerX) / e.target.clientWidth
      this.$log('to', to)
      this.player.setCurrentTime(this.layerStart + to)
      await this.$wait(400)
      this.player.update()
    },
    layerRefresh () {
      this.$log('layerRefresh')
      this.player.setCurrentTime(this.layerStart)
      this.player.update()
      this.player.play()
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
