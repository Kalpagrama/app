<style lang="stylus">
.kinput {
  border: none;
  height: 100%;
  padding: 10px;
  &:focus {
    outline: none;
  }
}
.kbtn {
  border-radius: 10px
}
</style>

<template lang="pug">
.column.fit
  //- layerContentLayers
  layer-content-layers(
    v-if="layerContentLayersShow && meta.layerIndex >= 0"
    :layer="layers[meta.layerIndex]"
    @layerAdd="$emit('layerAdd', $event), layerContentLayersShow = false"
    @hide="layerContentLayersShow = false"
    :style=`{position: 'absolute', zIndex: 1000, right: '0px'}`).fit
  //- header
  div(
    v-if="true"
    :style=`{height: '60px'}`).row.full-width.items-center.content-center.q-px-sm
    div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
      q-btn(
        round push @click="compositionPlayButtonClick()"
        :color="meta.mode === 'play' && meta.playing ? 'red' : 'green'"
        :icon="meta.mode === 'play' && meta.playing ? 'pause' : 'play_arrow'")
    .col
      .row.fit.items-center.content-center
        span(
          :class=`{
            'text-green': layersLength <= 60,
            'text-red': layersLength > 60,
            'text-bold': layersLength > 60
          }`
        ) {{ $time(layersLength) }}
    q-btn(
      v-if="ctx !== 'contentEditor'"
      round flat color="green" icon="school" @click="layerContentLayersShow = !layerContentLayersShow")
  //- body
  div(:style=`{position: 'relative'}`).col.full-width.scroll
    //- wrapper of layers
    div(:style=`{paddingBottom: '300px'}`).row.full-width.items-start.content-start.q-pa-sm
      //- .row.full-width
      //-   small(v-for="(l,li) in layers" :key="li").full-width.text-white.q-ml-md {{l.spheres.length > 0 ? l.spheres[0].name : li}}
      //- .row.full-width.q-pa-xs
      //-   small.text-white {{ meta }}
      draggable(v-model="layers" handle=".layerhandle" @start="layerMoveStart" @end="layerMoved").full-width
        //- transition-group
        div(
          v-for="(l, li) in layers" :key="li"
          v-if="l.figuresAbsolute.length > 0"
          :class=`{
            'bg-grey-9': li !== meta.layerIndexPlay,
            'bg-green': li === meta.layerIndexPlay
          }`
          :style=`{height: '40px', borderRadius: '10px', overflow: 'hidden'}`
          ).row.full-width.items-center.content-center.q-mb-xs
          div(
            @click="$emit('layerClick', li)"
            ).col.full-height.cursor-pointer
            .row.fit.items-center.content-center
              span(
                v-if="l.spheres.length > 0"
                ).text-white.cursor-pointer.q-ml-md {{ l.spheres[0].name }}
              .col.full-height
                .row.fit.items-center.content-center.justify-end.q-px-xs
                  small.text-white {{$time(l.figuresAbsolute[0].t)}}-{{$time(l.figuresAbsolute[1].t)}} / {{ $time(l.figuresAbsolute[1].t - l.figuresAbsolute[0].t) }}
          div(:style=`{height: '40px', width: '40px'}`).row.items-center.content-center.justify-center.layerhandle
            q-icon(color="white" size="20px" name="drag_indicator")
</template>

<script>
import draggable from 'vuedraggable'
import layer from './layer'
import layerContentLayers from './layer_content_layers'

export default {
  name: 'videoComposerLayers',
  components: { draggable, layer, layerContentLayers },
  props: ['ctx', 'composition', 'layers', 'player', 'meta'],
  data () {
    return {
      layerContentLayersShow: false
    }
  },
  computed: {
    layersFiltered () {
      return this.layers
    },
    layersLength () {
      return this.layers
        .filter(l => {
          return l.figuresAbsolute.length > 0
        })
        .reduce((acc, l) => {
          acc += l.figuresAbsolute[1].t - l.figuresAbsolute[0].t
          return acc
        }, 0)
    }
  },
  methods: {
    compositionPlayButtonClick () {
      this.$log('compositionPlayButtonClick')
      if (this.meta.playing && this.meta.mode === 'play') {
        this.player.pause()
      }
      else {
        this.$emit('meta', ['mode', 'play'])
        this.$emit('meta', ['layerIndex', 0])
        this.$emit('meta', ['layerIndexPlay', -1])
        this.player.play()
      }
      if (this.$q.screen.width > 800) {
      }
      else {
        this.$emit('drawerToggle')
      }
    },
    layerMoveStart (e) {
      this.$log('layerMoveStart')
      this.$emit('meta', ['mode', 'play'])
      this.$emit('meta', ['layerIndex', 0])
      this.$emit('meta', ['layerIndexPlay', -1])
    },
    layerMoved (e) {
      this.$log('layerMoved', e)
      if (e.oldIndex !== e.newIndex) {
        this.$set(this.composition, 'layers', this.layers)
      }
    }
  }
}
</script>
