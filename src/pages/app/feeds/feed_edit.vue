<template lang="pug">
.row.full-width
  //- header
  .row.full-width.justify-center.q-pt-sm.q-px-sm
    div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width
      div(
        :style=`{
          height: '60px', borderRadius: '10px',
        }`
        ).row.full-width.items-center.content-center.b-40.q-pa-sm
        q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()")
        .col.q-px-sm
          q-input(
            v-if="feed"
            v-model="feed.name"
            placeholder="Enter feed name"
            borderless dark
            :input-style=`{
              fontSize: '18px',
              fontWeight: 'bold',
            }`
            :style=`{}`).full-width
  //- feed subscriptions
  div(
    v-if="feed"
    ).row.full-width.justify-center.q-px-sm
    div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width.q-py-sm
      //- small.text-white {{ feed }}
      div().row.full-width
        div(
          v-for="(i,ii) in feed.items" :key="i"
          v-if="subscriptions[i]"
          :style=`{
            borderRadius: '10px'
          }`
          ).row.items-center.content-center.b-40.q-pa-sm
          img(
            draggable="false"
            :src="subscriptions[i].thumbUrl"
            :style=`{
              objectFit: 'cover',
              width: '30px', height: '30px',
              borderRadius: '50px',
            }`).q-mr-sm
          span.text-white {{ subscriptions[i].name }}
  //- user subscriptions
  .row.full-width.justify-center.q-px-sm
    div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width
      .row.full-width.q-pa-sm
        span.text-white Subsriptions
      .row.full-width.items-start.content-start
        div(
          @click="subscriptionClick(s)"
          v-for="(s,skey) in subscriptions" :key="s.oid"
          :style=`{
            borderRadius: '10px',
          }`
          ).row.full-width.b-40.q-pa-sm.q-mb-sm
          span.text-white {{ s.name }}
          .row.full-width
            small.text-grey-6 {{ s.type }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageApp_feeds_feedEdit',
  props: ['feeds', 'subscriptions'],
  data () {
    return {
      feed: null,
      feedNew: {
        name: '',
        spheres: [],
        items: [],
        wsItemType: 'WS_BOOKMARK',
        type: 'feed',
        thumbUrl: '',
        // oid: null,
      }
    }
  },
  methods: {
    subscriptionClick (s) {
      this.$log('subscriptionClick', s)
      let sFind = this.feed.items.findIndex(i => i === s.oid)
      // remove this sub
      if (sFind >= 0) {
        this.feed.items = this.feed.items.filter(i => i !== s.oid)
      }
      // add this sub
      else {
        this.feed.items.push(s.oid)
      }
    },
  },
  watch: {
    '$route.params.id': {
      immediate: true,
      async handler (to, from) {
        this.$log('$route.params.id TO')
        if (to) {
          if (to === 'new') {
            this.feed = JSON.parse(JSON.stringify(this.feedNew))
            var unwatch = this.$watch(
              'feed',
              async (_from, _to) => {
                this.$log('feed _TO', to)
                // create node...
                if (unwatch) unwatch()
                let feedInput = JSON.parse(JSON.stringify(this.feed))
                let feed = await this.$rxdb.set(RxCollectionEnum.WS_BOOKMARK, feedInput)
                this.$router.replace(`/feeds/edit/${feed.id}`)
              },
              {
                deep: true,
              }
            )
          }
          else {
            let feed = await this.$rxdb.get(RxCollectionEnum.WS_NODE, to)
            this.$log('FOUND feed', feed)
            this.feed = feed
          }
        }
      }
    }
  }
}
</script>
