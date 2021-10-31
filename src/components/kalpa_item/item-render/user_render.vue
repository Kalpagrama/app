<template lang="pug">
div(:style=`{ position: 'relative'}`).row.full-width.items-start.content-start.justify-center
  div(
    :style=`{
    position: 'absolute', zIndex: 100, top: '0px',
  }`
  ).row.full-wdith.q-pa-sm
    div(v-if="false"
      :style=`{
      borderRadius: '10px',
      textAlign: 'center',
    }`
    ).row.full-width.items-center.content-center.justify-center.q-pa-sm.bg-black
      q-icon(name="blur_on" color="white" size="26px").q-mr-sm
      span(:style=`{fontSize: '18px'}`).text-white.text-bold {{ item.name }}
  img(
    :src="item.thumbUrl"
    :style=`{
    borderRadius: '10px',
  }`
  ).full-width
</template>

<script>
export default {
  name: 'userRender',
  props: ['item']
}
</script>
