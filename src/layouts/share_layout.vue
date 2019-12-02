<template lang="pug">
.column.fit.items-center.justify-center
  //- span {{ share }}
</template>

<script>
export default {
  name: 'shareLayout',
  data () {
    return {
    }
  },
  watch: {
    $route: {
      deep: true,
      immediate: true,
      handler (to, from) {
        this.$logD('$route CHANGED', to)
        // this.$set(this, 'share', to.params)
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
