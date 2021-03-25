<template lang="pug">
.row.full-width.items-start.content-start
  //- node
  type-node(
    v-if="item.type === 'NODE'"
    :item="item")
  //- content
  div(
    v-else-if="['VIDEO', 'IMAGE', 'BOOK'].includes(item.type)"
    ).row.full-width.items-start.content-start
    div(
      :style=`{
        background: 'rgb(35,35,35)',
        borderRadius: '10px',
      }`
      ).row.full-width.items-start.content-start
      img(
        :src="url"
        :style=`{
          borderRadius: '10px',
        }`
        ).full-width
      .row.full-width.items-center.content-center.no-wrap.q-pa-sm
        q-icon(name="select_all" color="white" size="36px").q-mr-sm
        span(:style=`{lineHeight: 1.2}`).text-white {{ item.name }}
  //- composition
  div(
    v-else-if="item.__typename === 'Composition'"
    ).row.full-width.items-start.content-start
    type-video(
      v-if="item.outputType === 'VIDEO'"
      :item="item")
    type-book(
      v-if="item.outputType === 'BOOK'"
      :item="item")
    div(
      v-else
      ).row.full-width.items-start.content-start
      img(
        draggable="false"
        :src="item.thumbUrl"
        :style=`{
          borderRadius: '10px',
        }`
        ).full-width
      .row.full-width
        small.text-white {{ item }}
  //- else
  div(
    v-else
    :style=`{
      minHeight: '100px',
    }`
    ).row.full-width.items-start.content-start
    img(
      draggable="false"
      :src="item.thumbUrl"
      :style=`{
        borderRadius: '10px',
      }`
      ).full-width
    //- small.text-white {{ item }}
</template>

<script>
import typeNode from './type_node.vue'
import typeVideo from './type_video.vue'
import typeBook from './type_book.vue'
import assert from 'assert'
import { ContentApi } from 'src/api/content'

export default {
  name: 'itemPreview',
  components: {
    typeNode,
    typeVideo,
    typeBook,
  },
  props: ['item'],
  data () {
    return {
    }
  },
  computed: {
    url () { return ContentApi.urlSelect(this.composition) }
  },
  methods: {
  }
}
</script>
