<template lang="pug">
div(style=`minHeight: 400px`).row.full-width.justify-center.items-center
  span user workspace
</template>

<script>
export default {
  name: 'userWorkspace',
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
