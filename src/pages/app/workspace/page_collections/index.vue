<template lang="pug">
  kalpa-layout(
    :height="_height")
    template(v-slot:header)
      div(
        v-if="useHeader"
      ).row.full-width.justify-center.q-px-sm.q-pt-sm.b-30
        div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
          slot(name="header")
          div(
            v-if="!$slots.header"
            :style=`{
            height: '60px',
            borderRadius: '10px',
          }`
          ).row.full-width.items-center.content-center.q-pa-sm.b-40
            q-btn(round flat color="white" icon="west" @click="$routerKalpa.back()")
            .col.full-height
              .row.fit.items-center.content-center.justify-center
                span(:style=`{fontSize: '18px'}`).text-white.text-bold {{$t('Collections')}}
            q-btn(round flat color="white" icon="more_vert")
    template(v-slot:body)
      div(:style=`{paddingTop: useHeader ? '76px' : '0px',}`).row.full-width.items-start.content-start
        //- bookmark editor
        q-dialog(
          v-model="bookmarkEditorShow"
          :full-width="$q.screen.xs"
          :full-height="$q.screen.xs"
          :maximized="$q.screen.xs"
          :square="$q.screen.xs"
          @hide="bookmarkSelected = null")
          bookmark-editor(
            :bookmark="bookmarkSelected"
            @close="bookmarkEditorShow = false, bookmarkSelected = null")
        //- search bar
        .row.full-width.justify-center.q-px-sm
          div(:style=`{maxWidth: $store.state.ui.pageWidth+'px',}`).row.full-width
            q-input(
              v-model="searchString"
              borderless dark
              :placeholder="$t('Search')"
              :input-style=`{
              padding: '16px',
              background: 'rgb(40,40,40)',
              borderRadius: '10px',
            }`
            ).full-width
        //- tabs sticky
        .row.full-width.justify-center
          div(
            :style=`{
            position: 'sticky', top: '0px', zIndex: 1000, maxWidth: $store.state.ui.pageWidth+'px'
          }`).row.full-width.b-30
            q-tabs(
              v-model="collectionsModel.collectionId"
              switch-indicator no-caps dense
              active-color="green"
            ).full-width.text-grey-8
              // add collection btn
              add-collection-btn(v-model="collectionsModel")
              q-tab(
                v-for="(c,ci) in collectionsModel.collections" :key="c.id"
                :name="c.id" :label="c.name")
        //- tab panels
        q-tab-panels(
          v-model="collectionsModel.collectionId"
          :swipeable="$q.platform.is.mobile"
          :animated="$q.platform.is.mobile"
          :style=`{}`).full-width.b-30
          q-tab-panel(
            v-for="(c,ci) in collectionsModel.collections" :key="c.id" :name="c.id"
            :style=`{
            background: 'none',
            minHeight: '70vh',
          }`
          ).row.full-width.items-start.content-start.justify-center.q-pa-sm
            list-feed(
              :query="query"
              nextSize=24
              :itemMiddlePersist="false"
              screenSize=100
              :style=`{
              maxWidth: $store.state.ui.pageWidth+'px',
            }`)
              template(v-slot:item=`{item:bookmark,itemIndex:bookmarkIndex,isActive,isVisible}`)
                bookmark-list-item(
                  :bookmark="bookmark"
                  :mode="mode"
                  @bookmark="bookmarkSelectHandle"
                ).q-mb-sm
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import bookmarkListItem from 'src/components/bookmark/bookmark_list_item.vue'
import bookmarkEditor from 'src/components/bookmark/bookmark_editor.vue'
import {assert} from 'src/system/utils'

export default {
  name: 'workspace_pageCollections',
  props: {
    height: { type: Number },
    useHeader: { type: Boolean, default: true },
    mode: { type: String },
    collectionFilter: { type: Function },
    collectionId: {type: String, default: ''}
  },
  components: {
    bookmarkListItem,
    bookmarkEditor
  },
  data () {
    return {
      collectionsModel: {collectionId: this.collectionId, collections: []},
      collectionsRes: null,
      bookmarkSelected: null,
      bookmarkEditorShow: false,
      searchString: '',
      newCollectionName: ''
    }
  },
  computed: {
    _height () {
      return this.height || this.$q.screen.height
    },
    // запрос за элементами коллекции
    query () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK,
          type: { $in: ['IMAGE', 'VIDEO', 'BOOK', 'NODE', 'JOINT'] }
        },
        sort: [{ createdAt: 'desc' }]
      }
      if (this.collectionsModel.collectionId !== 'all') {
        // в зависимости от выбранной коллекции фильтровать закладки
        let collection = this.collectionsModel.collections.find(el => el.id === this.collectionsModel.collectionId)
        if (collection) res.selector.id = { $in: collection.bookmarks || [] }
      }
      if (this.searchString.length > 0) {
        let nameRegExp = new RegExp(this.searchString, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
      return res
    },
  },
  methods: {
    async createCollection () {
      assert(this.newCollectionName)
      let collectionInput = {
        name: this.newCollectionName
      }
      let newCollection = await this.$rxdb.set(RxCollectionEnum.WS_COLLECTION, collectionInput)
      this.collectionsModel.collectionId = newCollection.id
      this.newCollectionName = ''
    },
    async removeCollection (id) {
      await this.$rxdb.remove(id)
    },
    bookmarkSelectHandle (bookmark) {
      this.$log('bookmarkSelectHandle', bookmark)
      if (this.mode === 'select') {
        this.$emit('bookmark', bookmark)
      } else {
        this.bookmarkSelected = bookmark
        this.bookmarkEditorShow = true
      }
    }
  },
  async mounted () {
    this.$log('mounted')
  }
}
</script>
