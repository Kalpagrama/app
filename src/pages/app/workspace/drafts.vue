<template lang="pug">
.column.fit
  span drafts
</template>

<script>
export default {
  name: 'pageApp__Workspace__Drafts',
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
