<template lang="pug">
.row.full-width.items-start.content-start.justify-center
  div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
    //- bookmark editor
    q-dialog(
      v-model="contentCardEditorShow"
      :maximized="$q.screen.xs"
      @hide="contentCardEditorContentOid = null, $router.replace('/workspace/contents')")
      content-card-editor(
        v-if="contentCardEditorContentOid"
        :showBottomMenu="false"
        :contentOid="contentCardEditorContentOid"
        @close="contentCardEditorShow = false, contentCardEditorContentOid = null")
    tab-list-feed(
      :scrollAreaHeight="scrollAreaHeight || $q.screen.height"
      :navHeaderText="useNavHeader ? $t('Contents') : ''"
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
      template(v-slot:externalHeader)
        widget-upload(@uploaded="bookmarkSelectHandle($event)").q-mt-sm
      template(v-slot:item=`{item:bookmark,itemState,itemIndex,isActive,isVisible,isPreload, scrolling}`)
        bookmark-list-item(
          :item="bookmark"
          :itemState="itemState"
          :itemIndex="itemIndex"
          :mode="mode"
          @item="bookmarkOptionsClickHandle"
        ).q-mb-sm
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import bookmarkListItem from 'src/components/bookmark/bookmark_list_item.vue'
import contentCardEditor from 'src/components/kalpa_item/item_card/editor/content.vue'
import bookmarkEditor from 'src/components/bookmark/bookmark_editor.vue'
import widgetUpload from 'src/pages/app/workspace/page_home/widget_upload/index.vue'
import { assert } from 'src/system/common/utils'

export default {
  name: 'listContents',
  props: {
    scrollAreaHeight: { type: Number },
    useNavHeader: {type: Boolean, default: true},
    ddd: {type: Boolean, default: true},
    searchInputState: {type: String},
    mode: {type: String, default: 'edit'},
  },
  components: {
    bookmarkListItem,
    bookmarkEditor,
    contentCardEditor,
    widgetUpload,
  },
  data () {
    return {
      pageId: 'video',
      contentCardEditorShow: false,
      searchString: '',
      contentCardEditorContentOid: null
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
  watch: {
    '$route.params.pageId': {
      immediate: true,
      handler(to) {
        if (to) {
          assert(to.in('video', 'book', 'image'))
          this.pageId = to
        }
      }
    }
  },
  methods: {
    bookmarkSelectHandle ({ contentKalpa, bookmark }) {
      assert(bookmark)
      this.$log('bookmarkSelectHandle', contentKalpa, bookmark)
      if (this.mode === 'select') {
        this.$emit('item', bookmark)
      }
      else {
        if (contentKalpa && contentKalpa.contentAuthor && contentKalpa.contentAuthor.oid === this.$store.getters.currentUser.oid) {
          this.contentCardEditorContentOid = bookmark.oid
          this.contentCardEditorShow = true
        } else {
          this.$router.push('/content/' + bookmark.oid)
        }
      }
    },
    bookmarkOptionsClickHandle (bookmark) {
      assert(bookmark && bookmark.oid)
      this.contentCardEditorContentOid = bookmark.oid
      this.contentCardEditorShow = true
    }
  }
}
</script>
