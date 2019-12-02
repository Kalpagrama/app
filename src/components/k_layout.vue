<template lang="pug">
q-layout
</template>

<script>
export default {
  name: 'kLayout',
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
