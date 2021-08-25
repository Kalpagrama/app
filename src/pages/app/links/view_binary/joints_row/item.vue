<template lang="pug">
div(
  :style=`{
    position: 'relative',
  }`
  ).row.fit
  item(
    :oid="item.oid"
    :item="item"
    :itemIndex="0"
    :itemActive="itemActive"
    :itemStyles="{}"
    :stylesName=`{
      marginBottom: '34px',
      background: 'black',
      borderRadius: '10px',
    }`)
</template>

<script>
import item from 'src/components/kalpa_item/item_feed/node_feed/node_items_item.vue'

export default {
  name: 'jointsRowItem',
  props: ['item', 'itemActive', 'itemPinned'],
  components: {
    item,
  }
}
</script>
