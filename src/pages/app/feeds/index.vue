<template lang="pug">
q-layout(
  view="hHh lpR fFf"
  container
  :style=`{
    height: $q.screen.height+'px',
  }`).b-30
  q-footer(v-if="$q.screen.lt.md")
    kalpa-menu-mobile
  q-page-container
    q-page(
      v-if="$store.getters.currentUser().profile.role === 'GUEST'"
      :style=`{
        height: '80vh',
      }`
      ).row.full-width.justify-center
      div(:style=`{maxWidth: 600+'px'}`).row.full-width.items-center.content-center.justify-center
        .row.full-width.justify-center
          q-icon(name="login" color="grey-8" size="100px")
        div(:style=`{textAlign: 'center'}`).row.full-width.justify-center
          span.text-white Вы увидите свою домашнюю ленту.
        .row.full-width.justify-center.q-pt-md
          q-btn(
            outline color="white" no-caps
            :to="'/auth/sign-in'"
            :style=`{
              height: '50px',
            }`)
            h1.text-white Войти в аккаунт
    q-page(
      v-if="$store.getters.currentUser().profile.role !== 'GUEST'"
      :style=`{
        //- paddingTop: '8px', paddingBottom: '200px',
      }`)
      feed(:feed="feed")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import feed from './feed.vue'

export default {
  name: 'pageApp_feeds',
  components: {
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
