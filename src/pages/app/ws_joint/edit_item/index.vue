<template lang="pug">
div(
  :style=`{
  }`
  ).row.full-width
  div(
    v-if="item").row.full-width
    from-ws-node(
      v-if="item.wsItemType === 'WS_NODE'"
      :node="item")
    //- from sphere
    //- from user
    //- from node
    //- from content
    //- from gif, video, image...
    //- from joint...
  kalpa-finder(
    v-else
    @item="itemFound")
  //- div(
    v-if="!item"
    :style=`{
      minHeight: '500px',
    }`).row.full-width.items-start.content-start
    span.text-white Find item
    .row.full-width
      span.text-white world workspace
</template>

<script>
export default {
  name: 'wsJoint_editItem',
  components: {
    fromWsNode: () => import('./from_ws_node.vue'),
  },
  props: ['item'],
  methods: {
    itemFound (item) {
      this.$log('itemFound', item)
    }
  }
}
</script>
