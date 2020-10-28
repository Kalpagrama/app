<template lang="pug">
div(
  @click="$router.push('/workspace/feed/all')"
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
      ).row.fit.q-px-sm
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
          .row.fit
            div(
              v-for="(i,ii) in 3" :key="ii"
              :style=`{
                position: 'relative',
              }`
              ).col-4.full-height
              img(
                v-if="bookmarks[ii]"
                draggable="false"
                :src="bookmarks[ii].thumbUrl"
                :style=`{
                  borderRadius: '10px 0 0 10px', overflow: 'hidden',
                  objectFit: 'cover',
                  marginLeft: ii > 0 ? '-10px' : '0px',
                  minWidth: ii > 0 ? 'calc(100% + 10px)' : '100%',
                }`).fit.b-40
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
      selector: {
        rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK,
      },
      sort: [{updatedAt: 'desc'}]
    })
  }
}
</script>
