<template lang="pug">
.row.full-width.justify-center.q-py-md.bg-white
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
    '$route': {
      immediate: true,
      handler (to, from) {
        this.$log('$route CHANGED', to)
        if (to.params.oid) {
          this.oid = to.params.oid
        }
      }
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
