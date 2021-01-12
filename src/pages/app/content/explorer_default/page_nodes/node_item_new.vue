<template lang="pug">
div(
  :style=`{
    background: 'rgb(35,35,35)',
    borderRadius: '10px',
  }`
  ).row.full-width.q-mb-sm
  .row.full-width.q-pa-sm
    img(
      :src="node.items[0].thumbUrl"
      :style=`{
        height: '30px',
        borderRadius: '10px',
      }`
      )
    .col
    img(
      v-if="node.items[1]"
      :src="node.items[1].thumbUrl"
      :style=`{
        height: '30px',
        borderRadius: '10px',
      }`
      )
  .row.full-width.justify-center.q-pa-sm
    span.text-white {{ node.name }}
</template>

<script>
export default {
  name: 'nodeItemNew',
  props: ['node', 'player'],
}
</script>
