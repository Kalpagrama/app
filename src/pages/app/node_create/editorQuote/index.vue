<template lang="pug">
.column.fit.bg-white
  div(style=`height: 60px; borderBottom: 1px solid #eee`).row.full-width.items-center.justify-between.q-px-sm
    span Quote editor
    q-btn(@click="$emit('close')" flat color="primary" dense no-caps) Cancel
  .col
</template>

<script>
export default {
  name: 'editorQuote',
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
