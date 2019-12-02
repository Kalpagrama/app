<template lang="pug">
.column.fit
  span image_editor
</template>

<script>
export default {
  name: 'imageEditor',
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
