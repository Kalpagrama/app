<template lang="pug">
q-layout(
  view="hHh Lpr lff").b-30
  q-page-container
    q-page.row.full-width.justify-center
      div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
        .row.full-width.text-white.q-pa-xl.wrap
          span {{JSON.stringify($q.platform.is)}}
<!--          q-btn(round flat color="white" icon="panorama_fish_eye" @click="alert")-->
          //- h1.text-white about
</template>

<script>

export default {
  name: 'pageApp_about',
  methods: {
    async alert () {
      alert(JSON.stringify(this.$q.platform.is))
    }
  }
}
</script>
