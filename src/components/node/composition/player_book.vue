<template lang="pug">
.row.full-width
  span player book
</template>

<script>
export default {
  name: 'playerBook',
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
