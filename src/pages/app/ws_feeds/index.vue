<template lang="pug">
.row.full-width.justify-center
  q-dialog(
    v-model="feedCreatorOpened"
    transition-show="none"
    transition-hide="none"
    :maximized="$q.screen.width < 800")
    feed-creator(
      @close="feedCreatorOpened = false"
    )
  div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width
    .row.full-width.q-pa-sm
      q-btn(
        @click="feedCreatorOpened = true"
        round flat color="white" icon="add")
      .col
      q-btn(
        round flat color="grey-7" icon="tune")
    kalpa-loader(
      :immediate="true"
      :query="queryFeeds" :limit="1000" v-slot=`{items,next}`)
      .row.full-width.items-start.content-start
        div(
          v-for="(feed,ii) in items" :key="feed.id"
          :style=`{
            maxWidth: maxWidth+'px',
          }`
          ).row.full-width.items-start.content-start
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
                @click="feedClick(feed)"
                :style=`{
                  borderRadius: '10px', overflow: 'hidden'
                }`
                ).column.fit.b-40.cursor-pointer
                //- items previews, first 3 items...
                div(
                  :style=`{
                    borderRadius: '10px', overflow: 'hidden'
                  }`
                  ).col.full-width
                  .row.fit.br
                    .col-8.bg-red
                      //- first item.thumbUrl...
                      //- img(
                        :src=""
                        :style=`{
                          objectFit: 'cover',
                        }`)
                    .col.bg
                      .column.fit
                        .col.full-width.br
                        .col.full-width.bg
                //- footer: feed.name
                div(
                  :style=`{
                    height: '60px',
                  }`).row.full-width.items-center.content-center.q-px-sm
                  span.text-bold.text-white {{ feed.name }}
                  .row.full-width
                    small.text-grey-6 внутри {{ feed.items.length }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageApp_wsFeeds',
  components: {
    feedCreator: () => import('./feed_creator.vue')
  },
  data () {
    return {
      feedCreatorOpened: false,
    }
  },
  computed: {
    maxWidth () {
      if (this.$q.screen.width < this.$store.state.ui.pageMaxWidth) return this.$q.screen.width / 2
      else return this.$store.state.ui.pageMaxWidth / 4
    },
    queryFeeds () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_FEED,
        }
      }
      return res
    }
  },
  methods: {
    async feedClick (feed) {
      this.$log('feedClick', feed)
      await this.$rxdb.remove(feed.id)
    }
  }
}
</script>
