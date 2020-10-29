<template lang="pug">
//- container
q-layout(
  view="hHh Lpr lff"
  :style=`{
  }`).b-30
  q-header(reveal).row.full-width.justify-center.q-pt-sm.q-px-sm.b-30
    div(
      v-if="feed"
      :style=`{
        height: '60px',
        maxWidth: $store.state.ui.pageMaxWidth+'px',
        borderRadius: '10px',
      }`).row.full-width.items-center.content-center.q-px-sm.b-40
      q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()")
      .col
        .row.fit.items-center.content-center
          //- span(:style=`{fontSize: '18px'}`).text-white.text-bold {{ feed.name }}
          q-input(
            v-if="feed"
            v-model="feed.name"
            placeholder="Enter feed name"
            borderless dark
            :autofocus="feed.name.length === 0"
            :input-style=`{
              fontSize: '18px',
              fontWeight: 'bold',
            }`
            :style=`{}`).full-width
      q-btn(round flat color="white" icon="launch" @click="$router.push('/feeds/'+feed.id)")
  q-page-container
    feed(:id="$route.params.id")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import feed from './feed.vue'

export default {
  name: 'pageApp_wsFeed',
  components: {
    feed,
  },
  data () {
    return {
      feed: null,
      feedNew: {
        name: '',
        spheres: [],
        items: [],
        wsItemType: 'WS_FEED',
        thumbUrl: '',
      },
      itemSelected: null,
      searchString: '',
      typesSelected: []
    }
  },
  watch: {
    '$route.params.id': {
      immediate: true,
      async handler (to, from) {
        this.$log('id TO', to)
        if (to) {
          if (to === 'all') {
            this.feed = {id: 'all', name: 'Все закладки'}
          }
          else {
            this.feed = await this.$rxdb.get(RxCollectionEnum.WS_FEED, to)
          }
        }
      }
    },
  },
  mounted () {
    this.$log('mounted')
    // this.$store.commit('ui/stateSet', ['showMobileNavigation', false])
    // this.$store.commit('ui/stateSet', ['showDesktopNavigation', false])
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    // this.$store.commit('ui/stateSet', ['showMobileNavigation', true])
    // this.$store.commit('ui/stateSet', ['showDesktopNavigation', true])
  }
}
</script>
