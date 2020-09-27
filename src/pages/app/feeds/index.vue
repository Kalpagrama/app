<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-header(reveal)
    .row.full-width.justify-center.b-30
      div(:style=`{position: 'relative', maxWidth: '800px'}`).row.full-width.q-pt-sm.q-px-sm
        div(:style=`{height: '60px', borderRadius: '10px',}`
          ).row.full-width.items-center.content-center.justify-between.q-pl-md.q-pr-xs.b-40
          q-icon(name="rss_feed" color="white" size="30px").q-mr-sm
          span(:style=`{fontSize: '18px', userSelect: 'none'}`).text-bold.text-white {{$t('pageApp_MyFeeds_title', 'Мои ленты')}}
          .col
          q-btn(
            @click="$router.push('/settings/feeds')"
            round flat color="white" icon="settings")
        //- feeds tabs
        .row.full-width
          kalpa-loader(:mangoQuery="queryFeeds" :sliceSize="1000" v-slot=`{items,next}` @items="feedsLoaded")
            q-tabs(
              :value="$route.params.id"
              @input="$router.push({params: {id: $event}})"
              active-color="white" no-caps dense aling="left" switch-indicator
              ).full-width.text-grey-5
              q-tab(v-for="(f,fi) in items" :key="f.id" :name="f.id" :label="f.name")
  q-page-container
    q-page(:style=`{paddingBottom: '0px',}`).row.full-width.justify-center
      div(:style=`{maxWidth: '800px',}`).row.full-width
        //- kalpa-loader(
          v-if="$route.params.id && subscriptions.length > 0"
          :mangoQuery="queryFeedItems" :sliceSize="20" v-slot=`{items,next}`)
          list-middle(:items="items" :itemStyles=`{marginBottom: '50px',}`)
            q-infinite-scroll(@load="next" :offset="250")
            template(v-slot:item=`{item,itemIndex,isActive,isVisible}`)
              feed-item(:item="item" :isActive="isActive" :isVisible="isVisible")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import feedItem from './feed_item.vue'
// import('https://tenor.com/embed.js')

export default {
  name: 'pageApp__feeds',
  components: {feedItem},
  data () {
    return {
      feedId: null,
      feeds: []
    }
  },
  computed: {
    queryFeeds () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK,
          type: 'feed'
        }
      }
      return res
    },
    subscriptions () {
      if (this.$route.params.id) {
        return this.feeds.reduce((acc, val) => {
          if (this.$route.params.id === val.id) {
            val.items.map(i => {
              acc.push(i.oid)
            })
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
          populateObjects: false,
          oidSphere: this.$store.getters.currentUser().oid,
          subscription: {$in: this.subscriptions}
        }
      }
    }
  },
  watch: {
  },
  methods: {
    feedsLoaded (feeds) {
      this.$log('feedsLoaded')
      this.feeds = feeds
      if (!this.$route.params.id) {
        this.$router.replace({params: {id: this.feeds[0].id}})
      }
    }
  }
}
</script>
