<template lang="pug">
div(
  :style=`{
    //- paddingBottom: 'env(safe-area-inset-bottom)',
  }`
  ).row.full-width.justify-center
  div(
    :style=`{
      maxWidth: $store.state.ui.pageWidth+'px',
      paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)',
      borderRadius: '20px 20px 0 0',
    }`
    ).row.full-width.items-center.content-center.justify-between.b-50.q-pt-sm.q-px-sm
    q-btn(
      @click="$routerKalpa.back()"
      flat color="grey-7" icon="west" no-caps
      :style=`{
        width: '46px',
        height: '46px',
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
    kalpa-menu-popup-global(
      color="grey-7"
      :styles=`{width: '46px', height: '46px',}`)
</template>

<script>
export default {
  name: 'navMobile',
  props: ['pageId'],
}
</script>
