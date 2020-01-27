<template lang="pug">
q-layout().bg-primary
  q-page-container
    .column
      div(:style=`{height: 400+'px'}`).row.full-width.content-center
        k-spinner(:width="100" :height="100" @click.native="$router.push('/login')")
        .row.full-width.justify-center.q-mt-sm
          span.text-h6.text-white.text-bold KALPAGRAMMA
  q-footer(style=`height: 50%`)
    email
</template>

<script>
import email from 'pages/login/email'
export default {
  name: 'loginLayout',
  components: {email},
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
