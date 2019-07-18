<template lang="pug">
.row.full-width
  span pageApp__Content
</template>

<script>
export default {
  name: 'pageApp__Content',
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
