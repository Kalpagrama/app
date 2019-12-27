<template lang="pug">
q-layout().bg-primary
  q-page-container
    .column
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
