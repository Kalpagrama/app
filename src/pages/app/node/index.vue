<template lang="pug">
.row.full-width
  span node page
</template>

<script>
export default {
  name: 'pageAppNode',
  components: {},
  props: {},
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
