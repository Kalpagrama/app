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
          :navHeaderText="useNavHeader ? $t('Contents') : ''"
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
          template(v-slot:item=`{item:bookmark,itemState,itemIndex,isActive,isVisible,isPreload}`)
            bookmark-list-item(
              :bookmark="bookmark"
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

export default {
  name: 'listContents',
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
      pageId: 'video',
      bookmarkSelected: null,
      bookmarkEditorShow: false,
      searchString: '',
    }
  },
  computed: {
    pages () {
      return [
        // {id: 'collections', name: this.$t('Collections')},
        {id: 'video', name: this.$t('Video')},
        {id: 'book', name: this.$t('Books')},
        {id: 'image', name: this.$t('Images')}
      ]
    },
    query () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_CONTENT,
        },
        sort: [{createdAt: 'desc'}]
      }
      // Get types
      if (this.pageId === 'video') {
        res.selector.type = 'VIDEO'
      }
      else if (this.pageId === 'book') {
        res.selector.type = 'BOOK'
      }
      else if (this.pageId === 'image') {
        res.selector.type = 'IMAGE'
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
