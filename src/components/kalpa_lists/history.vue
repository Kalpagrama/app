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
        :scrollAreaHeight="scrollAreaHeight || $q.screen.height"
        :navHeaderText="useNavHeader ? $t('History') : ''"
        :searchInputState="searchInputState"
        :searchString="searchString"
        :pages="pages"
        :pageId="pageId"
        :query="query"
        :itemHeightApprox="100"
        :itemMiddlePersist="false"
        @searchString="searchString = $event"
        @pageId="pageId = $event"
      ).row.full-width
        template(v-slot:item=`{item:bookmark,itemState,itemIndex,isActive,isVisible,isPreload, scrolling}`)
          bookmark-list-item(
            :bookmark="bookmark"
            :itemState="itemState"
            :itemIndex="itemIndex"
            :mode="mode"
            :showMenuBtn="false"
            @item="bookmarkSelectHandle"
          ).q-mb-sm
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import bookmarkListItem from 'src/components/bookmark/bookmark_list_item.vue'
import bookmarkEditor from 'src/components/bookmark/bookmark_editor.vue'

export default {
  name: 'listHistory',
  props: {
    scrollAreaHeight: { type: Number },
    useNavHeader: {type: Boolean, default: true},
    searchInputState: {type: String},
    mode: {type: String},
  },
  components: {
    bookmarkListItem,
    bookmarkEditor,
  },
  data () {
    return {
      pageId: 'content',
      bookmarkSelected: null,
      bookmarkEditorShow: false,
      searchString: '',
    }
  },
  computed: {
    pages () {
      return [
        {id: 'all', name: this.$t('All')},
        {id: 'content', name: this.$t('Media')},
        {id: 'nodes', name: this.$t('Nodes')},
        {id: 'joints', name: this.$t('Joints')},
        {id: 'spheres', name: this.$t('Spheres')}
      ]
    },
    query () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_HISTORY,
        },
        sort: [{createdAt: 'desc'}]
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
    bookmarkSelectHandle (bookmark) {
      this.$log('bookmarkSelectHandle', bookmark)
      if (this.mode === 'select') {
        this.$emit('item', bookmark)
      }
      else {
        this.bookmarkSelected = bookmark
        this.bookmarkEditorShow = true
      }
    }
  }
}
</script>
