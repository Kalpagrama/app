<template lang="pug">
q-page(
  :style=`{paddingTop: '120px',}`
  ).row.full-width.justify-center.items-start.content-start.q-px-sm
  q-dialog(
    v-model="itemFinderOpened"
    position="bottom"
    maximized
    transition-show="none"
    transition-hide="none")
    item-finder(
      v-if="feed && id !== 'all'"
      :items="feed.items"
      :style=`{
        height: $q.screen.height+'px',
        minWidth: itemFinderWidth+'px',
      }`
      @itemAdd="itemAdd"
      @itemDelete="itemDelete"
      @close="itemFinderOpened = false")
  q-page-sticky(
    expand position="top"
    :style=`{zIndex: 1000}`
    ).row.full-width.b-30
    div(
      :style=`{
        height: '120px',
      }`
      ).row.full-width.items-start.content-start.b-30
      //- search
      .row.full-width.justify-center.q-pt-sm.q-pb-xs.q-px-sm
        div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width.justify-start
          div(:style=`{maxWidth: '700px',}`).row.full-width
            slot(name="search-prepend")
            div(:style=`{maxWidth: '700px',}`).col
              ws-search()
            q-btn(
              v-if="id !== 'all'"
              @click="itemFinderOpened = true"
              round flat color="grey-4" icon="add")
            q-btn(
              round flat color="grey-4" icon="tune")
      //- types
      .row.full-width.justify-center.q-px-sm
        div(
          :style=`{
            maxWidth: $store.state.ui.pageMaxWidth+'px'
            //- maxWidth: '700px',
          }`
          ).row.full-width.items-start.content-start.scroll
          .row.items-center.content-center.no-wrap
            q-btn(
              @click="typeClick(type)"
              v-for="(type,ii) in types" :key="type.id"
              flat no-caps dense
              :color="typesSelected.includes(type.id) ? 'green' : 'grey-7'"
              :class=`{
                'b-40': typesSelected.includes(type.id)
              }`
              :style=`{}`).q-mr-xs.q-px-xs {{ type.name }}
  //- items wrapper
  kalpa-loader(
    v-if="feed"
    :immediate="true"
    :query="itemsQuery" :limit="1000" v-slot=`{items,next}`)
    div(
      :style=`{
        maxWidth: $store.state.ui.pageMaxWidth+'px',
        //- maxWidth: '700px',
      }`
      ).row.full-width.items-start.content-start
      div(:style=`{maxWidth: '700px'}`).row.full-width
        feed-item(
          v-for="(item, ii) in items" :key="item.id"
          @select="itemSelectedId = item.id"
          :item="item"
          ).q-mb-sm
          template(v-slot:tint=`{item}`)
            slot(name="tint" :item="item")
          template(v-slot:default=`{item}`)
            div(
              v-if="itemSelectedId === item.id"
              :style=`{
                marginTop: '-20px',
                paddingTop: '20px',
                borderRadius: '10px',
              }`
              ).row.full-width.bg-green.q-px-xs.q-pb-xs
              q-btn(round flat dense color="white" icon="delete_outline" @click="itemDelete(item)")
              .col
              q-btn(round flat dense color="white" icon="launch" @click="itemLaunch(item)")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { UserApi } from 'src/api/user'

export default {
  name: 'wsFeed_feed',
  props: ['id'],
  components: {
    feedSearch: () => import('./feed_search.vue'),
    feedItem: () => import('./feed_item.vue'),
    itemFinder: () => import('./item_finder.vue')
  },
  data () {
    return {
      feed: null,
      typesSelected: [],
      searchString: '',
      itemFinderOpened: false,
      itemSelectedId: null,
    }
  },
  computed: {
    types () {
      return [
        {id: 'VIDEO', name: 'Видео', types: ['VIDEO']},
        {id: 'IMAGE', name: 'Картинки', types: ['IMAGE']},
        {id: 'NODE', name: 'Ядра', types: ['NODE']},
        {id: 'JOINT', name: 'Связи', types: ['JOINT']},
        {id: 'USER', name: 'Люди', types: ['USER']},
        {id: 'SPHERE', name: 'Сферы', types: ['WORD', 'SENTENCE']}
      ]
    },
    itemsQuery () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK,
        },
        sort: [{updatedAt: 'desc'}]
      }
      // add feeds filter
      if (this.id !== 'all') {
        res.selector.feeds = {$elemMatch: {$eq: this.feed.id}}
      }
      // add types filter
      if (this.typesSelected.length > 0) {
        res.selector.type = {$in: this.typesSelected}
      }
      // add name filter
      if (this.searchString.length > 0) {
        let nameRegExp = new RegExp(this.searchString, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
      return res
    },
    itemFinderWidth () {
      if (this.$q.screen.width < this.$store.state.ui.pageMaxWidth) return this.$q.screen.width
      else return this.$store.state.ui.pageMaxWidth
    },
    itemFinderHeight () {
      return this.$q.screen.height - 76
    },
  },
  watch: {
    id: {
      immediate: true,
      async handler (to, from) {
        if (to) {
          if (to === 'all') {
            this.feed = {
              id: 'all',
              name: 'All bookmarks',
              feeds: [],
              items: [],
              spheres: []
            }
          }
          else {
            this.feed = await this.$rxdb.get(RxCollectionEnum.WS_FEED, to)
          }
        }
      }
    }
  },
  methods: {
    typeClick (type) {
      this.$log('typeClick', type)
      if (this.typesSelected.findIndex(i => i === type.id) >= 0) {
        this.typesSelected = this.typesSelected.filter(i => i !== type.id)
      }
      else {
        this.typesSelected.push(type.id)
      }
    },
    itemAdd (item) {
      this.$log('itemAdd', item)
      if (item.feeds.includes(this.feed.id)) {
        alert('Duplicate!')
      }
      else {
        item.feeds.push(this.feed.id)
        this.feed.items.push(item.id)
      }
    },
    itemLaunch (item) {
      this.$log('itemLaunch', item)
      let itemLaunchMap = {
        NODE: '/node/',
        JOINT: '/joint/',
        USER: '/user/',
        SPHERE: '/sphere/',
        WORD: '/sphere/',
        SENTENCE: '/sphere/',
        VIDEO: '/content/',
        IMAGE: '/content/'
      }
      let p = itemLaunchMap[item.type]
      this.$log('p', p)
      if (p) {
        this.$router.push(p + item.oid)
      }
    },
    itemDelete (item) {
      this.$log('itemDelete', item)
      let i = item.feeds.findIndex(id => id === this.feed.id)
      this.$log('i', i)
      if (i >= 0) {
        this.$delete(item.feeds, i)
        this.feed.items = this.feed.items.filter(id => id !== item.id)
      }
    },
    async contentFound (content) {
      this.$log('contentFound', content)
      // create/find bookmark
      let [bookmark] = await this.$rxdb.find({selector: {rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK, oid: content.oid}})
      this.$log('bookmark', bookmark)
      if (bookmark) {
        if (bookmark.deletedAt > 0) {
          alert('content was deleted!, restoring...')
          this.$delete(bookmark, 'deletedAt')
        }
      }
      else {
        let bookmarkInput = {
          oid: content.oid,
          name: content.name,
          thumbUrl: content.thumbUrl,
          type: content.type,
          wsItemType: 'WS_BOOKMARK',
          spheres: [],
          feeds: []
        }
        bookmark = await this.$rxdb.set(RxCollectionEnum.WS_BOOKMARK, bookmarkInput)
      }
      // subsribe to bookmark...
      if (!await UserApi.isSubscribed(bookmark.oid)) await UserApi.subscribe(bookmark.oid)
      // add bookmark to this feed if not "all"
      if (this.id !== 'all') {
        this.itemAdd(bookmark)
      }
    }
  }
}
</script>
