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
                    borderRadius: '10px', overflow: 'hidden',
                    background: 'rgb(45,45,45)',
                  }`
                  ).col.full-width
                  .row.fit
                    div(:style=`{borderRight: '1px solid rgb(70,70,70)'}`).col-8
                      img(
                        v-if="feed.items[0]"
                        :src="feed.items[0].thumbUrl"
                        :style=`{
                          objectFit: 'cover',
                        }`).fit
                    .col
                      .column.fit
                        div(:style=`{borderBottom: '1px solid rgb(70,70,70)'}`).col.full-width
                          img(
                            v-if="feed.items[1]"
                            :src="feed.items[1].thumbUrl"
                            :style=`{
                              objectFit: 'cover',
                            }`).fit
                        .col.full-width
                          img(
                            v-if="feed.items[2]"
                            :src="feed.items[2].thumbUrl"
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
                    small.text-grey-6 {{ feed.items.length }} внутри
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
      this.$router.push(`/workspace/feed/${feed.id}`).catch(e => e)
      // await this.$rxdb.remove(feed.id)
    }
  }
}
</script>
