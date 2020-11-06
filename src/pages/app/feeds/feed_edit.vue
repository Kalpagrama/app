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
            :autofocus="feed.name.length === 0"
            :input-style=`{
              fontSize: '18px',
              fontWeight: 'bold',
            }`
            :style=`{}`).full-width
  //- feed subscriptions
  div(
    v-if="feed"
    ).row.full-width.justify-center.q-px-sm
    div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width.q-pt-sm
      //- small.text-white {{ feed }}
      div().row.full-width
        div(
          @click="subscriptionClick({oid: i})"
          v-for="(i,ii) in feed.bookmarks" :key="i"
          v-if="subscriptions[i]"
          :style=`{
            borderRadius: '10px'
          }`
          ).row.items-center.content-center.b-40.q-pa-sm.q-mr-sm.q-mb-sm
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
  div(
    v-if="feed"
    ).row.full-width.justify-center.q-px-sm
    div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width
      .row.full-width.q-px-sm
        span.text-grey-6 Мои подписки
      .row.full-width
        div(:style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden', zIndex: 100,}`).row.full-width
          q-input(
            v-model="searchString"
            filled dark dense color="grey-6"
            placeholder="Поиск"
            ).full-width
      .row.full-width.items-start.content-start.q-pt-sm
        div(
          @click="subscriptionClick(s)"
          v-for="(s,skey) in subscriptions" :key="s.oid"
          v-if="!feed.bookmarks.includes(s.oid)"
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
      searchString: '',
      feed: null,
      feedNew: {
        name: ''
      }
    }
  },
  methods: {
    async subscriptionClick (s) {
      this.$log('subscriptionClick', s)
      await this.feed.addBookmarkToCollection(s)
      // let sFind = this.feed.items.findIndex(i => i === s.oid)
      // // remove this sub
      // if (sFind >= 0) {
      //   this.feed.bookmarks = this.feed.bookmarks.filter(i => i !== s.oid)
      // }
      // // add this sub
      // else {
      //   this.feed.bookmarks.push(s.oid)
      // }
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
                let collectionInput = JSON.parse(JSON.stringify(this.feed))
                let feed = await this.$rxdb.set(RxCollectionEnum.WS_COLLECTION, collectionInput)
                this.$router.replace(`/feeds/edit/${feed.id}`)
              },
              {
                deep: true,
              }
            )
          }
          else {
            let feed = await this.$rxdb.get(RxCollectionEnum.WS_COLLECTION, to)
            this.$log('FOUND feed', feed)
            this.feed = feed
          }
        }
      }
    }
  }
}
</script>
