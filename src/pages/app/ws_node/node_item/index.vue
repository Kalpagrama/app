<template lang="pug">
div(
  :style=`{
    position: 'relative',
  }`
  ).row.full-width.items-start.content-start
  img(
    :src="node.color" draggable="false"
    :style=`{
      borderRadius: '10px', overflow: 'hidden',
    }`
    ).full-width
  //- edit item
  q-btn(
    round color="green" icon="edit"
    :style=`{position: 'absolute', zIndex: 110, top: 'calc(50% - 20px)', right: '50px', borderRadius: '50%'}`)
  //- add item
  q-btn(
    round color="green" icon="add"
    :style=`{position: 'absolute', zIndex: 100, top: 'calc(50% - 20px)', right: '4px', borderRadius: '50%'}`)
</template>

<script>
export default {
  name: 'wsNode_nodeItem',
  props: ['node', 'item', 'itemIndex'],
  data () {
    return {
    }
  },
  mounted () {
    this.$log('mounted')
  }
}
</script>
