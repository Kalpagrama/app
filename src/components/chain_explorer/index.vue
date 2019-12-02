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
    this.$logD('mounted')
  },
  beforeDestroy () {
    this.$logD('beforeDestroy')
  }
}
</script>
