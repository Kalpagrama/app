<template lang="pug">
.column.fit
  div(style=`height: 60px`).row.full-width
    q-btn(color="primary" @click="$emit('close')") Close
</template>

<script>
export default {
  name: 'findImage',
  data () {
    return {
      source: '',
      sources: ['local', 'google', 'pinterest']
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
