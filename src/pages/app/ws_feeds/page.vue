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
            maxWidth: $store.state.ui.pageMaxWidth+'px',
            borderRadius: '10px',}`
          ).row.full-width.items-center.content-center.justify-start
          div(:style=`{maxWidth: '700px',}`).col
            ws-search(
              @searchString="searchString = $event"
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
      :style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`
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
          rxCollectionEnum: RxCollectionEnum.WS_COLLECTION,
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
      if (this.$q.screen.width < this.$store.state.ui.pageMaxWidth) return this.$q.screen.width / 2
      else return this.$store.state.ui.pageMaxWidth / 4
    },
  },
}
</script>
