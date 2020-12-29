<template lang="pug">
div(
  :style=`{
    position: 'relative',
  }`
  ).row.fit
  //- name
  //- div(
    :style=`{
      position: 'absolute', zIndex: 1000,
      //- bottom: '0px',
      //- ...(() => itemPinned ? {top: '0px'} : {bottom: '0px'})(),
      bottom: '34px',
    }`
    ).row.full-width.justify-center.bg-black
    q-btn(
      round flat dense color="white" icon="select_all")
    span(
      :style=`{
        //- borderRadius: '10px 10px 0 0',
        borderRadius: '10px',
        whiteSpace: 'nowrap',
      }`
    ).text-white.bg-black.q-pa-sm {{ item.name }}
  //- preview
  //- img(
    draggable="false"
    :src="item.thumbUrl"
    :style=`{
      borderRadius: '10px',
      //- objectFit: 'contain',
      objectFit: 'cover',
    }`
    ).fit.bg-black
  item(
    :oid="item.oid"
    :item="item"
    :itemIndex="0"
    :itemActive="itemActive"
    :itemStyles="{}")
</template>

<script>
import item from 'components/node_feed/node_items_item.vue'

export default {
  name: 'jointsRowItem',
  props: ['item', 'itemActive', 'itemPinned'],
  components: {
    item,
  }
}
</script>
