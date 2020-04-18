<template lang="pug">
chain-explorer(v-if="chain" :chain="chain" :loading="chainLoading")
</template>

<script>
export default {
  name: 'pageApp-chain',
  data () {
    return {
      chain: null,
      chainLoading: false,
      chainLoadingError: null
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
