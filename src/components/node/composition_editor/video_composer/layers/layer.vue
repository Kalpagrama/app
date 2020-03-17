<template lang="pug">
div(
  :class=`{
    'bg-grey-6': layerActive,
    'bg-grey-9': !layerActive,
  }`
  :style=`{
    position: 'relative',
    borderRadius: '10px'
  }`
  ).row.full-width.q-mb-xs
  //- default header
  div(:style=`{height: '36px'}`).row.full-width.items-center.content-center
    span(v-if="layerName" @click="$emit('layerNameSetStart', index)").text-white.cursor-pointer.q-ml-md {{ layerName }}
    span(v-if="layerActive && !layerName" @click="$emit('layerNameSetStart', index)").text-white.cursor-pointer.q-ml-md Set layer name
    .col
      .row.fit.items-center.content-center.justify-end.q-px-md
        span.text-white {{$time(layer.figuresAbsolute[0].t)}}-{{$time(layer.figuresAbsolute[1].t)}} / {{ $time(layer.figuresAbsolute[1].t - layer.figuresAbsolute[0].t) }}
    div(:style=`{height: '36px', width: '36px'}`).row.items-center.content-center.justify-center.cursor-pointer
      q-icon(color="white" size="20px" name="drag_indicator")
  //- INACTIVE tint
  div(
    v-if="!layerActive"
    @click="$emit('meta', ['layerIndex', index]), $emit('meta', ['layerIndexPlay', index])"
    :style=`{position: 'absolute', zIndex: 200, borderRadius: '10px', overflow: 'hidden', opacity: 0.5}`).row.fit.cursor-pointer.layerhandle
    //- percent
    div(
      v-if="layerOver"
      :style=`{position: 'absolute', zIndex: 210, left: '0px', width: layerPercent+'%', pointerEvents: 'none', borderRadius: '10px', overflow: 'hidden'}`
      ).row.full-height.bg-grey-6
  //- ACTIVE layer
  div(
    :style=`{position: 'relative', height: height+'px', overflow: 'hidden'}`).row.full-width.items-start.content-start
    //- PLAYER progress
    div(:style=`{height: '60px'}`).row.full-width
      div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
        q-btn(round push @click="layerPlayButtonClick()"
          :color="meta.mode === 'layer' && meta.playing ? 'red' : 'green'"
          :icon="meta.playing && layerActive ? 'pause' : 'play_arrow'")
      .col.full-height
        .row.fit.items-center.content-center
          //- progress wrapper
          div(
            @click="layerProgressClick"
            :style=`{position: 'relative', height: '44px', borderRadius: '22px', overflow: 'hidden', border: '4px solid #616161'}`).row.full-width.bg-grey-8
            //- progress bar white
            div(
              v-show="!meta.editing"
              :style=`{
                position: 'absolute', left: '0px', top: '0px',
                border: '0px solid #616161',
                height: 'calc(100% - 0px)',
                width: 'calc(' + layerPercent + '% - 0px)',
                borderRadius: layerPercent > 5 ? '22px' : '22px',
                pointerEvents: 'none'}`
              ).row.bg-grey-4
      div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
        q-btn(round flat color="white" icon="refresh" @click="player.setCurrentTime(layer.figuresAbsolute[0].t)")
    //- TICKS
    div(:style=`{height: '44px'}`).row.full-width.justify-center.content-center.items-center.q-px-md
      div(:style=`{borderRadius: '30px'}`).row.full-height.items-center.content-center.bg-grey-7.q-pa-xs
        q-btn(round flat dense no-caps color="white" icon="keyboard_arrow_left" @click="layerTick(0, 0)").q-mr-lg
        q-btn(round flat dense no-caps color="white" icon="keyboard_arrow_right" @click="layerTick(0, 1)")
      .col.full-height
        .row.fit.items-center.content-center.justify-center
          span.text-white {{ $time(layer.figuresAbsolute[1].t - layer.figuresAbsolute[0].t) }}
          .row.full-width.justify-center.text-grey-5
            small Total
      div(:style=`{borderRadius: '30px'}`).row.full-height.items-center.content-center.bg-grey-7.q-pa-xs
        q-btn(round flat dense no-caps color="white" icon="keyboard_arrow_left" @click="layerTick(1, 0)").q-mr-lg
        q-btn(round flat dense no-caps color="white" icon="keyboard_arrow_right" @click="layerTick(1, 1)")
    //- ACTIONS: delete, copy, share, save
    .row.full-width.q-px-lg.q-py-sm
      q-btn(round flat icon="delete_outline" color="red" @click="$emit('layerDelete', index)")
      .col.full-height
      q-btn(round flat icon="favorite_border" color="white" @click="layerLove()")
</template>

<script>
export default {
  name: 'videoComposer_layersLayer',
  props: ['index', 'layer', 'active', 'player', 'meta'],
  data () {
    return {
      height: 0
    }
  },
  computed: {
    layerName () {
      if (this.layer.spheres.length > 0) {
        return this.layer.spheres[0].name
      } else {
        return false
      }
    },
    layerActive () {
      return this.meta.layerIndexPlay === this.index
    },
    layerOver () {
      if (this.meta.now >= this.layer.figuresAbsolute[0].t && this.meta.now <= this.layer.figuresAbsolute[1].t) {
        return true
      }
      else {
        return false
      }
    },
    layerPercent () {
      if (!this.layer) return 0
      let dNow = this.meta.now - this.layer.figuresAbsolute[0].t
      let dAll = this.layer.figuresAbsolute[1].t - this.layer.figuresAbsolute[0].t
      return (dNow / dAll) * 100
    }
  },
  watch: {
    layerActive: {
      immediate: true,
      async handler (to, from) {
        this.$log(this.index, 'layerActive CHANGED', to, from)
        if (to) {
          if (to !== from) {
            if (this.height !== 165) this.$tween.to(this, 0.3, {height: 165})
            // this.player.setCurrentTime(this.layer.figuresAbsolute[0].t)
          }
        }
        else {
          if (this.height !== 0) this.$tween.to(this, 0.3, {height: 0})
        }
      }
    }
  },
  methods: {
    layerClick () {
      this.$log('layerClick')
      this.player.setCurrentTime(this.layer.figuresAbsolute[0].t)
    },
    layerPlayButtonClick () {
      this.$log('layerPlayButtonClick')
      this.$emit('meta', ['mode', 'layer'])
      this.$emit('meta', ['layerIndex', this.index])
      this.$emit('meta', ['layerIndexPlay', this.index])
      if (this.meta.playing) this.player.pause()
      else this.player.play()
    },
    layerTick (index, forward) {
      this.$log('layerTick', index, forward)
      let from = this.layer.figuresAbsolute[index].t
      let to = forward ? from + 0.100 : from - 0.100
      this.layer.figuresAbsolute[index].t = to
      this.player.pause()
      this.player.setCurrentTime(to)
    },
    layerProgressClick (e) {
      // this.$log('layerProgressClick', e)
      let width = e.path[0].clientWidth
      let offsetX = e.offsetX
      let k = offsetX / width
      let d = this.layer.figuresAbsolute[1].t - this.layer.figuresAbsolute[0].t
      let to = this.layer.figuresAbsolute[0].t + (k * d)
      this.player.setCurrentTime(to)
    },
    layerProgressPan (e) {
      this.$log('layerProgressPan', e)
    },
    layerLove () {
      this.$log('layerLove')
    }
  },
  mounted () {
    this.$log('mounted')
  }
}
</script>
