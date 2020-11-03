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
      ).row.fit.q-px-sm
      div(
        :style=`{
          position: 'relative',
          borderRadius: '10px', overflow: 'hidden'
        }`
        ).column.fit.b-40.cursor-pointer.feed-item
        slot(name="tint" :item="{id: 'all', name: 'All bookmarks'}")
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
                //- borderLeft: '1px solid red'
              }`
              ).col-4.full-height
              img(
                v-if="bookmarks[ii]"
                draggable="false"
                :src="bookmarks[ii].thumbUrl"
                :style=`{
                  borderLeft: ii > 0 ? '2px solid rgb(90,90,90)' : 'none',
                  //- borderBottom: ii > 0 ? '2px solid rgb(90,90,90)' : 'none',
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
