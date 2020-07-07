<template lang="pug">
div(
  :style=`{
    position: 'relative',
    height: '400px', borderRadius: '10px', overflow: 'hidden',
  }`).row.full-width
  //- set first item
  q-btn(
    v-if="node.items.length === 0"
    @click="$emit('itemFind')"
    flat color="green" icon="add"
    size="xl"
    :style=`{
      position: 'absolute', zIndex: 900,
    }`
    ).fit
  //- set second item
  q-btn(
    v-if="node.items.length === 1"
    @click="$emit('itemFind')"
    flat color="green" icon="add"
    :style=`{
      position: 'absolute', zIndex: 999, right: 0, width: '25%',
      background: 'rgba(0,0,0,0.5)',
    }`).full-height
  //- edit items
  list-horizontal(
    v-if="node.items.length > 0"
    :items="node.items")
    template(v-slot:item=`{item,itemIndex,itemActive}`)
      ws-composition-editor(
        :sid="`wce-${itemIndex}`"
        :value="item"
        :options=`{
          isPreview: true,
          mode: 'player',
          mini: !itemActive,
          active: itemActive,
        }`
        :style=`{
          height: '100%',
        }`)
</template>

<script>
export default {
  name: 'editItemsCompare',
  props: ['node'],
  data () {
    return {
    }
  },
  methods: {
  }
}
</script>
