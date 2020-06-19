<template lang="pug">
q-layout(
  view="hHh lpR fFf"
  container
  :style=`{height: $q.screen.height+'px'}`).bg-grey-10
  q-page-conainter
    q-page
      div(:style=`{height: '60px'}`).row.full-width.justify-center
        div(:style=`{height: '60px', maxWidth: $store.state.ui.maxWidthPage+'px'}`
          ).row.full-width.items-center.q-px-sm
          span(:style=`{fontSize: '30px'}`).text-white Report a bug
      .row.full-width.justify-center.q-pt-sm
        div(
          :style=`{
            maxWidth: $store.state.ui.maxWidthPage+'px',
            borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden',
            minHeight: $q.screen.width > $store.state.ui.maxWidthPage ? $store.state.ui.maxWidthPage+'px' : $q.screen.width+'px'
          }`).row.full-width.bg-grey-9.q-pa-md
</template>

<script>
export default {
  name: 'pageApp-report',
  data () {
    return {
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
