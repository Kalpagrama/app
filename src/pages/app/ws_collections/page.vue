<template lang="pug">
q-page(
  :style=`{
    paddingTop: 50+paddingTop+'px',
  }`
  ).row.full-width.justify-center
  q-page-sticky(
    expand position="top"
    :style=`{zIndex: 1000,}`).b-30
    .row.full-width.q-px-sm.b-30
      slot(name="top")
      .row.full-width.justify-center
        div(
          :style=`{
            maxWidth: $store.state.ui.pageWidth+'px',
            borderRadius: '10px',}`
          ).row.full-width.items-center.content-center.justify-start
          div(:style=`{maxWidth: '700px',}`).col
            ws-search(
              @searchString="searchString = $event"
              @contentKalpa="contentKalpaFound"
              )
          q-btn(
            @click="feedCreatorOpened = true"
            round flat color="grey-4" icon="add").full-height
          q-btn(
            round flat color="grey-4" icon="tune").full-height
  kalpa-loader(
    :immediate="true"
    :query="queryFeeds" :limit="1000" v-slot=`{items,next}`)
    div(
      :style=`{maxWidth: $store.state.ui.pageWidth+'px'}`
      ).row.full-width.items-start.content-start.q-pt-sm
      feed-all(
        v-if="searchString.length === 0"
        :maxWidth="maxWidth")
        template(v-slot:tint=`{item}`)
          slot(name="tint" :item="item")
      feed-item(
        v-for="(feed,ii) in items" :key="feed.id"
        :maxWidth="maxWidth"
        :feed="feed")
        template(v-slot:tint=`{item}`)
          slot(name="tint" :item="item")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { UserApi } from 'src/api/user'

export default {
  name: 'wsFeeds_list',
  props: {
    paddingTop: {
      type: Number,
      default: 0
    }
  },
  components: {
    feedAll: () => import('./feed_all.vue'),
    feedItem: () => import('./feed_item.vue')
  },
  data () {
    return {
      searchString: ''
    }
  },
  computed: {
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
    },
    maxWidth () {
      if (this.$q.screen.width < this.$store.state.ui.pageWidth) return this.$q.screen.width / 2
      else return this.$store.state.ui.pageWidth / 4
    },
  },
  methods: {
    async contentKalpaFound (contentKalpa) {
      this.$log('contentKalpaFound', contentKalpa)
      // try to find bookmark with this content
      let [bookmark] = await this.$rxdb.find({selector: {rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK, oid: contentKalpa.oid}})
      if (bookmark) {
        // resurrect from the dead
        if (bookmark.deletedAt > 0) {
          this.$delete(bookmark, 'deletedAt')
          this.$log('bookmark resurrected')
        }
      }
      else {
        let bookmarkInput = {
          oid: contentKalpa.oid,
          type: contentKalpa.type,
          name: contentKalpa.name,
          thumbUrl: contentKalpa.thumbUrl,
          wsItemType: 'WS_BOOKMARK',
          spheres: [],
          feeds: [],
        }
        bookmark = await this.$rxdb.set(RxCollectionEnum.WS_BOOKMARK, bookmarkInput)
      }
      // if (this.id !== 'all') {
      //   // connect bookmark and feed
      //   if (!bookmark.feeds.includes(this.feed.id)) bookmark.feeds.push(this.feed.id)
      //   if (!this.feed.items.includes(bookmark.id)) this.feed.items.push(bookmark.id)
      // }
      // bookmark subscribe
      if (!await UserApi.isSubscribed(contentKalpa.oid)) await UserApi.subscribe(contentKalpa.oid)
      // open content ?
      await this.$wait(500)
      this.$router.push('/content/' + contentKalpa.oid)
    }
  }
}
</script>
