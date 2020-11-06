<template lang="pug">
q-page(
  :style=`{
    paddingTop: (useViews ? 134 : 98)+paddingTop+'px',
  }`
  ).row.full-width.justify-center.items-start.content-start.q-px-sm
  q-dialog(
    v-model="itemFinderOpened"
    position="bottom"
    maximized
    transition-show="none"
    transition-hide="none")
    item-finder(
      v-if="feed && id !== 'all'"
      :items="feed.bookmarks"
      :style=`{
        height: $q.screen.height+'px',
        minWidth: itemFinderWidth+'px',
        maxWidth: itemFinderWidth+'px',
      }`
      @itemAdd="itemAdd"
      @itemDelete="itemDelete"
      @close="itemFinderOpened = false")
  q-page-sticky(
    expand position="top"
    :style=`{zIndex: 1000}`
    ).b-30
    .row.full-width.items-start.content-start.b-30.q-px-sm
      slot(name="top" :feed="feed")
      //- views
      //- div(v-if="useViews").row.full-width.justify-center
        div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width.q-px-sm
          q-tabs(
            v-model="viewId"
            no-caps align="left" active-color="green" dense
            ).full-width.text-grey-7
            q-tab(
              v-for="(view, ii) in views" :key="view.id"
              :name="view.id" :label="view.name")
      //- search
      div(v-if="viewId === 'items'").row.full-width.justify-center
        div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width.justify-start
          div(:style=`{maxWidth: '700px',}`).row.full-width
            slot(name="search-prepend")
            div(:style=`{maxWidth: '700px',}`).col
              ws-search(
                :feedId="id !== 'all' ? id : undefined"
                @searchString="searchString = $event"
                @contentKalpa="contentKalpaFound")
            q-btn(
              v-if="id !== 'all'"
              @click="itemFinderOpened = true"
              round flat color="grey-4" icon="add")
            q-btn(
              round flat color="grey-4" icon="tune")
      //- types
      div(v-if="viewId === 'items'").row.full-width.justify-center
        div(
          :style=`{
            maxWidth: $store.state.ui.pageWidth+'px'
            //- maxWidth: '700px',
          }`
          ).row.full-width.items-start.content-start.scroll.q-pt-xs
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
  div(
    v-if="viewId === 'details'"
    ).row.full-width.q-pa-xl.bg-red
  div(
    v-if="viewId === 'subscriptions'"
    ).row.full-width.q-pa-xl.bg-blue
  view-views(
    v-if="viewId === 'views'"
    )
  kalpa-loader(
    v-if="viewId === 'items' && feed"
    :immediate="true"
    :query="itemsQuery" :limit="1000" v-slot=`{items,next,nexting}`)
    div(
      :style=`{
        maxWidth: $store.state.ui.pageWidth+'px',
        //- maxWidth: '700px',
      }`
      ).row.full-width.items-start.content-start
      //- div(v-show="nexting" :style=`{height: '50px'}`).row.full-width.justify-center
        q-spinner-dots(v-show="nexting" color="green" size="50px")
      div(:style=`{maxWidth: '700px'}`).row.full-width
        feed-item(
          v-for="(item, ii) in items" :key="item.id"
          @select="itemLaunch(item)"
          @delete="itemDelete(item)"
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
  name: 'wsCollection_viewItems',
  props: {
    id: {type: String},
    paddingTop: {
      type: Number,
      default: 0
    },
    useViews: {type: Boolean, default: true}
  },
  components: {
    feedSearch: () => import('./feed_search.vue'),
    feedItem: () => import('./feed_item.vue'),
    itemFinder: () => import('./item_finder.vue'),
    viewViews: () => import('./view_views.vue')
  },
  data () {
    return {
      viewId: 'items',
      feed: null,
      typesSelected: [],
      searchString: '',
      itemFinderOpened: false,
      itemSelectedId: null,
    }
  },
  computed: {
    views () {
      return [
        {id: 'details', name: 'Детали'},
        {id: 'items', name: 'Закладки'},
        {id: 'subscriptions', name: 'Подписки'},
        {id: 'views', name: 'Views'},
      ]
    },
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
        // res.selector.feeds = {$elemMatch: {$eq: this.feed.id}}
        res.selector.id = {$in: this.feed.bookmarks}
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
      if (this.$q.screen.width < this.$store.state.ui.pageWidth) return this.$q.screen.width
      else return this.$store.state.ui.pageWidth
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
              // feeds: [],
              bookmarks: []
              // spheres: []
            }
          } else {
            this.feed = await this.$rxdb.get(RxCollectionEnum.WS_COLLECTION, to)
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
    async itemAdd (bookmark) {
      this.$log('itemAdd', bookmark)
      await this.feed.addBookmarkToCollection(bookmark)
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
    async itemDelete (bookmark) {
      this.$log('itemDelete', bookmark)
      await bookmark.remove() // удалит себя из всех коллекций и переместится в корзину
    },
    async contentKalpaFound (contentKalpa) {
      this.$log('contentKalpaFound', contentKalpa)
      // try to find bookmark with this content
      let [bookmark] = await this.$rxdb.find({selector: {rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK, oid: contentKalpa.oid}})
      if (bookmark) {
        await bookmark.restoreFromTrash() // на тот случай если он сейчас в корзине
      } else {
        let bookmarkInput = {
          type: contentKalpa.type,
          oid: contentKalpa.oid,
          name: contentKalpa.name,
          thumbUrl: contentKalpa.thumbUrl
        }
        bookmark = await this.$rxdb.set(RxCollectionEnum.WS_BOOKMARK, bookmarkInput)
      }
      if (this.id !== 'all') {
         await this.feed.addBookmarkToCollection(bookmark) // добавим в эту коллекцию
      }
      // bookmark subscribe
      if (!await UserApi.isSubscribed(contentKalpa.oid)) await UserApi.subscribe(contentKalpa.oid)
      // open content ?
      await this.$wait(500)
      this.$router.push('/content/' + contentKalpa.oid)
    }
  }
}
</script>
