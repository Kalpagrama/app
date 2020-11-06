<template lang="pug">
.row.full-width.items-end.content-end
  //- node, ws_node, ws_bookmark with node...
  div(v-if="item.item.type === 'NODE'").row.full-width.justify-center
    div(
      :style=`{
        borderRadius: '10px', overflow: 'hidden'
      }`
      ).row.full-width.items-start.end-end.b-40
      img(
        :src="item.item.items[0].thumbUrl"
        :style=`{
          borderRadius: '10px', overflow: 'hidden'
        }`
        ).full-width
      .row.full-width.justify-center.q-pa-sm
        span.text-white {{ item.item.name }}
  div(v-if="item.item.wsItemType === 'WS_NODE'").row.full-width.justify-center
    div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width.items-end.content-end
      img(
        :src="item.item.items[0].thumbUrl"
        :style=`{
          borderRadius: '10px', overflow: 'hidden'
        }`
        ).full-width
      .row.full-width.justify-center
        span.text-white {{item.name}}
  //- ws_bookmark
  div(v-if="item.item.wsItemType === 'WS_BOOKMARK'").row.full-width.justify-center
    div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width.items-end.content-end
      img(
        :src="item.item.thumbUrl"
        :style=`{
          borderRadius: '10px', overflow: 'hidden'
        }`
        ).full-width
  //- image, gif, meme, content image
  div(v-if="item.item.type === 'IMAGE'").row.full-width.justify-center
    div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width.items-end.content-end
      img(
        :src="item.item.thumbUrl"
        :style=`{
          borderRadius: '10px', overflow: 'hidden'
        }`
        ).full-width
</template>

<script>
export default {
  name: 'wsJoint_jointItem',
  props: ['joint', 'item'],
  data () {
    return {
    }
  }
}
</script>
