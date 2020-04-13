<template lang="pug">
div(
  @click="nodeClick()"
  :class=`{'bg-grey-8': node.oid !== oid, 'bg-white': node.oid === oid}`
  :style=`{height: '40px', borderRadius: '10px'}`
  ).row.full-width.items-center.cursor-pointer.q-px-sm.q-mb-sm
  span(
    :class=`{
      'text-white': node.oid !== oid,
      'text-green': node.oid === oid}`
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
  methods: {
    async nodeClick () {
      this.$log('nodeClick', this.node)
      let nodeFull = await this.$store.dispatch('objects/get', {oid: this.node.oid})
      this.$log('nodeFull', nodeFull)
      this.$emit('nodeClick', nodeFull)
    }
  },
  async mounted () {
    // this.$log('mounted')
    // this.nodeFull = await this.$store.dispatch('workspace/get', {oid: this.node.oid})
  }
}
</script>
