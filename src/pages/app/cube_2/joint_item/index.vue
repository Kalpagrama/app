<template lang="pug">
.row.full-width
  item-feed(
    v-if="item.type === 'NODE'"
    :itemShortOrFull="item"
    :itemState="{}"
    :isActive="isActive"
    :isVisible="isActive"
    :showHeader="false"
    :showActions="false"
    :style=`{
    }`)
  div(
    v-else
    ).row.full-width.items-start.content-start
    img(
      draggable="false"
      :src="j.populatedObject.items.find(i => i.oid !== oid).thumbUrl"
      :style=`{
        borderRadius: '10px',
      }`
      ).full-width
</template>

<script>
export default {
  name: 'jointItem',
  props: ['item', 'isActive'],
}
</script>
