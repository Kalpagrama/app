<template lang="pug">
.column.fit
  span nc_publish
</template>

<script>
export default {
  name: 'ncPublish',
  data () {
    return {
    }
  },
  mounted () {
    this.$logD('mounted')
  },
  beforeDestroy () {
    this.$logD('beforeDestroy')
  }
}
</script>
