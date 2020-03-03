<template lang="pug">
.row.full-width
  span.text-red wsSetting
</template>

<script>
export default {
  name: 'wsSetting',
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
