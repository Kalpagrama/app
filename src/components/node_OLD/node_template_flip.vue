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
    this.$logD('mounted')
  },
  beforeDestroy () {
    this.$logD('beforeDestroy')
  }
}
</script>
