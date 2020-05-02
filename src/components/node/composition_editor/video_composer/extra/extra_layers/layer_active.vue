<template lang="pug">
div(
  :style=`{position: 'relative'}`
  ).row.full-width
  //- left actions
  div(:style=`{width: '40px'}`).row.full-height.justify-center.content-end.items-end
    q-btn(round flat dense color="grey-4" icon="keyboard_arrow_up" @click="$emit('meta', ['layerIndexPlay', -1])")
  //- middle
  div(:style=`{borderRadius: '0 0 10px 10px', overflow: 'hidden'}`).col.bg-grey-6
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
              //- bar point to left
              div(
                :style=`{
                  position: 'absolute',
                  zIndex: 100,
                  borderRadius: '2px',
                  width: 'calc(2px + '+layerPointPercent+'%)',
                  pointerEvents: 'none',
                  background: $randomColor(index)
                }`
                ).row.full-height
              //- bar point
              div(
                :style=`{
                  position: 'absolute',
                  zIndex: 110,
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
  //- right actions
  div(:style=`{width: '40px'}`).row.full-height.justify-center.content-end.items-end
    q-btn(
      flat round dense color="grey-6" icon="more_vert"
      :style=`{}`)
      //- anchor="bottom right"
      q-menu(cover anchor="bottom right" :offset="[-50, 0]")
        layer-editor-actions(v-bind="$props")
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
      if
      (
        this.meta.mode === 'layer' &&
        this.meta.playing &&
        this.meta.layerIndexPlay === this.index
      )
      {
        return true
      }
      else
      {
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
        this.$emit('meta', ['mode', 'layer'])
        this.$emit('meta', ['layerIndexPlay', this.index])
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
