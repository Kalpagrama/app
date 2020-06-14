<template lang="pug">
div
  div(
    :style=`{
      position: 'relative',
      borderRadius: '10px',
      overflow: 'hidden',
    }`).row.full-width.b-60
    img(
      @click="$emit('pick')"
      :src="composition.thumbOid"
      draggable="false"
      :style=`{
        objectFit: 'contain',
        borderRadius: '10px',
        overflow: 'hidden',
      }`
    ).full-width.cursor-pointer
    //- composition name
    div(
      v-if="compositionName.length > 0"
      :style=`{}`
      ).row.full-width.q-pa-md
      span.text-white.cursor-pointer {{ compositionName }}
</template>

<script>
export default {
  name: 'compositionItem',
  props: ['composition'],
  data () {
    return {
    }
  },
  computed: {
    compositionName () {
      return this.composition.name
    },
    compositionDuration () {
      return this.composition.layers.reduce((acc, layer) => {
        acc += (layer.figuresAbsolute[1].t - layer.figuresAbsolute[0].t)
        return acc
      }, 0)
    }
  }
}
</script>
