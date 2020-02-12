<template lang="pug">
div(
  @click="$emit('nodeClick', nodeFull)"
  :class=`{}`
  :style=`{height: '40px', borderRadius: '10px', overflow: 'hidden'}`
  ).row.full-width.items-center.content-center.q-pa-sm.bg-grey-8
  span.text-white 
</template>

<script>
export default {
  name: 'wsNode',
  props: ['index', 'node', 'oid'],
  data () {
    return {
      nodeFull: null
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
