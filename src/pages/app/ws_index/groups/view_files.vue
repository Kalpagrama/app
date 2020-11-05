<template lang="pug">
div(
  ).row.full-width.items-start.content-start
  div(
    v-for="n in node.items" :key="n.id"
    :style=`{
      background: 'rgb(35,35,35)',
      width: '100px', height: '100px',
      borderRadius: '10px',
    }`
    ).row.items-center.content-center.justify-center.q-mr-sm.q-mb-sm
    small.text-white {{ n.id }}
</template>

<script>
export default {
  name: 'viewFiles',
  props: ['node'],
}
</script>
