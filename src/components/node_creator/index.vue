<template lang="pug">
.column.fit
  span node_creator
</template>

<script>
export default {
  name: 'nodeCreator',
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
