<template lang="pug">
.column.fit
  //- header optional
  div(
    v-if="header"
    :style=`{height: '60px'}`
    ).row.full-width
    div(:style=`{width: '60px', height: '60px'}`).row.items-center.justify-center
      q-btn(round flat color="green" icon="layers")
    .col.full-height
      .row.fit.items-center.content-center
        span.text-bold.text-green Layers
  //- body
  div(:style=`{position: 'relative'}`).col.full-width.scroll
    .row.full-width.items-start.content-start.q-pa-md
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
          q-btn(push dense no-caps color="green" @click="layerExport(l, li)") Export me
</template>

<script>
export default {
  name: 'editorVideoLayers',
  props: ['header', 'layerIndex', 'layer', 'layers', 'layerClick', 'layerExport'],
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
