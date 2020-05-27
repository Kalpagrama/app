<template lang="pug">
.row.full-width
  span player HTML
</template>

<script>
export default {
  name: 'playerHtml',
  data () {
    return {
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
