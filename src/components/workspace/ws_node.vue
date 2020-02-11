<template lang="pug">
div(
  @click="$emit('nodeClick', nodeFull)"
  :class=`{'bg-grey-8': node.oid !== oid, 'bg-white': node.oid === oid}`
  :style=`{height: '40px', borderRadius: '10px'}`
  ).row.full-width.items-center.content-center.cursor-pointer.q-px-sm.q-mb-sm
  //- small.text-red wsR: {{ $store.state.workspace.revision }}
  small.text-green.q-mr-sm.text-bold R:{{ nodeFull ? nodeFull.revision : 1 }}
  span(
    v-if="nodeFull"
    :class=`{
      'text-white': node.oid !== oid,
      'text-green': node.oid === oid,
      'text-bold': node.oid === oid}`
    ) {{ nodeFull.name }}
</template>

<script>
export default {
  name: 'wsNode',
  props: ['oid', 'node'],
  data () {
    return {
      count: 1,
      nodeFull: null
    }
  },
  computed: {
    // nodeFull () {
    //   return this.$store.state.cache.cachedItems[`wsItem:${this.node.oid}`]
    // }
  },
  watch: {
    nodeFull: {
      deep: true,
      handler (to, from) {
        this.$log('nodeFull CHANGED', to)
      }
    }
  },
  async mounted () {
    this.$log('mounted')
    this.nodeFull = await this.$store.dispatch('workspace/get', {oid: this.node.oid})
    // this.$set(this, 'nodeFull', await this.$store.dispatch('workspace/get', {oid: this.node.oid}))
  }
}
</script>
