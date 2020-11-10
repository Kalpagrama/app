<template lang="pug">
div(
  :style=`{
    position: 'relative',
  }`
  ).row.fit.items-end.content-end
  div(
    v-if="!isOpened"
    @click="$emit('open')"
    :style=`{position: 'absolute', zIndex: 100,}`).row.fit
  div(
    v-if="item").row.fit.items-end.content-end
    from-node(
      v-if="!item.wsItemType && item.type === 'NODE'"
      :node="item" :isOpened="isOpened")
    from-ws-node(
      v-if="item.wsItemType && item.wsItemType === 'WS_NODE'"
      :node="item" :isOpened="isOpened")
    from-sphere(
      v-if="!item.wsItemType && ['WORD', 'SENTENCE', 'SPHERE'].includes(item.type)"
      :sphere="item" :isOpened="isOpened")
    //- from sphere
    //- from user
    //- from content
    //- from gif, video, image...
    //- from joint...
  .row.full-width
    slot
  //- kalpa-finder(
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
    fromNode: () => import('./from_node.vue'),
    fromWsNode: () => import('./from_ws_node.vue'),
    fromSphere: () => import('./from_sphere.vue')
  },
  props: ['item', 'isOpened'],
  methods: {
    itemFound (item) {
      this.$log('itemFound', item)
    }
  }
}
</script>
