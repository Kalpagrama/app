<template lang="pug">
.row.full-width
  h1.text-white nodeChains
</template>

<script>
export default {
  name: 'pageApp__node__nodeChains',
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
