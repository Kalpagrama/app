<template lang="pug">
.column.fit
  div().row.full-with.q-pa-md
  .col.full-width.scroll
</template>

<script>
export default {
  name: 'editPreview',
  props: ['node'],
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
