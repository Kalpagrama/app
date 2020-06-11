<template lang="pug">
.row.fit.justify-center
  div(:style=`{maxWidth: '600px'}`).column.fit
    //- header
    .row.full-width.q-px-sm
      .row.full-width.q-py-md
        span(:style=`{fontSize: '18px'}`).text-white.text-bold Explore
    //- body
    .col.full-width.scroll
</template>

<script>
export default {
  name: 'metaSpheres',
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
