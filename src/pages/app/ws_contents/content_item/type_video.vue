<style lang="sass" scoped>
.item
  &:hover
    background: rgb(60,60,60)
</style>

<template lang="pug">
div(
  @click="$emit('pick')"
  :style=`{
    borderRadius: '10px', overflow: 'hidden',
    cursor: 'pointer',
  }`
  ).row.full-width.q-mb-sm.b-50.item
  img(
    :src="content.thumbOid"
    draggable="false"
    :style=`{
      height: '100px', width: '180px', objectFit: 'cover',
      borderRadius: '10px', overflow: 'hidden',
      pointerEvents: 'none',
    }`
    )
  .col.full-height
    .row.fit.items-start.content-start.q-pa-sm
      span.text-white {{ content.name }}
</template>

<script>
export default {
  name: 'contentItem_typeVideo',
  props: ['content', 'contentKalpa'],
  data () {
    return {
    }
  }
}
</script>
