<template lang="pug">
.column.fit
  slot(name="header")
  .col.scroll
    div(style=`height: 60px`).row.full-width.items-center.justify-center
      span No saved books
</template>

<script>
export default {
  name: 'pageApp__Workspace__Books',
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
