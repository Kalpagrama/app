<style lang="stylus">
</style>

<template lang="pug">
.column.fit
  //- div().row.full-width
  .col.full-width.scroll.kscroll
    div().row.full-width.items-start.content-start.q-pt-sm.q-px-sm
      div(
        v-for="(n, ni) in 100"
        :style=`{height: '100px', borderRadius: '10px'}`
        ).row.full-width.items-center.bg-white.q-px-md.q-mb-sm
        span node {{ n }}
  div(:style=`{height: '60px'}`).row.full-width
    div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
</template>

<script>
export default {
  name: 'wsNodes',
  data () {
    return {
    }
  },
  mounted () {
    this.$log('mounted')
  }
}
</script>
