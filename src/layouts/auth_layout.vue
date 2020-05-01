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
    // if (this.$q.screen.width > 600) {
    // }
    // else {
    // }
    document.body.style.background = '#424242'
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
