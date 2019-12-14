<style lang="stylus">
</style>
<template lang="pug">
q-layout(view="hHh lpR fFf").bg-secondary
  q-page-conainter
    .row.full-width.justify-center
      div(:style=`{maxWidth: '500px'}`).row.full-width
        k-menu-desktop(:page="true").full-width
  q-footer(reveal).row.full-width.justify-center
    div(:style=`{maxWidth: '500px'}`).row.full-width
      k-menu-mobile
</template>

<script>
export default {
  name: 'pageAppMenu',
  props: [],
  data () {
    return {
    }
  }
}
</script>
