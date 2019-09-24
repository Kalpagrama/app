<template lang="pug">
.row.fit
  span menu right
</template>

<script>
export default {
  name: 'videoEditor__menuRight',
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
