<template lang="pug">
.row.fit
  div(style=`maxWidth: 800px; borderRadius: 4px; minHeight: 400px`).row.full-width.q-px-md.bg-white
    span Chain: {{oid}}
</template>

<script>
export default {
  name: 'pageApp__Chain',
  data () {
    return {
      oid: null
    }
  },
  watch: {
    $route: {
      immediate: true,
      handler (to, from) {
        this.$logD('$route CHANGED', to)
        if (to.params.oid) {
          this.oid = to.params.oid
        }
      }
    }
  },
  mounted () {
    this.$logD('mounted')
  },
  beforeDestroy () {
    this.$logD('beforeDestroy')
  }
}
</script>
