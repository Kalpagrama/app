<template lang="pug">
.row.full-width.justify-center
  router-view
</template>

<script>
export default {
  name: 'authLayout',
  data () {
    return {
    }
  },
  mounted () {
    this.$log('mounted')
    document.body.style.background = '#424242'
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
