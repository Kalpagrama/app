<template lang="pug">
.row.fit
  span chainExplorer
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
