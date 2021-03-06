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
      :scrollAreaHeight="scrollAreaHeight || $q.screen.height"
      :navHeaderText="useNavHeader ? $t('Search') : ''"
      :searchInputState="searchInputState"
      :searchString="searchString"
      :pages="pages"
      :pageId="pageId"
      :query="query"
      :itemHeightApprox="100"
      :itemActivePersist="false"
      @searchString="searchString = $event"
      @pageId="pageId = $event"
    ).row.full-width
      template(v-slot:item=`{item:bookmark,itemState,itemIndex,isActive,isVisible,isPreload, scrolling}`)
        bookmark-list-item(
          :item="bookmark"
          :itemState="itemState"
          :itemIndex="itemIndex"
          :mode="mode"
          @item="bookmarkSelectHandle"
          @options="bookmarkOptionsHandle"
        ).q-mb-sm
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import bookmarkListItem from 'src/components/bookmark/bookmark_list_item.vue'
import bookmarkEditor from 'src/components/bookmark/bookmark_editor.vue'

export default {
  name: 'listSearch',
  props: {
    scrollAreaHeight: { type: Number },
    useNavHeader: { type: Boolean, default: true },
    pageId: {type: String, default: 'content'},
    itemActivePersist: { type: Boolean, default: false },
    searchInputState: { type: String },
    searchString: { type: String, default: '' },

    useHeader: {type: Boolean, default: true},
    tabsShow: {type: String, default: true},
    mode: {type: String},
  },
  components: {
    bookmarkListItem,
    bookmarkEditor,
  },
  data () {
    return {
      bookmarkSelected: null,
      bookmarkEditorShow: false,
    }
  },
  computed: {
    pages () {
      return [
        // {id: 'collections', name: this.$t('Collections')},
        {id: 'all', name: this.$t('All')},
        {id: 'published', name: this.$t('Published')},
        {id: 'content', name: this.$t('Media')},
        {id: 'nodes', name: this.$t('Nodes')},
        {id: 'joints', name: this.$t('Joints')},
        {id: 'spheres', name: this.$t('Spheres')},
        {id: 'collections', name: this.$t('Collections')}
      ]
    },
    query () {
      let res = {
        selector: {},
        sort: [{createdAt: 'desc'}]
      }
      if (this.pageId === 'all') {
        res.selector.rxCollectionEnum = RxCollectionEnum.WS_ANY
      } else if (this.pageId === 'published') {
        res.selector.rxCollectionEnum = RxCollectionEnum.WS_PUBLISHED
      } else {
        res.selector.rxCollectionEnum = RxCollectionEnum.WS_BOOKMARK
      }
      // Get types
      if (this.pageId === 'content') {
        res.selector.type = {$in: ['IMAGE', 'VIDEO', 'BOOK']}
      }
      else if (this.pageId === 'nodes') {
        res.selector.type = {$in: ['NODE']}
      }
      else if (this.pageId === 'joints') {
        res.selector.type = {$in: ['JOINT']}
      }
      else if (this.pageId === 'spheres') {
        res.selector.type = {$in: ['SPHERE', 'WORD', 'SENTENCE']}
      }
      // Search by name
      if (this.searchString.length > 0) {
        let nameRegExp = new RegExp(this.searchString, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
      return res
    }
  },
  methods: {
    bookmarkOptionsHandle (bookmark) {
      this.bookmarkSelected = bookmark
      this.bookmarkEditorShow = true
    },
    bookmarkSelectHandle (bookmark) {
      this.$log('bookmarkSelectHandle', bookmark)
      this.$emit('item', bookmark)
    }
  }
}
</script>
