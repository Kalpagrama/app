<template lang="pug">
q-page(:style=`{paddingTop: '8px',}`).row.full-width.justify-center
  div(
    v-if="feed"
    :style=`{height: $q.screen.height-105+'px', maxWidth: $store.state.ui.pageMaxWidth+'px',}`).row.full-width.q-px-sm
    //- feed editor...
    .row.full-width.items-center.content-center
      q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()")
      span(:style=`{fontSize: '20px',}`).text-white.text-bold Feed
      .col
      q-btn(round flat color="red" icon="delete_outline" @click="feedDelete()")
    .col.full-height.q-pr-sm
      .row.full-width.q-py-md
        div(:style=`{position: 'relative', zIndex: 200, borderRadius: '10px', overflow: 'hidden'}`).row.full-width
          q-input(
            v-model="feed.name"
            filled dark color="grey-6"
            placeholder="Feed name"
            :input-style=`{
              fontSize: '18px',
              fontWeight: 'bold',
            }`).full-width
      .row.full-width.items-center.content-center
        div(:style=`{position: 'relative', zIndex: 200, borderRadius: '10px', overflow: 'hidden'}`).row.full-width
          q-input(
            v-model="searchStringSubsFeed"
            filled dark dense color="grey-6"
            placeholder="Find feed subscription"
            ).full-width
      .row.full-width.q-pt-md
        div(
          v-for="(s,si) in feedSubscriptions" :key="s.oid"
          @click="feed.items = feed.items.filter(i => i.oid !== s.oid)"
          :style=`{
            position: 'relative',
            height: '50px',
            borderRadius: '10px'
          }`
          ).row.full-width.items-center.content-center.q-px-md.cursor-pointer.subscription.b-40.q-mb-sm.q-mr-sm
          div(
            v-if="s.type === 'USER'"
            ).row.fit.items-center.content-center
            img( :src="s.thumbUrl" :style=`{width: '30px', height: '30px', borderRadius: '50%',}`).q-mr-sm
            span.text-white {{ s.name }}
          div(
            v-if="s.type === 'WORD'"
            ).row.fit.items-center.content-center
            q-icon(name="blur_on" color="white" size="30px").q-mr-sm
            span.text-white {{ s.name }}
          div(
            v-if="s.type === 'NODE'"
            ).row.fit.items-center.content-center
            q-icon(name="filter_tilt_shift" color="white" size="30px").q-mr-sm
            span.text-white {{ s.name }}
          div(
            v-if="s.type === 'VIDEO' || s.type === 'IMAGE'"
            ).row.fit.items-center.content-center
            q-icon(name="select_all" color="white" size="30px").q-mr-sm
            div(:style=`{overflow: 'hidden'}`).col
              span(:style=`{whiteSpace: 'nowrap'}`).text-white {{ s.name }}
    //- all of the subs...
    .col-5.full-height
      .column.fit
        div(:style=`{height: '88px'}`).row.full-width.items-center.content-center.q-px-sm
          span(:style=`{fontSize: '18px',}`).text-white.text-bold Subscriptions
        .row.full-width.items-center.content-center
          div(:style=`{position: 'relative', zIndex: 200, borderRadius: '10px', overflow: 'hidden'}`).row.full-width
            q-input(
              v-model="searchStringSubs"
              filled dark dense color="grey-6"
              placeholder="Find subscription"
              ).full-width
        .col.full-width.scroll
          kalpa-loader(:query="querySubscriptions" :limit="1000" v-slot=`{items,next}`)
            .row.full-width.items-start.content-start.q-pt-md
              div(
                v-for="(s,si) in items" :key="s.oid"
                v-if="!feed.items.find(i => i.oid === s.oid)"
                @click="subscriptionClick(s)"
                :style=`{
                  position: 'relative',
                  height: '50px',
                  borderRadius: '10px'
                }`
                ).row.full-width.items-center.content-center.q-px-md.cursor-pointer.subscription.b-40.q-mb-sm.q-mr-sm
                div(
                  v-if="s.type === 'USER'"
                  ).row.fit.items-center.content-center
                  img( :src="s.thumbUrl" :style=`{width: '30px', height: '30px', borderRadius: '50%',}`).q-mr-sm
                  span.text-white {{ s.name }}
                div(
                  v-if="s.type === 'WORD'"
                  ).row.fit.items-center.content-center
                  q-icon(name="blur_on" color="white" size="30px").q-mr-sm
                  span.text-white {{ s.name }}
                div(
                  v-if="s.type === 'NODE'"
                  ).row.fit.items-center.content-center
                  q-icon(name="filter_tilt_shift" color="white" size="30px").q-mr-sm
                  span.text-white {{ s.name }}
                div(
                  v-if="s.type === 'VIDEO' || s.type === 'IMAGE'"
                  ).row.fit.items-center.content-center
                  q-icon(name="select_all" color="white" size="30px").q-mr-sm
                  div(:style=`{overflow: 'hidden'}`).col
                    span(:style=`{whiteSpace: 'nowrap'}`).text-white {{ s.name }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'feedEditor',
  data () {
    return {
      searchStringSubsFeed: '',
      searchStringSubs: '',
      feed: null,
    }
  },
  computed: {
    feedSubscriptions () {
      if (!this.feed) return []
      if (this.searchStringSubsFeed.length > 0) {
        return this.feed.items.filter(s => {
          let nameRegExp = new RegExp(this.searchStringSubsFeed, 'i')
          return nameRegExp.test(s.name)
        })
      }
      else {
        return this.feed.items
      }
    },
    querySubscriptions () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SUBSCRIPTIONS,
          oidSphere: this.$store.getters.currentUser().oid,
        },
        populateObjects: false,
      }
      if (this.searchStringSubs.length > 0) {
        let nameRegExp = new RegExp(this.searchStringSubs, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
      return res
    }
  },
  watch: {
    '$route.params.id': {
      immediate: true,
      async handler (to, from) {
        this.$log('$route.params.id TO', to)
        if (to) {
          let {items: [feed]} = await this.$rxdb.find({ selector: { rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK, id: to } })
          this.$log('FOUND feed', feed)
          this.feed = feed
        }
      }
    },
    searchStringSubs: {
      handler (to, from) {
        this.$log('searchStringSubs TO', to)
      }
    }
  },
  methods: {
    subscriptionClick (sub) {
      this.$log('subscriptionClick', sub)
      this.feed.items.push(JSON.parse(JSON.stringify(sub)))
    },
    async feedDelete () {
      this.$log('feedDelete')
      if (!confirm('Delete feed?')) return
      await this.$rxdb.remove(this.feed.id)
      this.$router.back()
    }
  },
}
</script>
