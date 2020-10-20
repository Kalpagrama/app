<template lang="pug">
div(:style=`{position: 'relative'}`).row.full-width
  slot
  //- node
  div(v-if="item.type === 'NODE' && item.oid").row.full-width
    img(
      draggable="false"
      :src="item.thumbUrl"
      :style=`{
        borderRadius: '10px', overflow: 'hidden',
      }`).full-width
  //- content
  div(v-else-if="item.type === 'CONTENT'").row.full-width
    img(
      draggable="false"
      :src="item.thumbUrl"
      :style=`{
        borderRadius: '10px', overflow: 'hidden',
      }`).full-width
</template>

<script>
export default {
  name: 'kalpaConnect_itemPlayer',
  props: ['item'],
  data () {
    return {
    }
  }
}
</script>
