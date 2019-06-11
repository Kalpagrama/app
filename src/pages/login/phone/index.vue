<template lang="pug">
.row.fit.items-center.justify-center
  span Not avaible now
</template>

<script>
export default {
  name: 'pageLogin__Phone',
  data () {
    return {
    }
  },
  mounted () {
    this.$log('monuted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
