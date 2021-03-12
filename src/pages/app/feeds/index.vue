<template lang="pug">
//- div(
  :style=`{
    height: $q.screen.height+'px',
    //- paddingTop: '200px',
  }`
  ).row.full-wdith.items-start.content-start.justify-center
  div().row.full-width.items-start.content-start.text-white.bg
    div(v-for="n in 4" :key="n" :style=`{height: '50px',}`).row.full-width.items-center.content-center.justify-center.br {{ n }}
  div(
    :style=`{
      height: '600px',
      maxWidth: '400px',
    }`
    ).column.full-width
    .col.full-width.scroll
      feed(:feed="feed")
q-layout(view="hHh Lpr lff")
  //- q-header(reveal :style=`{paddingTop: 'env(safe-area-inset-top)'}`).b-30
    .row.full-width.justify-center.b-30.q-py-sm.q-px-sm
      div(:style=`{position: 'relative', maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
        div(:style=`{height: '60px', borderRadius: '10px',}`
          ).row.full-width.items-center.content-center.justify-between.q-pl-sm.q-pr-sm.b-40
          //- q-icon(name="home" color="white" size="30px").q-mx-sm
          div(:style=`{width: '30px', height: '30px',}`).row.items-center.content-center.justify-center.q-mr-sm
            kalpa-logo(:width="23" :height="23" :style=`{pointEvents: 'none'}`)
          span(:style=`{fontSize: '18px', userSelect: 'none'}`).text-bold.text-white Лента
          .col
          q-btn(round flat color="grey-8" icon="more_vert")
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
