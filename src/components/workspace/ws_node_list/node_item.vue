<style lang="sass" scoped>
.node
  cursor: pointer
  &:hover
    background: rgb(90,90,90)
</style>

<template lang="pug">
div(
  @click="nodeClick()"
  :style=`{
    height: '50px',
    borderRadius: '10px',
    overflow: 'hidden',
  }`
  ).row.full-width.items-center.content-center.q-px-md.b-70.q-mb-xs.node
  span(:style=`{userSelect: 'none'}`).text-white {{node.name}}
</template>

<script>
export default {
  name: 'wsNodeList-nodeItem',
  props: ['node', 'nodeIndex'],
  data () {
    return {
    }
  },
  methods: {
    nodeClick () {
      this.$log('nodeClick')
      this.$emit('edit')
    }
  }
}
</script>
