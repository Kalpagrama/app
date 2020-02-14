<template lang="pug">
.column.fit
  //- header
  //- TODO its not only layers, its VIDEO, content meta....
  div(
    :style=`{height: '60px', order: -10}`
    ).row.full-width
    //- div(:style=`{width: '60px', height: '60px'}`).row.items-center.justify-center
    //-   q-btn(round flat color="green" icon="layers")
    .col.full-height
      .row.fit.items-center.content-center.q-px-sm
        //- TODO change meta information of the content: layers, nodes, users, spheres, etc...
        q-btn(flat no-caps color="green" icon-right="keyboard_arrow_down"
          :style=`{borderRadius: '10px'}`)
          span.text-bold.text-green Layers
        //- q-icon(name="keyboard_arrow_down" color="green" size="19px").q-mt-xs.q-ml-sm
    div(:style=`{width: '60px', height: '60px'}`).row.items-center.justify-center
      q-btn(round flat color="green" icon="keyboard_arrow_right" @click="$emit('changePosition')")
      //- TODO change position of layers from bottom to right/bottom/top/left?
  //- body
  div(:style=`{position: 'relative'}`).col.full-width.scroll
    .row.full-width.items-start.content-start.q-pa-sm
      div(
        v-for="(l, li) in layers" :key="li"
        :class=`{'bg-grey-10': li !== layerIndex, 'bg-grey-8': li === layerIndex}`
        :style=`{position: 'relative', minHeight: '40px', borderRadius: '10px', overflow: 'hidden'}`
        ).row.full-width.items-center.content-center.q-mb-sm.cursor-pointer
        //- inactive tint
        div(
          v-if="layerIndex !== li" @click="layerClick(l, li)"
          :style=`{position: 'absolute', zIndex: 200, opacity: 0.3}`
          ).row.fit.cursor-pointer.bg-black
        //- inactive layer
        div(
          v-if="l.figuresAbsolute.length > 0"
          :style=`{height: '40px'}`
          ).row.full-width.items-center.content-center.q-px-sm
          span.text-white {{ $time(l.figuresAbsolute[0].t) }}-
          span.text-white {{ $time(l.figuresAbsolute[1].t) }}
        //- active layer
        div(
          v-if="layerIndex === li"
          :style=`{height: height+'px'}`
          ).row.full-width.items-end.content-end.justify-end.q-pa-sm
          //- span EXPORT, delete, use, fuck me
          div(:style=`{height: '60px'}`).row.full-width.items-center.content-center.justify-betweens
            q-btn(round flat color="green" icon="keyboard_arrow_left" @click="l.figuresAbsolute[0].t -= 0.100")
            q-btn(round flat color="green" icon="keyboard_arrow_right" @click="l.figuresAbsolute[0].t += 0.100")
            q-btn(round flat color="green" icon="keyboard_arrow_left" @click="l.figuresAbsolute[1].t -= 0.100")
            q-btn(round flat color="green" icon="keyboard_arrow_right" @click="l.figuresAbsolute[1].t += 0.100")
            .col.full-height
            q-btn(round flat color="red" icon="delete" @click="layerDelete(li)").q-mr-sm
            q-btn(dense no-caps color="green" @click="layerExport(l, li)").q-px-sm Export
</template>

<script>
export default {
  name: 'editorVideoLayers',
  props: ['header', 'layerIndex', 'layer', 'layers', 'layerClick', 'layerDelete', 'layerExport'],
  data () {
    return {
      height: 0
    }
  },
  watch: {
    layerIndex: {
      handler (to, from) {
        this.$log('layerIndex CHANGED', to)
        if (to !== from) {
          this.height = 0
          this.$tween.to(this, 0.4, {height: 100})
        }
      }
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
