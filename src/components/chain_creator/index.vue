<template lang="pug">
div(style=`minHeight: 400px`).row.full-width.items-center.justify-center.bg-white
  span chainCreator
</template>

<script>
export default {
  name: 'chainCreator',
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
