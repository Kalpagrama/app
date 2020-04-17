<template lang="pug">
span chain explorer
</template>

<script>
export default {
  name: 'chainExplorer',
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
