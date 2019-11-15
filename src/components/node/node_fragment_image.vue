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
    // this.$log('mounted')
  },
  beforeDestroy () {
    // this.$log('beforeDestroy')
  }
}
</script>
