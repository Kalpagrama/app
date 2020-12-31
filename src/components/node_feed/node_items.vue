<template lang="pug">
div(:style=`{position: 'relative', padding: '11px'}`).row.full-width.items-end.content-end
  //- link btn
  q-btn(
    flat color="green" icon="link" size="lg"
    :to="'/links/'+node.items[0].oid+'?joint='+node.oid"
    :style=`{
      position: 'absolute', zIndex: 1000,
      left: 'calc(50% - 30px)',
      top: 'calc(50% - 30px)',
      width: '60px', height: '60px',
      //- pointerEvents: 'none'
    }`)
  //- items left/right
  div(
    v-for="(item, ii) in node.items" :key="ii"
    :style=`{
      position: 'relative',
    }`
    ).col-6
    div(
      :style=`{
        position: 'relative',
        paddingBottom: '100%',
        transform: ii === 0 ? 'perspective(1000px) rotateY(8deg) translate3d(0,0,-40px)' : 'perspective(1000px) rotateY(-8deg) translate3d(0,0,-40px)',
        zIndex: 10,
      }`
      ).row.full-width
      div(
        :style=`{
          position: 'absolute', zIndex: 100,
        }`
        ).row.fit
        item(
          :oid="node.oid"
          :item="item"
          :itemIndex="ii"
          :itemActive="isActive && itemActive === ii"
          :itemStyles="itemsStyles[ii]"
          :stylesName=`{}`)
    //- inActive tint
    div(
      v-if="itemActive !== ii"
      @click="itemActive = ii"
      :style=`{
        position: 'absolute', zIndex: 110, top: 0,
      }`
      ).row.fit.cursor-pointer
</template>

<script>
import item from './node_items_item.vue'

export default {
  name: 'nodeFeed__nodeItems',
  props: ['node', 'isActive', 'isVisible', 'itemsStyles'],
  components: {
    item,
  },
  data () {
    return {
      itemActive: 0,
    }
  },
  watch: {
    itemActive: {
      immediate: true,
      handler (to, from) {
        if (to >= 0) {
          this.$emit('itemActive', to)
        }
      }
    }
  }
}
</script>
