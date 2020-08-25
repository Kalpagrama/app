<template lang="pug">
</template>

<script>
export default {
  name: 'wsContentPlayer__playerBook',
  data () {
    return {
      currentPage: 0
    }
  },
  mounted () {
    this.$log('mounted')
    this.$emit('player', this)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
