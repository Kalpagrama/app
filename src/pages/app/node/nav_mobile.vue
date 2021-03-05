<template lang="pug">
div(
  :style=`{
    //- paddingBottom: 'env(safe-area-inset-bottom)',
  }`
  ).row.full-width.justify-center
  div(
    :style=`{
      maxWidth: $store.state.ui.pageWidth+'px',
      paddingBottom: 'env(safe-area-inset-bottom)',
      //- height: '70px',
      borderRadius: '10px 10px 0 0',
    }`
    ).row.full-width.items-center.content-center.justify-between.b-40.q-pt-sm
    q-btn(
      @click="$routerKalpa.back()"
      flat color="white" icon="west" no-caps
      :style=`{
        width: '70px',
        height: '70px',
      }`)
      span Назад
    //- .col
    //- q-btn(
      flat color="green" icon="add" no-caps stack
      :style=`{
        //- width: '70px',
        height: '70px',
      }`).col
      span(:style=`{whiteSpace: 'nowrap'}`).q-mt-sm Добавить связь
    //- .col
    kalpa-menu-popup-global(:styles=`{width: '70px', height: '70px',}`)
</template>

<script>
export default {
  name: 'navMobile',
  props: ['pageId'],
}
</script>
