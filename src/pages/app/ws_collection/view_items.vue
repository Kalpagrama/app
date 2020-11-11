<template lang="pug">
q-page(
  :style=`{
    paddingTop: 98+paddingTop+'px',
  }`
  ).row.full-width.justify-center.items-start.content-start.q-px-sm
  q-dialog(
    v-model="itemFinderOpened"
    position="bottom"
    maximized
    transition-show="none"
    transition-hide="none")
    kalpa-finder(
      :style=`{
        height: $q.screen.height+'px',
        maxWidth: $store.state.ui.pageWidth+'px',
      }`)
      template(v-slot:header)
        div(:style=`{height: '60px'}`).row.full-width.items-center.content-center
          q-btn(round flat color="white" icon="keyboard_arrow_left" @click="itemFinderOpened = false")
          .col
            span(:style=`{fontSize: '18px'}`).text-white.text-bold Выбрать элемент
      template(v-slot:tint=`{item}`)
        div(
          @click="itemFound(item)"
          :class=`{
            'bg-red': collection.bookmarks.includes(item.id)
          }`
          :style=`{
            position: 'absolute', zIndex: 1000,
            opacity: 0.5,
          }`
          ).row.fit
  q-page-sticky(
    expand position="top"
    :style=`{zIndex: 1000}`
    ).b-30
    .row.full-width.items-start.content-start.b-30.q-px-sm
      slot(name="top" :collection="collection")
      //- search
      .row.full-width.justify-center
        div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width.justify-start
          div(:style=`{maxWidth: '700px',}`).row.full-width
            slot(name="search-prepend")
            div(:style=`{maxWidth: '700px',}`).col
              ws-search(
                @searchString="searchString = $event"
                @contentKalpa="contentKalpaFound")
            q-btn(
              v-if="id !== 'all'"
              @click="itemFinderOpened = true"
              round flat color="grey-4" icon="add")
            //- q-btn(
              round flat color="grey-4" icon="tune")
      //- types
      .row.full-width.justify-center
        div(
          :style=`{
            maxWidth: $store.state.ui.pageWidth+'px'
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
  kalpa-loader(
    :immediate="true"
    :query="itemsQuery" :limit="1000" v-slot=`{items,next,nexting}`)
    div(
      :style=`{
        maxWidth: $store.state.ui.pageWidth+'px',
      }`
      ).row.full-width.items-start.content-start
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
    collection: {type: Object},
    paddingTop: {
      type: Number,
      default: 0
    },
    useViews: {type: Boolean, default: true}
  },
  components: {
    feedItem: () => import('./feed_item.vue'),
    itemFinder: () => import('./item_finder.vue'),
    viewViews: () => import('./view_views.vue')
  },
  data () {
    return {
      viewId: 'items',
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
        res.selector.id = {$in: this.collection.bookmarks}
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
    async itemFound (item) {
      this.$log('itemFound', item)
      if (item.wsItemType) {
        if (this.collection.bookmarks.includes(item.id)) {
          await this.collection.removeBookmarkFromCollection(item)
        }
        else {
          await this.collection.addBookmarkToCollection(item)
        }
      }
      else {
        confirm('Add bookmark ?')
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
         await this.collection.addBookmarkToCollection(bookmark) // добавим в эту коллекцию
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
