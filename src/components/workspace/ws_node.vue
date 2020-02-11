<template lang="pug">
div(
  @click="$emit('nodeClick', nodeFull)"
  :class=`{'bg-grey-8': node.oid !== oid, 'bg-white': node.oid === oid}`
  :style=`{height: '40px', borderRadius: '10px'}`
  ).row.full-width.items-center.cursor-pointer.q-px-sm.q-mb-sm
  // small.text-red.q-mr-sm.text-bold revision: {{ nodeFull ? nodeFull.revision : 1 }}
  small.text-red.q-mr-sm.text-bold indx: {{ nodeFull ? nodeFull.indx_ : 1 }}
  span(
    :class=`{
      'text-white': node.oid !== oid,
      'text-green': node.oid === oid,
      'text-bold': node.oid === oid}`
    ) {{ nodeFull ? nodeFull.name : node.name }}
</template>

<script>
export default {
  name: 'wsNode',
  props: ['oid', 'node'],
  data () {
    return {
      nodeFull: null
    }
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
    this.$set(this, 'nodeFull', await this.$store.dispatch('workspace/get', {oid: this.node.oid}))
  }
}
</script>
