<template lang="pug">
q-layout
</template>

<script>
export default {
  name: 'kLayout',
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