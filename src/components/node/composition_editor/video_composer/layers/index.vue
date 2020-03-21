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
.q-menu {
  background: none !important;
  border-radius: 10px !important;
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
    :style=`{height: '60px', marginTop: '00px', order: 0}`).row.full-width.items-center.content-center.q-px-sm
    div(:style=`{height: '60px'}`).row.items-center.content-center.justify-center
      //- :icon="meta.mode === 'play' && meta.playing ? 'pause' : 'play_arrow'"
      q-btn(
        push no-caps @click="compositionPlayButtonClick()"
        :color="meta.mode === 'play' ? 'red' : 'green'"
        :style=`{width: '120px', borderRadius: '10px', overflow: 'hidden', marginLeft: '30px'}`)
        span.text-white.text-bold.q-ml-sm {{meta.mode === 'play' ? 'Playing all' : 'Play all'}}
    .col
      .row.fit.items-center.content-center.q-px-md
        span(
          :class=`{
            'text-green': layersLength <= 60,
            'text-red': layersLength > 60,
            'text-bold': layersLength > 60
          }`
        ) {{ $time(layersLength) }}
    q-btn(
      v-if="meta.mode === 'play'"
      round flat color="white" icon="refresh" @click="$emit('meta', ['layerIndex', 0])")
    q-btn(
      v-if="ctx !== 'contentEditor'"
      round flat color="green" icon="school" @click="layerContentLayersShow = !layerContentLayersShow")
  //- body
  div(:style=`{position: 'relative', maxWidth: '100%'}`).col.full-width.scroll
    //- wrapper of layers
    div(:style=`{paddingBottom: '300px', maxWidth: '100%'}`).row.full-width.items-start.content-start.q-py-sm
      //- .row.full-width
      //-   small(v-for="(l,li) in layers" :key="li").full-width.text-white.q-ml-md {{l.spheres.length > 0 ? l.spheres[0].name : li}}
      //- .row.full-width.q-pa-xs
      //-   small.text-white {{ meta }}
      draggable(v-model="layers" handle=".layerdragger" @start="layerMoveStart" @end="layerMoved").full-width
        //- transition-group
        div(
          v-for="(l, li) in layers" :key="li"
          v-if="l.figuresAbsolute.length > 0"
          :style=`{position: 'relative', height: '40px'}`
          ).row.full-width.items-center.content-center.q-mb-xs
          //- drag & options
          div(:style=`{width: '36px', height: '40px'}`).row.items-center.content-center.justify-center.layerdragger
            q-btn(
              flat color="grey-7"
              :style=`{height: '40px', width: '30px', borderRadius: '10px', overflow: 'hidden'}`)
              q-icon(size="20px" name="drag_indicator")
              q-menu(:ref="'layerMenu-'+li" max-width="200px" anchor="center right" self="center left")
                layer-menu(
                  :layer="l" :index="li" @hide="$refs['layerMenu-'+li][0].hide()"
                  @layerDelete="$emit('layerDelete', li)")
          div(
            v-if="layerMovingIndex === li"
            :style=`{position: 'absolute', zIndex: 200, bottom: '-4px', height: '4px'}`).row.full-width.bg-green
          //- body
          div(
            @click="layerClick(l,li)"
            :class=`{
              'bg-grey-9': li !== meta.layerIndexPlay,
              'bg-green': li === meta.layerIndexPlay
            }`
            :style=`{
              position: 'relative',
              borderRadius: '10px', overflow: 'hidden'
            }`
            ).col.full-height.cursor-pointer.q-mr-sm
            //- %
            div(
              v-if="meta.now > l.figuresAbsolute[0].t && meta.now < l.figuresAbsolute[1].t"
              :style=`{
                position: 'absolute', left: '0px', zIndex: 100, pointerEvents: 'none',
                width: ((meta.now-l.figuresAbsolute[0].t)/(l.figuresAbsolute[1].t-l.figuresAbsolute[0].t))*100+'%',
                height: '40px', borderRadius: '10px', overflow: 'hidden', opacity: 0.5
              }`).row.bg-grey-3
            .row.fit.items-center.content-center
              span(
                v-if="l.spheres.length > 0"
                ).text-white.cursor-pointer.q-ml-md {{ l.spheres[0].name }}
              .col.full-height
                .row.fit.items-center.content-center.justify-end.q-px-sm
                  small.text-white {{$time(l.figuresAbsolute[0].t)}}-{{$time(l.figuresAbsolute[1].t)}} / {{ $time(l.figuresAbsolute[1].t - l.figuresAbsolute[0].t) }}
</template>

<script>
import draggable from 'vuedraggable'
import layer from './layer'
import layerMenu from './layer_menu'
import layerContentLayers from './layer_content_layers'

export default {
  name: 'videoComposerLayers',
  components: { draggable, layer, layerMenu, layerContentLayers },
  props: ['ctx', 'composition', 'layers', 'player', 'meta'],
  data () {
    return {
      layerContentLayersShow: false,
      layerMovingIndex: -1
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
    layerClick (l, li) {
      this.$log('layerClick', l, li)
      if (this.meta.layerIndexPlay === li) {
        this.$emit('meta', ['layerIndexPlay', -1])
        this.$emit('meta', ['mode', 'watch'])
      }
      else {
        this.$emit('layerClick', li)
      }
    },
    compositionPlayButtonClick () {
      this.$log('compositionPlayButtonClick')
      if (this.meta.mode === 'play') {
        // this.player.pause()
        this.$emit('meta', ['mode', 'watch'])
        this.$emit('meta', ['layerIndexPlay', -1])
      }
      else {
        this.$emit('meta', ['mode', 'play'])
        // this.$emit('meta', ['layerIndex', 0])
        this.$emit('meta', ['layerIndexPlay', -1])
        this.player.play()
      }
      if (this.$q.screen.width > 800) {
      }
      else {
        this.$emit('drawerToggle')
      }
    },
    layerMoveStart (e, i) {
      this.$log('layerMoveStart', e)
      this.layerMovingIndex = e.oldIndex
      // this.$emit('meta', ['mode', 'play'])
      // this.$emit('meta', ['layerIndex', 0])
      // this.$emit('meta', ['layerIndexPlay', -1])
    },
    layerMoved (e) {
      this.$log('layerMoved', e)
      if (e.oldIndex !== e.newIndex) {
        this.$set(this.composition, 'layers', this.layers)
        this.$emit('meta', ['layerIndexPlay', e.newIndex])
      }
      this.layerMovingIndex = -1
    }
  }
}
</script>
