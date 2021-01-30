<template lang="pug">
</template>

<script>
export default {
  name: 'listFeed',
  props: {
    wrapper: {
      type: Object,
      default: window,
    },
    query: {
      type: Object,
      required: true,
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
