<template lang="pug">
.row.full-width
  img(
    :src="previewUrl" draggable="false"
    :style=`{
      userSelect: 'none', objectFit: 'contain', opacity: 1,
      maxHeight: $q.screen.height-120+'px'
    }`
    ).full-width
</template>

<script>
export default {
  name: 'nodeLayoutPip-nodeItems',
  props: ['node', 'nodeFull'],
  data () {
    return {
    }
  },
  computed: {
    previewUrl () {
      return this.node.meta.items[0].thumbUrl
    }
  }
}
</script>
