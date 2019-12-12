<template lang="pug">
div(:style=`{position: 'relative'}`).row.full-width
  q-carousel(
    animated
    v-model="slide"
    swipeable
    keep-alive
    navigation
    infinite).full-width
    q-carousel-slide(
      v-for="(p, pi) in node.thumbUrl" :key="pi" :name="pi" :img-src="p" :style=`{objectFit: 'contain'}`)
</template>

<script>
export default {
  name: 'nodeTempateSlider',
  props: ['node', 'nodeFull'],
  data () {
    return {
      slide: 0
    }
  }
}
</script>
