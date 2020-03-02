<template lang="pug">
div(
  @click="contentClick()"
  :class=`{'bg-grey-8': node.oid !== oid, 'bg-white': node.oid === oid}`
  :style=`{position: 'relative', minHeight: '40px', borderRadius: '10px', overflow: 'hidden'}`
  ).row.full-width.items-center.cursor-pointer.q-mb-sm
  span(
    :class=`{
      'text-white': node.oid !== oid,
      'text-green': node.oid === oid}`
  ).q-ma-sm.cursor-pointer {{ nodeFull ? nodeFull.compositions[0].layers[0].content.name : node.name }}
  div(
    v-if="showFull"
    :style=`{position: 'relative', height: '300px'}`
    ).row.full-width.bg-red
    composition(ctx="workspace" :value="nodeFull.compositions[0]" :active="true" :visible="true" :mini="false")
</template>

<script>
export default {
  name: 'wsContent',
  props: ['oid', 'node'],
  data () {
    return {
      nodeFull: null,
      showFull: false
    }
  },
  methods: {
    contentClick () {
      this.$log('contentClick')
      // this.showFull = !this.showFull
      this.$emit('contentClick', this.nodeFull)
    }
  },
  async mounted () {
    this.nodeFull = await this.$store.dispatch('workspace/get', {oid: this.node.oid})
  }
}
</script>
