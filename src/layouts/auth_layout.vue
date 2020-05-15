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
    let bg
    if (this.$q.screen.width > 600) {
      bg = 'rgb(30,30,30)'
    }
    else {
      bg = 'rgb(70,70,70)'
    }
    document.body.style.background = 'red'
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
