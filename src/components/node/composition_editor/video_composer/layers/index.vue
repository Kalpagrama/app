<template lang="pug">
.column.fit
  //- div(:style=`{height: '60px'}`).row.full-width.items-center
  .col.full-width.scroll
    .row.full-width.items-start.content-start.q-px-sm
      layer(v-for="(l, li) in layers" :key="li" :index="li" :layer="l" :player="player" :meta="meta" @meta="$emit('meta', $event)")
</template>

<script>
import layer from './layer'

export default {
  name: 'videoComposerLayers',
  components: {layer},
  props: ['composition', 'player', 'meta'],
  data () {
    return {
    }
  },
  computed: {
    layers () {
      return this.composition.layers.filter(l => {
        return l.figuresAbsolute.length > 0
      })
    }
  }
}
</script>
