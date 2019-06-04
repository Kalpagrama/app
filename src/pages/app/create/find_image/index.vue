<template lang="pug">
.column.fit.bg-white
  div(style=`height: 60px`).row.full-width
    span header
    q-btn(@click="$emit('close')")
  .col.scroll
    div(style=`height: 50px` v-for="n in 100" :key="n").row.full-width.bg-white
</template>

<script>
export default {
  name: 'findImage',
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
