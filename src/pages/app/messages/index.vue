<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-page-container
    q-page.row.full-width.justify-center
      div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
        div(:style=`{width: '300px'}`).column
          .row.full-width
            div(:style=`{height: '60px',}`).row.full-width.items-center.content-center.q-px-sm
              span(:style=`{fontSize: '18px',}`).text-white.text-bold Messages
              .col
              q-btn(round flat dense color="green" icon="add")
          .row.full-width.q-px-sm
            span.text-white search
          .col.full-width
        .col
          .row.full-width.justify-center
            span.text-white.text-bold.q-mt-xl You dont have message selected
</template>

<script>
export default {
  name: 'pageApp_messages',
  data () {
    return {
    }
  }
}
</script>
