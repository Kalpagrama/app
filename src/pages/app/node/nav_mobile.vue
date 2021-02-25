<template lang="pug">
div(
  :style=`{
    paddingBottom: 'env(safe-area-inset-bottom)',
  }`
  ).row.full-width.justify-center
  div(
    :style=`{
      maxWidth: $store.state.ui.pageWidth+'px',
      height: '70px',
      borderRadius: '10px 10px 0 0',
    }`
    ).row.full-width.items-center.content-center.justify-between.b-40
    q-btn(
      @click="$routerKalpa.back()"
      flat color="white" icon="west" no-caps
      :style=`{
        width: '70px',
        height: '70px',
      }`)
      span Назад
    .col
    kalpa-menu-popup-global(:styles=`{width: '70px', height: '70px',}`)
</template>

<script>
export default {
  name: 'navMobile',
  props: ['pageId'],
}
</script>
