<template lang="pug">
kalpa-layout()
  template(v-slot:footer)
    kalpa-menu-mobile(v-if="$q.screen.lt.md")
  template(v-slot:body)
    .row.full-width.items-start.content-start
      view-guest(
        v-if="$store.getters.isGuest")
      div(
        v-else
        :style=`{
          paddingTop: '8px',
        }`).row.full-width.justify-center
        feed(:feed="feed")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import viewGuest from './view_guest.vue'
import feed from './feed.vue'

export default {
  name: 'pageApp_feeds',
  components: {
    viewGuest,
    feed
  },
  data () {
    return {
      feeds: [],
    }
  },
  computed: {
    feed () {
      if (this.$route.params.id) {
        return this.feeds.find(f => f.id === this.$route.params.id)
      }
      else {
        return {id: 'all', name: 'For you'}
      }
    },
    queryFeeds () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_COLLECTION,
        }
      }
      return res
    }
  },
  watch: {
    '$route.params.id': {
      deep: true,
      immediate: true,
      async handler (to, from) {
        this.$log('$route.params.id CHANGED', to)
        if (to) {
        }
        // get first feed and go there...
        else {
          this.$router.replace('/feeds/all')
        }
      }
    }
  },
  methods: {
    feedCollection () {
      this.$log('feedLaunch')
      this.$router.push('/workspace/collection/' + this.$route.params.id)
    }
  }
}
</script>
