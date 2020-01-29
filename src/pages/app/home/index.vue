<template lang="pug">
q-layout(view="hHh lpR fFf").bg-grey-3
  q-footer(reveal).row.full-width.justify-center.bg-grey-3.lt-sm
    slot(name="menuMobile")
  q-page-conainter.row.full-width.justify-center.items-start.content-start
    div(
      :style=`{maxWidth: '300px'}`
      ).row.full-height.bg-black.gt-xs
      slot(name="menuDesktop")
    .col
      .row.full-width.items-start.content-start.q-pa-sm
        h1 home
</template>

<script>
export default {
  name: 'pageAppHome',
  props: [],
  data () {
    return {
      width: 0
    }
  },
  computed: {
  },
  watch: {
  },
  methods: {
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
