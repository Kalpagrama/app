<template lang="pug">
div(
  @click="$emit('pick')"
  :style=`{
    borderRadius: '10px', overflow: 'hidden',
    cursor: 'pointer',
  }`
  ).row.full-width.q-mb-sm.b-60
  img(
    :src="content.thumbOid"
    draggable="false"
    :style=`{
      height: '100px',
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
