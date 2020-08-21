<template lang="pug">
div(
  @click="$emit('pick')"
  :style=`{
    position: 'relative',
    borderRadius: '10px', overflow: 'hidden',
    cursor: 'pointer'
  }`
  ).row.full-width.items-start.content-start
  img(
    :src="content.thumbOid"
    draggable="false"
    :style=`{
      borderRadius: '10px', overflow: 'hidden',
      pointerEvents: 'none',
    }`
    ).full-width
</template>

<script>
export default {
  name: 'contentItem_typeImage',
  props: ['content', 'contentKalpa'],
  data () {
    return {
    }
  }
}
</script>
