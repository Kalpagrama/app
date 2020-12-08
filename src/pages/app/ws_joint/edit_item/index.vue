<template lang="pug">
div(
  :style=`{
    position: 'relative',
  }`
  ).row.full-width.items-end.content-end
  div(
    v-if="item"
    :style=`{
      position: 'relative',
    }`).row.fit.items-end.content-end
    div(
      v-if="!isOpened"
      @click="$emit('open')"
      :style=`{position: 'absolute', zIndex: 100,}`).row.fit
    from-node(
      v-if="!item.wsItemType && item.type === 'NODE'"
      :node="item" :isOpened="isOpened")
    from-ws-node(
      v-if="item.wsItemType && item.wsItemType === 'WS_NODE'"
      :node="item" :isOpened="isOpened")
    from-sphere(
      v-if="!item.wsItemType && ['WORD', 'SENTENCE', 'SPHERE'].includes(item.type)"
      :sphere="item" :isOpened="isOpened")
    from-user(
      v-if="!item.wsItemType && item.type === 'USER'"
      :user="item" :isOpened="isOpened")
    div(
      v-if="item.wsItemType && item.wsItemType === 'WS_BOOKMARK' && item.type === 'IMAGE'"
      :style=`{
        borderRadius: '10px',
        background: 'rgb(35,35,35)',
      }`
      ).column.fit
      .col.full-width
        img(
          :src="item.thumbUrl"
          :style=`{
            borderRadius: '10px',
            objectFit: 'contain',
          }`
          ).fit
      div(:style=`{height: '60px'}`).row.full-width
    //- from sphere
    //- from user
    //- from content
    //- from gif, video, image...
    //- from joint...
  //- footer slot
  .row.full-width
    slot
</template>

<script>
export default {
  name: 'wsJoint_editItem',
  components: {
    fromNode: () => import('./from_node.vue'),
    fromWsNode: () => import('./from_ws_node.vue'),
    fromSphere: () => import('./from_sphere.vue'),
    fromUser: () => import('./from_user.vue')
  },
  props: ['item', 'isOpened'],
  methods: {
    itemFound (item) {
      this.$log('itemFound', item)
    }
  }
}
</script>
