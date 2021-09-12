<template lang="pug">
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
      v-if="pageId"
      :scrollAreaHeight="(scrollAreaHeight || $q.screen.height)"
      :navHeaderText="useNavHeader ? $t('Collections') : ''"
      :searchInputState="searchInputState"
      :searchString="searchString"
      :pages="pages"
      :pageId="pageId"
      :query="query"
      :itemHeightApprox="100"
      :itemMiddlePersist="itemMiddlePersist"
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
      template(v-slot:item=`{item:bookmark,itemIndex:bookmarkIndex,isActive,isVisible,isPreload}`)
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
  name: 'listCollections',
  props: {
    scrollAreaHeight: { type: Number },
    useNavHeader: { type: Boolean, default: true },
    itemMiddlePersist: { type: Boolean, default: false },
    searchInputState: { type: String },
    searchString: { type: String, default: '' },
    mode: { type: String },
    collectionId: { type: String, default: '' },
    pageFilter: { type: Object},
  },
  components: {
    bookmarkListItem,
    bookmarkEditor
  },
  data () {
    return {
      collectionsModel: { collectionId: null, collections: [] },
      collectionsRes: null,
      pageId: null,
      bookmarkSelected: null,
      bookmarkEditorShow: false,
      newCollectionName: '',
      headerHeight: 0
    }
  },
  computed: {
    pages() {
      return [
        { id: 'all', name: this.$t('All') },
        { id: 'nodes', name: this.$t('Nodes') },
        { id: 'joints', name: this.$t('Joints') },
        { id: 'blocks', name: this.$t('Blocks') }
      ].filter(p => !this?.pageFilter?.whiteList || this?.pageFilter?.whiteList.includes(p.id))
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
  watch: {
    'collectionsModel.collectionId': {
      handler (to, from) {
        if (!this.searchString) this.searchInputShow = false
        if (this.itemMiddlePersist) this.$store.commit('ui/stateSet', ['pageIdCollectionCollections', to])
      }
    },
    pageId: {
      handler (to, from) {
        if (!this.searchString) this.searchInputShow = false
        if (this.itemMiddlePersist) this.$store.commit('ui/stateSet', ['pageIdCollections', to])
      }
    },
  },
  async mounted () {
    let pageId, pageCollectionId
    if (this.itemMiddlePersist) {
      pageId = this.pages.find(p => p.id === this.$store.state.ui.pageIdCollections)?.id
      pageCollectionId = this.$store.state.ui.pageIdCollectionCollections
    }
    this.pageId = pageId || (this.pages ? this.pages[0]?.id : null)
    this.collectionsModel.collectionId = this.collectionId || pageCollectionId || this.collectionsModel.collectionId
  }
}
</script>
