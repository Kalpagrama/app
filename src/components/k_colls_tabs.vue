<template lang="pug">
div(:style=`{height: '60px'}`).row.full-width.items-center.q-px-sm
  span.text-black k-colls-tabs
</template>

<script>
export default {
  name: 'kCollsTabs',
  props: ['coll', 'scrollLeft'],
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
