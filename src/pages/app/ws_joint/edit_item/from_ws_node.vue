<template lang="pug">
div(
  :style=`{
    borderRadius: '10px',
  }`
  ).row.full-width.b-40
  img(
    :src="node.thumbUrl"
    :style=`{
      borderRadius: '10px',
    }`).full-width
  .row.full-width.items-center.content-center.justify-center.q-pa-sm
    span.text-white {{ node.name }}
</template>

<script>
export default {
  name: 'fromWsNode',
  props: ['node'],
  data () {
    return {
    }
  }
}
</script>
