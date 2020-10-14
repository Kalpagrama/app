<template lang="pug">
//- q-layout(view="hHh Lpr lff")
  q-header(reveal)
    .row.full-width.justify-center.b-30
      div(:style=`{position: 'relative', maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width.q-pt-sm.q-px-sm
        div(:style=`{height: '60px', borderRadius: '10px',}`
          ).row.full-width.items-center.content-center.justify-between.q-pa-sm.b-40
          q-icon(name="view_week" color="white" size="30px").q-mx-sm
          span(:style=`{fontSize: '18px', userSelect: 'none'}`).text-bold.text-white {{$t('pageApp_MyFeeds_title', 'Мои ленты')}}
          .col
          q-btn(
            @click="$router.push('/feeds-settings')"
            round flat color="white" icon="settings")
        //- feeds tabs
        div(:style=`{paddingLeft: '16px', paddingRight: '16px',}`).row.full-width
          kalpa-loader(
            :immediate="true"
            :query="queryFeeds" :limit="1000" v-slot=`{items,next}` @items="feedsLoaded")
            q-tabs(
              :value="$route.params.id"
              @input="$router.push({params: {id: $event}})"
              active-color="white" no-caps dense aling="left" switch-indicator
              ).full-width.text-grey-5
              q-tab(v-for="(f,fi) in items" :key="f.id" :name="f.id" :label="f.name")
  //- q-page-container
    q-page(:style=`{paddingBottom: '0px',}`).row.full-width.justify-center
      div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px',}`).row.full-width
.row.full-width.items-start.content-start
  kalpa-loader(
    :immediate="true"
    :query="querySubscriptions" :limit="1000" v-slot=`{items,next}` @items="subscriptionsLoaded")
  kalpa-loader(
    :immediate="true"
    :query="queryFeeds" :limit="1000" v-slot=`{items,next}` @items="feeds = $event")
  router-view(:subscriptions="subscriptions" :feeds="feeds")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import feedItem from './feed_item.vue'

export default {
  name: 'pageApp_feeds',
  data () {
    return {
      feeds: [],
      subscriptions: {}
    }
  },
  computed: {
    queryFeeds () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_FEED,
          // type: 'feed'
        }
      }
      return res
    },
    querySubscriptions () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SUBSCRIPTIONS,
          oidSphere: this.$store.getters.currentUser().oid,
        },
        populateObjects: false,
      }
      return res
    },
  },
  methods: {
    subscriptionsLoaded (subs) {
      this.$log('subscriptionsLoaded', subs)
      this.subscriptions = subs.reduce((acc, val) => {
        acc[val.oid] = val
        return acc
      }, {})
    }
  }
}
</script>
