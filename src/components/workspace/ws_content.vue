<template lang="pug">
div(
  @click="$emit('contentClick', nodeFull)"
  :class=`{'bg-grey-8': node.oid !== oid, 'bg-white': node.oid === oid}`
  :style=`{minHeight: '40px', borderRadius: '10px', overflow: 'hidden'}`
  ).row.full-width.items-center.cursor-pointer.q-mb-sm
  span(
    :class=`{
      'text-white': node.oid !== oid,
      'text-green': node.oid === oid,
      'text-bold': node.oid === oid}`
  ).q-ma-sm.cursor-pointer {{ nodeFull ? nodeFull.compositions[0].layers[0].content.name : node.name }}
</template>

<script>
export default {
  name: 'wsContent',
  props: ['oid', 'node'],
  data () {
    return {
      nodeFull: null
    }
  },
  async mounted () {
    // this.$log('mounted')
    this.nodeFull = await this.$store.dispatch('workspace/get', {oid: this.node.oid})
  }
}
</script>
