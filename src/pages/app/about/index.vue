<template lang="pug">
q-layout(
  view="hHh Lpr lff").b-30
  q-page-container
    q-page.row.full-width.justify-center
      div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
        .row.full-width.text-white.q-pa-xl
          span content/nodes/links votes spheres bookmarks
          //- h1.text-white about
</template>

<script>
export default {
  name: 'pageApp_about',
}
</script>
