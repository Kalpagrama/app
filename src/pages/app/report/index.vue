<template lang="pug">
q-layout(
  view="hHh lpR fFf"
  :style=`{height: $q.screen.height+'px'}`).bg-grey-10
  q-page-conainter
    q-page
      div(:style=`{height: '60px'}`).row.full-width
      .row.full-width.justify-center.q-pt-sm
        div(
          :style=`{
            maxWidth: $store.state.ui.maxWidthPage+'px',
            borderRadius: '10px', overflow: 'hidden'
          }`).row.full-width.bg-grey-9.q-pa-md
          h1.text-white Report a bug
</template>

<script>
export default {
  name: 'pageAppReport',
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
