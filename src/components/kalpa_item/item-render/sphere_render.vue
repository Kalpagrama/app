<template lang="pug">
div(
  :style=`{
  position: 'relative'}`
).row.full-width.items-start.content-start.justify-center.q-py-xl
  q-icon(name="blur_on" size="200px" color="white")
  .row.full-width.justify-center.q-py-lg
    span(:style=`{
    fontSize: '30px',
  }`).text-white.text-bold {{ item.name }}
</template>

<script>
export default {
  name: 'sphereRender',
  props: ['item']
}
</script>
