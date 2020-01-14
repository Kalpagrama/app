<style lang="stylus">
.q-footer {
  background: none !important;
}
</style>
<template lang="pug">
q-layout(view="hHh lpR fFf").bg-secondary
  q-page-conainter
    .row.full-width.justify-center
      div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width
        k-menu-desktop(:page="true").full-width
  q-footer(reveal).row.full-width.justify-center
    k-menu-mobile(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`)
</template>

<script>
export default {
  name: 'pageAppMenu',
  props: [],
  data () {
    return {
    }
  },
  mounted () {
    this.$log('mounted')
    this.$q.addressbarColor.set('#1b2e65')
    document.body.style.background = '#1b2e65'
  }
}
</script>
