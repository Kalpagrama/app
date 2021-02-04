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
    ).row.full-width.items-center.content-center.justify-between.b-40.q-px-sm
    q-btn(
      @click="$routerKalpa.back()"
      flat color="grey-7" icon="west" no-caps
      :style=`{maxWidth: '60px'}`)
      .row.full-width.justify-center
        small Назад
    .col
    //- q-btn(
      @click="$emit('pageId', 'inside')"
      flat icon="workspaces" no-caps
      :color="pageId === 'inside' ? 'green' : 'grey-7'"
      :style=`{maxWidth: '60px'}`)
      .row.full-width.justify-center
        small Микроядра
    //- q-btn(
      @click="$emit('pageId', 'names')"
      flat icon="blur_circular" no-caps
      :color="pageId === 'names' ? 'green' : 'grey-7'"
      :style=`{maxWidth: '60px'}`)
      .row.full-width.justify-center
        small Смыслы
    kalpa-menu-popup-global
</template>

<script>
export default {
  name: 'navMobile',
  props: ['pageId'],
}
</script>
