<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-header(reveal)
  q-page-container
    q-page
</template>

<script>
export default {
  name: 'wsTrash',
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
