<template lang="pug">
div(
  :style=`{
    maxWidth: maxWidth+'px',
  }`
  ).row.full-width.items-start.content-start.q-mb-md
  div(
    :style=`{
      position: 'relative',
      height: 0, paddingBottom: '100%',
    }`
    ).row.full-width.items-start.content-start
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
        slot(name="tint" :item="feed")
        //- items previews, first 3 items...
        div(
          :style=`{
            borderRadius: '10px', overflow: 'hidden',
            background: 'rgb(45,45,45)',
          }`
          ).col.full-width
          .row.fit
            div(:style=`{borderRight: '1px solid rgb(70,70,70)'}`).col-8
              img(
                v-if="items[0]"
                :src="items[0].thumbUrl"
                :style=`{
                  objectFit: 'cover',
                }`).fit
            .col
              .column.fit
                div(:style=`{borderBottom: '1px solid rgb(70,70,70)'}`).col.full-width
                  img(
                    v-if="items[1]"
                    :src="items[1].thumbUrl"
                    :style=`{
                      objectFit: 'cover',
                    }`).fit
                .col.full-width
                  img(
                    v-if="items[2]"
                    :src="items[2].thumbUrl"
                    :style=`{
                      objectFit: 'cover',
                    }`).fit
        //- footer: feed.name
        div(
          :style=`{
            height: '60px',
          }`).row.full-width.items-center.content-center.q-px-sm
          span.text-bold.text-white {{ feed.name }}
          .row.full-width
            small(
              :style=`{
                opacity: feed.items.length > 0 ? 1 : 0,
              }`
              ).text-grey-6 {{ feed.items.length }} внутри
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'feedItem',
  props: ['feed', 'maxWidth'],
  data () {
    return {
      items: []
    }
  },
  async mounted () {
    this.items = await this.$rxdb.find({
      selector: {
        rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK,
        feeds: {$elemMatch: {$eq: this.feed.id}}
      },
      sort: [{updatedAt: 'desc'}],
      limit: 3
    })
  }
}
</script>
