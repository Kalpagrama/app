<template lang="pug">
.row.full-width
  span nodeTemplateFlip
  q-icon(name="compare")
</template>

<script>
export default {
  name: 'nodeTemplateFlip',
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
