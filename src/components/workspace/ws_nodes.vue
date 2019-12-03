<style lang="stylus">
</style>

<template lang="pug">
.column.fit
  div(:style=`{height: '50px'}`).row.full-width.items-center.q-px-sm
    q-btn(round flat icon="search")
    .col
    //- q-btn(round flat icon="list")
    q-btn(round flat icon="more_vert")
  .col.full-width.scroll.kscroll
    div().row.full-width.items-start.content-start.q-pt-sm.q-px-sm
      div(
        v-for="(n, ni) in 100" @click="nodeClick(n, ni)"
        :style=`{height: '100px', borderRadius: '10px'}`
        ).row.full-width.items-center.bg-white.q-px-md.q-mb-sm
        span node {{ n }}
</template>

<script>
export default {
  name: 'wsNodes',
  props: ['nodeClickOverride'],
  data () {
    return {
    }
  },
  methods: {
    nodeClick (n, ni) {
      this.$logD('nodeClick', n, ni)
      if (this.nodeClickOverride) {
        this.$emit('nodeClick', [n, ni])
      } else {
        // open node click for editor?
      }
    }
  },
  mounted () {
    this.$logD('mounted')
  }
}
</script>
