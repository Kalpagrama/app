<style lang="sass">
.feed-item
  &:hover
    background: rgb(50,50,50)
</style>

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
    .row.full-width.justify-start.q-px-sm
      div(:style=`{maxWidth: '700px',}`).row.full-width
        .col
          div(
            :style=`{
              background: 'rgb(35,35,35)',
              borderRadius: '10px', overflow: 'hidden',
            }`
            ).row.fit
            q-input(
              v-model="searchString"
              borderless dense dark color="green"
              placeholder="Поиск"
              :input-style=`{
                paddingLeft: '10px',
              }`
              ).full-width
              template(v-slot:append)
                q-icon(v-if="searchString.length > 0" name="clear" color="grey-4" @click="searchString = ''").q-mr-sm
        q-btn(
          @click="feedCreatorOpened = true"
          round flat color="grey-4" icon="add")
        q-btn(
          round flat color="grey-4" icon="tune")
    kalpa-loader(
      :immediate="true"
      :query="queryFeeds" :limit="1000" v-slot=`{items,next}`)
      .row.full-width.items-start.content-start.q-pt-sm
        feed-all(
          v-if="searchString.length === 0"
          :maxWidth="maxWidth")
        feed-item(
          v-for="(feed,ii) in items" :key="feed.id"
          @click.native="feedClick(feed)"
          :maxWidth="maxWidth"
          :feed="feed")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import feedAll from './feed_all.vue'

export default {
  name: 'pageApp_wsFeeds',
  components: {
    feedAll,
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
