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
    span(v-if="layerName").text-white.q-ml-md {{ layerName }}
    span(v-if="layerActive && !layerName").text-white.cursor-pointer.q-ml-md Set layer name
    .col
      .row.fit.items-center.content-center.justify-end.q-px-md
        span.text-white {{$time(layer.figuresAbsolute[0].t)}}-{{$time(layer.figuresAbsolute[1].t)}} / {{ $time(layer.figuresAbsolute[1].t - layer.figuresAbsolute[0].t) }}
    div(:style=`{height: '36px', width: '36px'}`).row.items-center.content-center.justify-center.cursor-pointer
      q-icon(color="white" size="20px" name="drag_indicator")
  //- INACTIVE tint
  div(
    v-if="!layerActive"
    @click="$emit('meta', ['layerIndex', index]), $emit('meta', ['layerIndexPlay', index])"
    :style=`{position: 'absolute', zIndex: 200,}`).row.fit.cursor-pointer
  //- ACTIVE layer
  div(
    :style=`{position: 'relative', height: height+'px', overflow: 'hidden'}`).row.full-width
    //- PLAYER progress
    div(:style=`{height: '60px'}`).row.full-width
      div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
        q-btn(round push @click="layerClickPlay()"
          :color="meta.mode === 'layer' && meta.playing ? 'red' : 'green'"
          :icon="meta.playing && layerActive ? 'pause' : 'play_arrow'")
      .col.full-height
        .row.fit.items-center.content-center
          //- progress wrapper
          div(:style=`{position: 'relative', height: '44px', borderRadius: '22px', overflow: 'hidden', border: '4px solid #616161'}`).row.full-width.bg-grey-8
            //- progress bar white
            div(
              v-show="!meta.editing"
              :style=`{
                position: 'absolute', left: '0px', top: '0px',
                border: '0px solid #616161',
                height: 'calc(100% - 0px)',
                width: 'calc(' + layerPercent + '% - 0px)',
                borderRadius: layerPercent > 5 ? '22px' : '22px'}`
              ).row.bg-grey-4
      div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
        q-btn(round flat color="white" icon="refresh" @click="player.setCurrentTime(layer.figuresAbsolute[0].t)")
    .row.full-width.bg {{layer.figuresAbsolute}}
    .row.full-width.br {{meta}}
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
        return this.layers.spheres[0].name
      } else {
        return false
      }
    },
    layerActive () {
      return this.meta.layerIndex === this.index
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
        this.$log(this.index, 'layerActive CHANGED', to)
        if (to) {
          // await this.$wait(300)
          this.$tween.to(this, 0.3, {height: 200})
        }
        else {
          this.$tween.to(this, 0.3, {height: 0})
        }
      }
    }
  },
  methods: {
    layerClick () {
      this.$log('layerClick')
      this.player.setCurrentTime(this.layer.figuresAbsolute[0].t)
    },
    layerClickPlay () {
      this.$log('layerClickPlay')
      this.$emit('meta', ['mode', 'layer'])
      this.$emit('meta', ['layerIndex', this.index])
      this.$emit('meta', ['layerIndexPlay', this.index])
      if (this.meta.playing) this.player.pause()
      else this.player.play()
    }
  }
}
</script>
