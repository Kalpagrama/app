<template lang="pug">
  kalpa-layout
    template(v-slot:footer)
      kalpa-menu-mobile(v-if="$q.screen.lt.md && !$store.state.ui.userTyping")
    template(v-slot:body)
      .row.full-width.items-start.content-start.justify-center
        div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
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
          tab-list-feed(
            :scrollAreaHeight="(scrollAreaHeight || $q.screen.height)"
            :navHeaderText="useNavHeader ? $t('Collections') : ''"
            :searchInputState="searchInputState"
            :searchString="searchString"
            :pages="pages"
            :pageId="pageId"
            :query="query"
            nextSize=50
            :itemMiddlePersist="false"
            screenSize=100
            @searchString="searchString = $event"
            @pageId="pageId = $event"
          ).row.full-width
            template(v-slot:externalHeader)
              q-tabs(
                v-model="collectionsModel.collectionId"
                switch-indicator="false" no-caps dense
              active-color="green"
                :style=`{maxWidth: $store.state.ui.pageWidth+'px'}`
              ).full-width.text-grey-8
                // add collection btn
                add-collection-btn(v-model="collectionsModel")
                q-tab(
                  v-for="(c,ci) in collectionsModel.collections" :key="c.id"
                  :name="c.id" :label="getCollectionNameWithCnt(c)")
            template(v-slot:item=`{item:bookmark,itemIndex:bookmarkIndex,isActive,isVisible}`)
              bookmark-list-item(
                :bookmark="bookmark"
                :mode="mode"
                @item="bookmarkSelectHandle"
              ).q-mb-sm
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import bookmarkListItem from 'src/components/bookmark/bookmark_list_item.vue'
import bookmarkEditor from 'src/components/bookmark/bookmark_editor.vue'
import { assert } from 'src/system/common/utils'

export default {
  name: 'pageCollections',
  props: {
    scrollAreaHeight: { type: Number },
    useNavHeader: { type: Boolean, default: true },
    searchInputState: { type: String },
    searchString: { type: String, default: '' },
    mode: { type: String },
    collectionId: { type: String, default: '' }
  },
  components: {
    bookmarkListItem,
    bookmarkEditor
  },
  data () {
    return {
      collectionsModel: { collectionId: this.collectionId, collections: [] },
      collectionsRes: null,
      pageId: 'all',
      pages: [
        { id: 'all', name: this.$t('All') },
        { id: 'nodes', name: this.$t('Nodes') },
        { id: 'joints', name: this.$t('Joints') },
        { id: 'blocks', name: this.$t('Blocks') }
      ],
      bookmarkSelected: null,
      bookmarkEditorShow: false,
      newCollectionName: '',
      headerHeight: 0
    }
  },
  computed: {
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
      if (this.pageId === 'nodes') {
        res.selector.type = { $in: ['NODE'] }
      } else if (this.pageId === 'joints') {
        res.selector.type = { $in: ['JOINT'] }
      } else if (this.pageId === 'blocks') {
        res.selector.type = { $in: ['BLOCK'] }
      }
      if (this.searchString.length > 0) {
        let nameRegExp = new RegExp(this.searchString, 'i')
        res.selector.name = { $regex: nameRegExp }
      }
      return res
    }
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
    getCollectionNameWithCnt (collection) {
      if (collection.id === 'all') return collection.name
      else return collection.name + `(${collection?.bookmarks?.length || 0})`
    },
    bookmarkSelectHandle (bookmark) {
      this.$log('bookmarkSelectHandle', bookmark)
      if (this.mode === 'select') {
        this.$emit('item', bookmark)
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
