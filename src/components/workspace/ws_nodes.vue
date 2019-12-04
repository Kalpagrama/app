<style lang="stylus">
</style>

<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit
  q-btn(
    push round icon="add" color="accent" size="xl"
    :style=`{position: 'absolute', zIndex: 1000, right: '10px', bottom: '10px'}`)
  div(:style=`{height: '50px'}`).row.full-width.items-center.q-px-sm
    .col.q-px-sm
      span.q-mr-sm Spheres
      span.q-mr-sm Nodes
      span.q-mr-sm Fragments
      span.q-mr-sm Contents
    //- q-btn(round flat icon="list")
    //- q-btn(round flat icon="more_vert")
    q-btn(round flat icon="search")
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
