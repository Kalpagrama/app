<template lang="pug">
div(
  :style=`{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, height: '100%'}`
  ).column.full-width.bg-primary
  div(:style=`{height: 400+'px'}`).row.full-width.content-center
    k-spinner(:width="100" :height="100" @click.native="$go('/login')")
    .row.full-width.justify-center.q-mt-sm
      span.text-h6.text-white.text-bold KALPAGRAMMA
  .col.full-width.scroll
    router-view
</template>

<script>
export default {
  name: 'loginLayout',
  data () {
    return {
      height: window.innerHeight,
      width: window.innerWidth,
    }
  },
  methods: {
    handleResize (e) {
      this.height = e.height
      this.width = e.width
    }
  },
  mounted () {
    this.$logD('mounted', this.$route)
  },
  beforeDestroy () {
    this.$logD('beforeDestroy')
  }
}
</script>

<style lang="stylus">
</style>
