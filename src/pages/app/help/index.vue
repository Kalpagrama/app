<template lang="pug">
.row.full-width.q-px-md
  h6.text-bold.text-green.q-my-md Help
</template>

<script>
export default {
  name: 'pageAddHelp',
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
