<style lang="stylus">
</style>

<template lang="pug">
.column.fit.bg-grey-3
  div(:style=`{height: '60px'}`).row.full-width.items-center
    span ws_spheres
</template>

<script>
export default {
  name: 'wsSpheres',
  data () {
    return {
    }
  },
  mounted () {
    this.$log('mounted')
  }
}
</script>
