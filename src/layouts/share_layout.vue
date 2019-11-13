<template lang="pug">
.column.fit.items-center.justify-center
  //- span {{ share }}
</template>

<script>
export default {
  name: 'share_layout',
  data () {
    return {
    }
  },
  watch: {
    '$route': {
      deep: true,
      immediate: true,
      handler (to, from) {
        this.$log('$route CHANGED', to)
        // this.$set(this, 'share', to.params)
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
