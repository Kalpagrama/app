<template lang="pug">
.column.fit
  //- header
  .row.full-width.q-px-sm
    .row.full-width.q-py-md
      span(:style=`{fontSize: '18px'}`).text-white.text-bold People
  //- body
  .col.full-width.scroll
</template>

<script>
export default {
  name: 'metaPeople',
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
