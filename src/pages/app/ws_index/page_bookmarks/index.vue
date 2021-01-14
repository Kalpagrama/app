<template lang="pug">
q-layout(
  view="hHh Lpr lff")
  q-header(
    reveal
    )
    .row.full-width.justify-center.q-pa-sm
      div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
        div(
          :style=`{
            height: '60px',
            borderRadius: '10px',
          }`
          ).row.full-width.items-center.content-center.q-pa-sm.b-40
          q-btn(round flat color="white" icon="west" @click="$routerKalpa.back()")
          .col
            span(:style=`{fontSize: '18px'}`).text-white.text-bold Закладки
  q-page-container
</template>

<script>
export default {
  name: 'workspace_bookmarks',
}
</script>
