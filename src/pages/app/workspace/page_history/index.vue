<template lang="pug">
q-layout(
  view="hHh lpR fFf"
  container
  :style=`{
    height: $q.screen.height+'px',
  }`).b-30
  q-header(reveal)
    .row.full-width.justify-center.q-px-sm.q-pt-sm.b-30
      div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
        div(
          :style=`{
            height: '60px',
            borderRadius: '10px',
          }`
          ).row.full-width.items-center.content-center.q-pa-sm.b-40
          q-btn(round flat color="white" icon="west" @click="$routerKalpa.back()")
          .col.full-height
            .row.fit.items-center.content-center.justify-center
              //- q-icon(name="bookmark_outline" size="24px").q-mr-xs
              span(:style=`{fontSize: '18px'}`).text-white.text-bold История
          q-btn(round flat color="white" icon="search")
</template>

<script>
export default {
  name: 'pageHistory',
}
</script>
