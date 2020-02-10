<template lang="pug">
.row.full-width.justify-center.items-start.content-start.bg-grey-10
  div(:style=`{maxWidth: '500px', marginTop: '60px', marginBottom: '60px'}`).row.full-width
    node(
      v-for="(n,ni) in nodes" :key="ni"
      :node="n" :index="ni" :visible="false" :active="false"
      :class=`{}`
      :style=`{position: 'relative'}`
      ).row.full-width.window-height
</template>

<script>
// TODO: swipe, visibility
import node from './node'

export default {
  name: 'nodeListByte',
  components: {node},
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
