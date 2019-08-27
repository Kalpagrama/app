<template lang="pug">
div(style=`minHeight: 400px`).row.full-width.items-center.justify-center.q-pa-md
  span user settings
</template>

<script>
export default {
  name: 'userSettings',
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
