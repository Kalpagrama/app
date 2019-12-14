<style lang="stylus">
</style>
<template lang="pug">
.column.fit.bg-grey-3
  div(:style=`{height: '60px'}`).row.full-width.items-center
    .col.full-height
      .row.fit.items-center
        span.text-bold {{ $t('Spheres') }}
    div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
    q-btn(round flat icon="clear" color="grey" @click="$emit('close')")
  .col.full-width.scroll.kscroll
    .row.full-width.items-start.content-start.q-px-sm
      div(
        v-for="(s,si) in 100" :key="si"
        :style=`{height: '40px', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.bg-white.q-mb-sm
        div(:style=`{height: '40px', width: '40px', overflow: 'hidden', background: $randomColor(si)}`).row
        .col.full-height
          .row.fit.items-center.q-px-sm
            span Sphere {{ si }}
</template>

<script>
export default {
  name: 'wsSpheres',
  data () {
    return {
    }
  },
  mounted () {
    this.$logD('mounted')
  },
  beforeDestroy () {
    this.$logD('beforeDestroy')
  }
}
</script>
