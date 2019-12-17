<style lang="stylus">
</style>
<template lang="pug">
.column.fit.bg-grey-3
  div(:style=`{height: '60px'}`).row.full-width.items-center
    .col.full-height
      .row.fit.items-center.q-px-sm
        span.text-bold {{ $t('Spheres') }}
    div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
    q-btn(round flat icon="clear" color="grey" @click="$emit('close')")
  .col.full-width.scroll.kscroll
    .row.full-width.items-start.content-start.q-px-sm
      div(
        v-for="(s,si) in spheres" :key="si"
        :style=`{height: '40px', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.bg-white.q-mb-sm
        div(:style=`{height: '40px', width: '40px', borderRadius: '10px', overflow: 'hidden', background: $randomColor(si)}`).row
        .col.full-height
          .row.fit.items-center.q-px-sm
            span {{ s.name }}
</template>

<script>
export default {
  name: 'wsSpheres',
  data () {
    return {
    }
  },
  computed: {
    spheres () {
      return this.$store.state.workspace.workspace.nodes.reduce((acc, val) => {
        val.spheres.map(s => {
          acc.push(s)
        })
        return acc
      }, [])
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
