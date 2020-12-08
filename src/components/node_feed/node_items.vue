<template lang="pug">
div(:style=`{position: 'relative', padding: '11px'}`).row.full-width.items-end.content-end
  q-btn(
    flat color="green" icon="link" size="lg"
    :style=`{
      position: 'absolute', zIndex: 1000,
      left: 'calc(50% - 30px)',
      top: 'calc(50% - 30px)',
      width: '60px', height: '60px',
    }`)
  div(
    v-for="(item, ii) in node.items" :key="ii"
    :style=`{
      position: 'relative',
    }`
    ).col-6
    item(
      :oid="node.oid"
      :item="item"
      :itemIndex="ii"
      :itemActive="isActive && itemActive === ii"
      :itemVertex="node.vertices[ii]"
      :itemStyles="itemsStyles[ii]")
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
  name: 'nodeFeed_items',
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
