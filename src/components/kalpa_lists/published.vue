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
        :scrollAreaHeight="scrollAreaHeight || $q.screen.height"
        :navHeaderText="useNavHeader ? $t('Published') : ''"
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
        template(v-slot:item=`{item:bookmark,itemState,itemIndex,isActive,isVisible,isPreload, scrolling}`)
          //q-btn(:label="bookmarkIndex + '::' + bookmark.name", size="xl").full-width
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

export default {
  name: 'listPublished',
  props: {
    scrollAreaHeight: { type: Number },
    useNavHeader: { type: Boolean, default: true },
    itemActivePersist: { type: Boolean, default: false },
    searchInputState: { type: String },
    searchString: { type: String, default: '' },
    mode: { type: String },
    pageFilter: { type: Object }
  },
  components: {
    bookmarkListItem,
    bookmarkEditor
  },
  data () {
    return {
      pageId: null,
      bookmarkSelected: null,
      bookmarkEditorShow: false,
      showHeader: true,
      searchInputShow: false,
      headerHeight1: 0,
      headerHeight2: 0
    }
  },
  watch: {
    scrollAreaHeight: {
      immediate: true,
      handler (to, from) {
        // this.$logW('scrollAreaHeight=', to)
      }
    },
    pageId: {
      handler (to, from) {
        if (!this.searchString) this.searchInputShow = false
        if (this.itemActivePersist) this.$store.commit('ui/stateSet', ['pageIdPublished', to])
      }
    },
    searchString: {
      handler (to, from) {
        this.searchInputShow = !!to
      }
    },
    collectionId: {
      immediate: true,
      handler (to, from) {
        this.showHeader = true
      }
    }
  },
  computed: {
    pages () {
      return [
        { id: 'all', name: this.$t('All') },
        { id: 'nodes', name: this.$t('Nodes') },
        { id: 'joints', name: this.$t('Joints') },
        { id: 'blocks', name: this.$t('Blocks') }
      ].filter(p => !this?.pageFilter?.whiteList || this?.pageFilter?.whiteList.includes(p.id))
    },
    query () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_PUBLISHED
        },
        sort: [{ createdAt: 'desc' }]
      }
      // Get types
      if (this.pageId === 'nodes') {
        res.selector.type = { $in: ['NODE'] }
      } else if (this.pageId === 'joints') {
        res.selector.type = { $in: ['JOINT'] }
      } else if (this.pageId === 'blocks') {
        res.selector.type = { $in: ['BLOCK'] }
      }
      // Search by name
      if (this.searchString.length > 0) {
        let nameRegExp = new RegExp(this.searchString, 'i')
        res.selector.name = { $regex: nameRegExp }
      }
      return res
    }
  },
  methods: {
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
  mounted () {
    let pageId
    if (this.itemActivePersist) pageId = this.pages.find(p => p.id === this.$store.state.ui.pageIdPublished)?.id
    this.pageId = pageId || (this.pages ? this.pages[0]?.id : null)
  }
}
</script>
