<template lang="pug">
.column.fit
  .row.full-width.bg-red.q-pa-sm
</template>

<script>
export default {
  name: 'wsNodeImport',
  data () {
    return {
    }
  },
  moutned () {
    this.$log('moutned')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
