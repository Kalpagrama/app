<template lang="pug">
div(
  :style=`{
    minHeight: '60px',
    background: 'rgb(35,35,35)',
    borderRadius: '10px',
  }`
  ).row.full-width.items-center.content-center.q-mb-sm
  img(
    v-if="!thumbUrlErrored"
    draggable="false"
    :src="bookmark.thumbUrl"
    :style=`{
      height: '50px',
      borderRadius: '10px',
    }`
    @error="thumbUrlErrorHandle").b-50
  div(
    v-if="thumbUrlErrored"
    :style=`{
      height: '50px',
      width: '50px',
    }`
    ).row
  .col
    .row.fit.items-center.content-center.justify-end.q-pa-sm
      //- span.text-white {{ b.name }}
      small.text-grey-8 {{ $date(bookmark.createdAt) }}
      q-btn(round flat dense color="grey-8" icon="more_vert").q-ml-sm
  //- details
  div(
    :style=`{
      minHeight: '60px',
    }`
    ).row.full-width.items-center.content-center.q-pa-sm
    span.text-white {{ bookmark.name }}
    .row.full-width
      span.text-grey-8 {{ bookmark.type }}
  //- small.text-white {{ bookmark }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageBookmarks_itemContent',
  props: ['bookmark'],
  data () {
    return {
      thumbUrlErrored: false
    }
  },
  methods: {
    async thumbUrlErrorHandle (e) {
      this.$log('thumbUrlErrorHandle', e)
      // update this bookmark thumbUrl by its content...
      let contentKalpa = await this.$rxdb.get(RxCollectionEnum.OBJ, this.bookmark.oid)
      this.bookmark.thumbUrl = contentKalpa.thumbUrl
    }
  }
}
</script>
