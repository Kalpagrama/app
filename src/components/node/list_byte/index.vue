<template lang="pug">
.row.full-width.items-start.content-start
  div(
    v-for="(n,ni) in nodes" :key="ni"
    :class=`{}`
    :style=`{}`
    ).row.full-width.window-height.bg-black
    img(
      :src="n.thumbUrl"
      :style=`{width: '100%', height: '100%', objectFit: 'contain'}`)
</template>

<script>
// TODO: swipe, visibility

export default {
  name: 'nodeListByte',
  props: ['nodes'],
  data () {
    return {
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
