<template lang="pug">
div(
  :style=`{
    position: 'relative',
    paddingBottom: Math.min(Math.round(ratio*100), 100)+'%',
  }`
  ).row.full-width
  composition-player(
    :oid="node.oid"
    :composition="node.items[0]" :isVisible="isVisible" :isActive="isActive"
    :options=`{
      height: '100%', objectFit: 'contain', loop: true,
      showContentExplorer: true,
      showContentMeta: true,
    }`
    :style=`{
      position: 'absolute', zIndex: 100, top: 0,
    }`)
</template>

<script>
import compositionPlayer from 'components/composition/composition_player/index.vue'

export default {
  name: 'nodeFeed__nodeItem',
  props: ['node', 'isActive', 'isVisible'],
  components: {
    compositionPlayer,
  },
  data () {
    return {
    }
  },
  computed: {
    ratio () {
      let height = this.node.items[0].thumbHeight
      if (height) return this.node.items[0].thumbHeight / this.node.items[0].thumbWidth
      else return 1
    }
  },
  watch: {
    isActive: {
      immediate: true,
      handler (to, from) {
        this.$emit('itemActive', to ? 0 : false)
        // if (to) {}
        // this.$log('isActive', to)
      }
    }
  }
}
</script>
