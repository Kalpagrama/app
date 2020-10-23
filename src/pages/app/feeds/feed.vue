<template lang="pug">
.row.full-width
  //- header
  //- .row.full-width.justify-center.q-pt-sm.q-px-sm
    div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width
      div(
        :style=`{
          height: '60px', borderRadius: '10px',
        }`
        ).row.full-width.items-center.content-center.q-pa-sm.b-40
        q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()")
        //- q-icon(name="view_week" color="white" size="30px").q-mr-sm
        .col
          span(v-if="feed" :style=`{fontSize: '18px'}`).text-white.text-bold {{ feed.name }}
        q-btn(v-if="feed" round flat color="grey-7" icon="settings" @click="$router.push('/feeds/edit/'+feed.id)")
  //- items
  .row.full-width.justify-center
    div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width.q-pt-sm
      kalpa-loader(
        v-if="feed && feed.items.length > 0"
        :immediate="true"
        :query="queryFeedItems" :limit="20" v-slot=`{items,next}`)
        list-middle(:items="items" :itemStyles=`{marginBottom: '50px',}`)
          q-infinite-scroll(@load="next" :offset="250")
          template(v-slot:item=`{item,itemIndex,isActive,isVisible,width}`)
            feed-item(:item="item" :isActive="isActive" :isVisible="isVisible" :width="width")
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
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_FEED,
          oidSphere: this.$store.getters.currentUser().oid,
          subscription: {$in: this.feedSubscriptions}
        },
        populateObjects: true,
      }
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
