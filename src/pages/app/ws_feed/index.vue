<template lang="pug">
.row.full-width.items-start.content-start.justify-center
  //- position="bottom"
  q-dialog(
    v-model="itemFinderOpened"
    position="bottom"
    transition-show="none"
    transition-hide="none"
    )
    item-finder(
      :style=`{
        height: itemFinderHeight+'px',
        minWidth: itemFinderWidth+'px',
      }`
      @item="itemFound"
      @close="itemFinderOpened = false"
      )
  //- header
  .row.full-width.justify-center.q-pt-sm.q-px-sm
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
  //- body: items
  .row.full-width.justify-center.q-py-sm
    div(
      v-if="feed"
      :style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width.q-pr-sm
      masonry(
        :cols="$q.screen.width < 800 ? 2 : 4"
        :gutter="{default: 10}").full-width
        div(
          v-for="(item,ii) in feed.items"
          :style=`{
            position: 'relative',
            borderRadius: '10px',
          }`
          ).row.full-width.b-40.q-mb-md
          div(
            @click="itemClick(item)"
            :style=`{
              position: 'relative', zIndex: 10,
              borderRadius: '10px',
            }`
            ).row.full-width.items-start.content-start.b-40.cursor-pointer
            img(
              draggable="false"
              :src="item.thumbUrl"
              :style=`{
                borderRadius: '10px',
              }`
              ).full-width
            .row.full-width.justify-start.q-pa-xs
              .row.full-height.q-pa-xs
                q-icon(:name="itemIcon(item)" color="grey-4" size="20px")
              .col
                small.text-white {{ item.name.slice(0,30) }}
          //- selected...
          div(
            v-if="itemSelected === item.oid"
            :style=`{
              //- zIndex: 5,
              marginTop: '-20px', paddingTop: '20px',
              borderRadius: '10px',
            }`
            ).row.full-width.bg-green
            q-btn(round flat dense color="green-8" icon="delete_outline" @click="itemDelete(item)")
            .col
            q-btn(round flat dense color="white" icon="launch" @click="itemLaunch(item)")
  //- footer
  div(
    :style=`{
      position: 'fixed', zIndex: 200, bottom: 0,
    }`
    ).row.full-width.justify-center.q-pa-sm
    q-btn(
      @click="itemFinderOpened = true"
      round color='green' icon="add" :style=`{borderRadius: '50%'}`)
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageApp_wsFeed',
  components: {
    itemFinder: () => import('./item_finder.vue')
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
      itemFinderOpened: false,
      itemSelected: null,
    }
  },
  computed: {
    itemFinderWidth () {
      if (this.$q.screen.width < this.$store.state.ui.pageMaxWidth) return this.$q.screen.width
      else return this.$store.state.ui.pageMaxWidth
    },
    itemFinderHeight () {
      return this.$q.screen.height - 76
    }
  },
  watch: {
    '$route.params.id': {
      immediate: true,
      async handler (to, from) {
        this.$log('id TO', to)
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
                let feed = await this.$rxdb.set(RxCollectionEnum.WS_FEED, feedInput)
                this.$router.replace(`/feeds/edit/${feed.id}`)
              },
              {
                deep: true,
              }
            )
          }
          else {
            let feed = await this.$rxdb.get(RxCollectionEnum.WS_FEED, to)
            this.$log('FOUND feed', feed)
            this.feed = feed
          }
        }
      }
    },
  },
  methods: {
    itemFound (item) {
      this.$log('itemFound', item)
      // check duplicates
      let findIndex = this.feed.items.findIndex(i => i.oid === item.oid)
      if (findIndex >= 0) {
        alert('duplicate of item!')
      }
      else {
        this.feed.items.push(item)
      }
    },
    itemClick (item) {
      this.$log('itemClick', item)
      this.itemSelected = item.oid
    },
    itemLaunch (item) {
      this.$log('itemLaunch', item)
      let itemLaunchMap = {
        NODE: '/node/',
        CONTENT: '/content/',
      }
      let p = itemLaunchMap[item.type]
      this.$log('p', p)
      if (p) {
        this.$router.push(p + item.oid)
      }
    },
    itemDelete (item) {
      this.$log('itemDelete', item)
      let findIndex = this.feed.items.findIndex(i => i.oid === item.oid)
      this.$log('findIndex', findIndex)
      if (findIndex >= 0) {
        this.$delete(this.feed.items, findIndex)
        this.itemSelected = null
      }
    },
    itemIcon (item) {
      let itemIconMap = {
        CONTENT: 'select_all',
        NODE: 'filter_tilt_shift'
      }
      return itemIconMap[item.type]
    }
  },
  mounted () {
    this.$log('mounted')
    this.$store.commit('ui/stateSet', ['showMobileNavigation', false])
    this.$store.commit('ui/stateSet', ['showDesktopNavigation', false])
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.$store.commit('ui/stateSet', ['showMobileNavigation', true])
    this.$store.commit('ui/stateSet', ['showDesktopNavigation', true])
  }
}
</script>
