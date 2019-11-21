<template lang="pug">
div(:style=`{height: height+'px'}`).column.full-width
  div(:style=`{height: '60px'}`).row.full-width
  .col.bg
    .row.fit
      div(:style=`{width: '200px'}`).column.full-height.bg-grey-2
        div(:style=`{height: '60px'}`).row.full-width
        .col.scroll
          span menu tags
      .col.bg-white
        span research creator
</template>

<script>
export default {
  name: 'researchCretor',
  props: ['width', 'height'],
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
