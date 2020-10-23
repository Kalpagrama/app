<template lang="pug">
div(
  :style=`{
    height: '200px',
    maxWidth: maxWidth+'px',
  }`
  ).row.full-width
  div(
    :style=`{
      position: 'relative',
      height: 0, paddingBottom: '100%',
    }`
    ).row.full-width
    div(
      :style=`{
        position: 'absolute', zIndex: 100,
      }`
      ).row.fit.q-pa-sm
      div(
        :style=`{
          borderRadius: '10px', overflow: 'hidden'
        }`
        ).column.fit.b-40.cursor-pointer.feed-item
        div(
          :style=`{
            borderRadius: '10px', overflow: 'hidden',
            background: 'rgb(45,45,45)',
          }`
        ).col.full-width
        div(
          :style=`{
            height: '60px'
          }`
          ).row.full-width.items-center.content-center.q-px-sm
          span.text-bold.text-white Все закладки
          .row.full-width
            small(
              :style=`{
                opacity: 1
              }`
              ).text-grey-6 {{ bookmarks.length }} внутри
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'wsFeeds_feedAll',
  props: ['maxWidth'],
  data () {
    return {
      bookmarks: [],
    }
  },
  async mounted () {
    this.$log('mounted')
    this.bookmarks = await this.$rxdb.find({
      // limit: 10,
      selector: {
        rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK,
        // oid: this.contentKalpa.oid
      },
    })
    this.$log('bookmarks', this.bookmarks)
  }
}
</script>
