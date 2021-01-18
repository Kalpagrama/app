<template lang="pug">
div(
  :style=`{
    position: 'relative',
    paddingBottom: Math.round(ratio*100)+'%',
  }`
  ).row.full-width
  div(:style=`{position: 'absolute', zIndex: 100, top: 0}`).row.fit
    composition-player(
      :composition="node.items[0]"
      :isVisible="isVisible"
      :isActive="isActive"
      :isMini="false"
      :styles=`{
        height: '100%',
        objectFit: 'cover',
      }`
      :options=`{
        loop: true,
        showBar: true,
        showHeader: true,
        nodeOid: node.oid,
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
    ratioMax () {
      // return 0.6
      return 1
    },
    ratio () {
      let height = this.node.items[0].thumbHeight
      if (height) {
        let ratio = this.node.items[0].thumbHeight / this.node.items[0].thumbWidth
        return Math.min(this.ratioMax, ratio)
      }
      else {
        return this.ratioMax
      }
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
