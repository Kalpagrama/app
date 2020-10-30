<style lang="sass">
.feed-item
  &:hover
    background: rgb(50,50,50)
</style>

<template lang="pug">
q-layout(
  view="hHh Lpr lff")
  q-dialog(
    v-model="feedCreatorOpened"
    transition-show="none"
    transition-hide="none"
    :maximized="$q.screen.width < 800")
    feed-creator(
      @close="feedCreatorOpened = false")
  q-header(reveal)
    .row.full-width.q-pt-sm.q-px-sm.b-30
      .row.full-width.justify-center
        div(
          :style=`{
            maxWidth: $store.state.ui.pageMaxWidth+'px', height: '60px',
            borderRadius: '10px',}`
          ).row.full-width.items-center.content-center.justify-center.b-40.q-px-sm
          q-icon(name="view_week" size="30px" color="white").q-mr-md.q-ml-sm
          .col
            span(:style=`{fontSize: '1.1rem'}`).text-white.text-bold Подборки
          q-btn(round flat color="white" icon="more_vert")
      .row.full-width.justify-center
        div(
          :style=`{
            maxWidth: $store.state.ui.pageMaxWidth+'px', height: '60px',
            borderRadius: '10px',}`
          ).row.full-width.items-center.content-center.justify-start.q-pt-sm
          div(:style=`{maxWidth: '700px',}`).col
            ws-search(
              @searchString="searchString = $event"
              )
          q-btn(
            @click="feedCreatorOpened = true"
            round flat color="grey-4" icon="add").full-height
          q-btn(
            round flat color="grey-4" icon="tune").full-height
  q-page-container
    q-page.row.full-width.justify-center.q-pt-md
      kalpa-loader(
        :immediate="true"
        :query="queryFeeds" :limit="1000" v-slot=`{items,next}`)
        div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width.items-start.content-start.q-pt-sm
          feed-all(
            v-if="searchString.length === 0"
            @click.native="$router.push('/workspace/feed/all')"
            :maxWidth="maxWidth")
          feed-item(
            v-for="(feed,ii) in items" :key="feed.id"
            @click.native="feedClick(feed)"
            :maxWidth="maxWidth"
            :feed="feed")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageApp_wsFeeds',
  components: {
    feedAll: () => import('./feed_all.vue'),
    feedCreator: () => import('./feed_creator.vue'),
    feedItem: () => import('./feed_item.vue')
  },
  data () {
    return {
      searchString: '',
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
      // add name filter
      if (this.searchString.length > 0) {
        let nameRegExp = new RegExp(this.searchString, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
      return res
    }
  },
  methods: {
    async feedClick (feed) {
      this.$log('feedClick', feed)
      this.$router.push(`/workspace/feed/${feed.id}`).catch(e => e)
      // await this.$rxdb.remove(feed.id)
    },
    feedCreate () {
      this.$log('feedCreate')
    },
    feedDelete () {
      this.$log('feedDelete')
    }
  }
}
</script>
