<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-page-container
    q-page.row.full-width.justify-center
      div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
        div(:style=`{width: '300px'}`).row
        .col.br
          h1.text-white messages
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
