<template lang="pug">
.column.fit
  div(
    v-show="height > 100"
    :style=`{position: 'relative', minHeight: '60px'}`).row.full-width.items-center.justify-center
    //- img(:src="content.thumbUrl" :style=`{width: '100%', pointerEvents: 'none'}`)
    div(:style=`{position: 'absolute', zIndex: 100, background: 'rgba(0,0,0,0.2)'}`).row.fit.items-end.q-pa-sm
      span(:style=`{borderRadius: '10px', background: 'rgba(0,0,0,0.8)'}`).text-bold.text-white.q-pa-sm {{ content.name }}
  .col.full-width.scroll
    .row.full-width.items-start.content-start.q-px-sm
</template>

<script>
export default {
  name: 'videoComposer_extraNodes',
  props: ['composition', 'meta', 'player', 'height'],
  computed: {
    layers () {
      return this.composition.layers
    },
    layer () {
      return this.layers[this.meta.layerIndex]
    },
    content () {
      return this.layer.content
    }
  },
  data () {
    return {
    }
  }
}
</script>
