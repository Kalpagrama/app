<template lang="pug">
div(
  :style=`{
    position: 'relative',
    paddingBottom: Math.round(ratio*100)+'%',
    //- marginBottom: '100px',
  }`
  ).row.full-width
  div(:style=`{position: 'absolute', zIndex: 100, top: 0}`).row.fit
    composition-player(
      :compositionKey="node.oid"
      :composition="node.items[0]"
      :isVisible="isVisible"
      :isActive="isActive"
      :isMini="false"
      :styles=`{
        height: '100%',
        objectFit: 'contain',
      }`
      :options=`{
        loop: true,
        nodeOid: node.oid,
        footerOverlay: true,
        showBar: false,
        showHeader: true,
        showFooter: true,
        mode: 'feed',
      }`)
//- composition-player(
  :composition="node.items[0]"
  :isVisible="isVisible"
  :isActive="isActive"
  :isMini="false"
  :styles=`{
    height: '100%',
    objectFit: 'cover',
    //- objectFit: 'contain',
  }`
  :options=`{
    loop: true,
    nodeOid: node.oid,
    footerOverlay: true,
    showBar: false,
    showHeader: true,
    showFooter: true,
    context: 'feed',
  }`)
</template>

<script>
import compositionPlayer from 'components/composition/composition_player/index.vue'

export default {
  name: 'nodeFeed__nodeItem',
  props: ['node', 'nodeIndex', 'isActive', 'isVisible'],
  components: {
    compositionPlayer,
  },
  data () {
    return {
    }
  },
  computed: {
    ratioMax () {
      return 0.6
      // return 1
    },
    ratio () {
      let height = this.node.items[0].thumbHeight
      if (height) {
        let ratio = height / this.node.items[0].thumbWidth
        // return Math.min(this.ratioMax, ratio)
        return this.ratioMax
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
