<template lang="pug">
div(
  :style=`{
    position: 'relative',
    borderRadius: '10px',
    minHeight: '240px',
  }`
  ).row.full-width.items-center.content-center.q-px-lg.q-py-xl.b-40
  span.text-white {{ item.layers[0].figuresAbsolute[0].epubCfiText }}
  div(
    :style=`{
      position: 'absolute', zIndex: 100, bottom: '0px', left: '0px',
      background: 'rgba(30,30,30,0.3)',
      borderRadius: '10px',
    }`
    ).row.full-width.items-center.content-center.q-px-md.q-py-xs
    q-icon(name="select_all" color="white" size="16px").q-mr-xs
    span.text-white {{ item.layers[0].contentName }}
</template>

<script>
export default {
  name: 'typeBook',
  props: ['item'],
}
</script>
