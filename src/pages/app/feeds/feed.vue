<template lang="pug">
.row.full-width.justify-center
  div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width.items-start.content-start.q-pt-sm
    //- v-if="feed && feed.items.length > 0"
    kalpa-loader(
      :immediate="true"
      :query="queryFeedItems" :limit="20" v-slot=`{items,next}`)
      list-middle(:items="items" :itemStyles=`{marginBottom: '50px',}`).items-start
        q-infinite-scroll(@load="next" :offset="$q.screen.height")
        template(v-slot:item=`{item,itemIndex,isActive,isVisible,width}`)
          //- .row.full-width.bg-blue.q-mb-sm
            small.text-white {{ item }}
          feed-item(
            v-if="item.subject"
            :item="item" :isActive="isActive" :isVisible="isVisible" :width="width")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import feedItem from './feed_item.vue'

export default {
  name: 'pageApp_feeds_feed',
  props: ['feed', 'feeds', 'subscriptions'],
  components: {feedItem},
  data () {
    return {
      // feed: null,
    }
  },
  computed: {
    feedSubscriptions () {
      if (this.feed) {
        return this.feed.items.reduce((acc, val) => {
          if (val.oid) {
            acc.push(val.oid)
          }
          return acc
        }, [])
      }
      else {
        return []
      }
    },
    queryFeedItems () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_FEED,
          oidSphere: this.$store.getters.currentUser().oid,
          // subscription: {$in: this.feedSubscriptions}
        }
      }
      // add subscription array if not empty
      if (this.feedSubscriptions.length > 0) {
        res.selector.subscription = {$in: this.feedSubscriptions}
      }
      return res
    }
  },
  watch: {
    // '$route.params.id': {
    //   immediate: true,
    //   async handler (to, from) {
    //     this.$log('$route.params.id TO', to)
    //     if (to) {
    //       let feed = await this.$rxdb.get(RxCollectionEnum.WS_NODE, to)
    //       this.$log('feed', feed)
    //       this.feed = feed
    //     }
    //   }
    // }
  }
}
</script>
