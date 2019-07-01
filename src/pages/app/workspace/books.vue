<template lang="pug">
.column.fit
  slot(name="header")
  .col.scroll
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
