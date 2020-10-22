<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-header(reveal)
    .row.full-width.justify-center.b-30
      div(:style=`{position: 'relative', maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width.q-pt-sm.q-px-sm
        div(:style=`{height: '60px', borderRadius: '10px',}`
          ).row.full-width.items-center.content-center.justify-between.q-pl-sm.q-pr-sm.b-40
          q-icon(name="view_week" color="white" size="30px").q-mx-sm
          span(:style=`{fontSize: '18px', userSelect: 'none'}`).text-bold.text-white {{$t('pageApp_feeds', 'Ленты')}}
          .col
          q-btn(round flat color="white" icon="launch" @click="$router.push('/workspace/feed/'+feed.id)")
  q-page-container
    q-page(
      :style=`{
        paddingTop: '50px', paddingBottom: '200px',
      }`)
      kalpa-loader(
        :immediate="true"
        :query="queryFeeds" :limit="1000" v-slot=`{items,next}` @items="feeds = $event, feedsLoaded")
      //- feed...
      feed(v-if="feed" :feed="feed")
      q-page-sticky(
        expand position="top" :style=`{zIndex: 1000}`)
        .row.full-width.justify-center.b-30
          div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width.q-px-md
            q-tabs(
              :value="$route.params.id" @input="$router.push({params: {id: $event}}).catch(e => e)"
              dense no-caps active-color="green" switch-indicator
              ).full-width.text-grey-8
              q-tab(v-for="(feed,ii) in feeds" :key="feed.id" :name="feed.id" :label="feed.name" dense)
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import feed from './feed.vue'

export default {
  name: 'pageApp__feeds',
  components: {
    feed
  },
  data () {
    return {
      feeds: [],
      // feed: null,
    }
  },
  computed: {
    feed () {
      if (this.$route.params.id) {
        return this.feeds.find(f => f.id === this.$route.params.id)
      }
      else {
        return null
      }
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
  watch: {
    feeds: {
      handler (to, from) {
        if (to[0] && !this.$route.params.id) {
          // this.$router.replace({params: {id: to[0].id}})
          this.$router.replace('/feeds/' + to[0].id)
        }
      }
    },
    '$route.params.id': {
      deep: true,
      immediate: true,
      async handler (to, from) {
        this.$log('$route.params.id CHANGED', to)
        if (to) {
          // this.feed = this.feeds.find(f => f.id === to)
        }
        // get first feed and go there...
        else {
          if (this.feeds[0]) {
            // this.$router.replace({params: {id: this.feeds[0].id}})
            this.$router.replace('/feeds/' + this.feeds[0].id)
          }
        }
      }
    }
  },
  methods: {
  }
}
</script>
