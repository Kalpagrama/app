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
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
