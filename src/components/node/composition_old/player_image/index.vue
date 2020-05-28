<template lang="pug">
.row.full-width
  span player IMAGE
</template>

<script>
export default {
  name: 'playerImage',
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
