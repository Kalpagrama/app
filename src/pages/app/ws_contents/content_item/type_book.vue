<template lang="pug">
div(
  @click="$emit('pick')"
  :style=`{
    position: 'relative',
    borderRadius: '10px', overflow: 'hidden',
    cursor: 'pointer',
  }`
  ).row.full-width
  img(
    :src="content.thumbOid"
    :style=`{
      borderRadius: '10px', overflow: 'hidden',
      pointerEvents: 'none',
    }`
    ).full-width
</template>

<script>
export default {
  name: 'contentItem_typeBook',
  props: ['content', 'contentKalpa'],
  data () {
    return {
    }
  }
}
</script>
