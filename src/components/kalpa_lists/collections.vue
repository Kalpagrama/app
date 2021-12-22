<template lang="pug">
.row.full-width.items-start.content-start.justify-center
  div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
    //- bookmark editor
    q-dialog(
      v-model="bookmarkEditorShow"
      :full-width="$q.screen.xs"
      :full-height="$q.screen.xs"
      position="bottom"
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
      :itemActivePersist="itemActivePersist"
      @searchString="searchString = $event"
      @pageId="pageId = $event"
    ).row.full-width
      template(v-slot:stickyHeaderTop)
        div(:style=`{
          maxWidth: $store.state.ui.pageWidth+'px',
          maxHeight: '145px',
          }`).row.full-width.text-grey-8.wrap.justify-start.scroll.q-px-sm
          // add collection btn
          add-collection-btn(v-model="collectionsModel")
          q-chip(
            v-for="(c,ci) in collectionsModel.wsSpheres" :key="c.id"
            clickable outline
            :name="c.id" :label="getCollectionNameWithCnt(c)"
            :color="collectionsModel.wsSphereId==c.id ? 'green' : 'grey-8'"
            @click="collectionsModel.wsSphereId=c.id")
      template(v-slot:item=`{item:bookmark,itemState,itemIndex,isActive,isVisible,isPreload, scrolling}`)
        bookmark-list-item(
          :item="bookmark"
          :itemState="itemState"
          :itemIndex="itemIndex"
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
    itemActivePersist: { type: Boolean, default: false },
    searchInputState: { type: String },
    searchString: { type: String, default: '' },
    mode: { type: String },
    wsSphereId: { type: String, default: '' },
    pageFilter: { type: Object},
  },
  components: {
    bookmarkListItem,
    bookmarkEditor
  },
  data () {
    return {
      collectionsModel: { wsSphereId: null, wsSpheres: [] },
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
        { id: 'blocks', name: this.$t('Blocks') },
        { id: 'contents', name: this.$t('Contents') },
      ].filter(p => !this?.pageFilter?.whiteList || this?.pageFilter?.whiteList.includes(p.id))
    },
    // запрос за элементами коллекции
    query () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK,
          type: { $in: ['IMAGE', 'VIDEO', 'BOOK', 'NODE', 'JOINT', 'BLOCK'] }
        },
        sort: [{ createdAt: 'desc' }]
      }
      if (this.collectionsModel.wsSphereId !== 'all') {
        // в зависимости от выбранной коллекции фильтровать закладки
        let wsSphere = this.collectionsModel.wsSpheres.find(el => el.id === this.collectionsModel.wsSphereId)
        if (wsSphere) res.selector.id = { $in: wsSphere.wsSphereItems || [] }
      }
      if (this.pageId === 'nodes') {
        res.selector.type = { $in: ['NODE'] }
      } else if (this.pageId === 'joints') {
        res.selector.type = { $in: ['JOINT'] }
      } else if (this.pageId === 'blocks') {
        res.selector.type = { $in: ['BLOCK'] }
      } else if (this.pageId === 'contents') {
        res.selector.type = { $in: ['IMAGE', 'VIDEO', 'BOOK'] }
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
        name: this.newCollectionName,
        isCollection: true
      }
      let newCollection = await this.$rxdb.set(RxCollectionEnum.WS_SPHERE, collectionInput)
      this.collectionsModel.wsSphereId = newCollection.id
      this.newCollectionName = ''
    },
    async removeCollection (id) {
      await this.$rxdb.remove(id)
    },
    getCollectionNameWithCnt (wsSphere) {
      if (wsSphere.id === 'all') return wsSphere.name
      else return wsSphere.name + `(${wsSphere?.wsSphereItems?.length || 0})`
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
    'collectionsModel.wsSphereId': {
      handler (to, from) {
        if (!this.searchString) this.searchInputShow = false
        if (this.itemActivePersist) this.$store.commit('ui/stateSet', ['pageIdCollectionCollections', to])
      }
    },
    pageId: {
      handler (to, from) {
        if (!this.searchString) this.searchInputShow = false
        if (this.itemActivePersist) this.$store.commit('ui/stateSet', ['pageIdCollections', to])
      }
    },
  },
  async mounted () {
    let pageId, pageCollectionId
    if (this.itemActivePersist) {
      pageId = this.pages.find(p => p.id === this.$store.state.ui.pageIdCollections)?.id
      pageCollectionId = this.$store.state.ui.pageIdCollectionCollections
    }
    this.pageId = pageId || (this.pages ? this.pages[0]?.id : null)
    this.collectionsModel.wsSphereId = this.wsSphereId || pageCollectionId || this.collectionsModel.wsSphereId
  }
}
</script>
