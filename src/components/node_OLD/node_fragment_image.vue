<template lang="pug">
img()
</template>

<script>
export default {
  name: 'nodeFragmentImage',
  props: ['zIndex', 'url', 'visible'],
  data () {
    return {
    }
  },
  mounted () {
    // this.$logD('mounted')
  },
  beforeDestroy () {
    // this.$logD('beforeDestroy')
  }
}
</script>
