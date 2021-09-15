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
            :navHeaderText="useNavHeader ? $t('Drafts') : ''"
            :searchInputState="searchInputState"
            :searchString="searchString"
            :pages="pages"
            :pageId="pageId"
            :query="query"
            :itemHeightApprox="100"
            :itemMiddlePersist="itemMiddlePersist"
            showAddBtn=true
            @searchString="searchString = $event"
            @pageId="pageId = $event"
            @add="createItem"
          ).row.full-width
            template(v-slot:item=`{item:draft,itemState,itemIndex,isActive,isVisible,isPreload}`)
              draft-list-item(
                :draft="draft"
                :itemState="itemState"
                :itemIndex="itemIndex"
                :mode="mode"
                @draft="draftSelectHandle"
              ).q-mb-sm
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import draftListItem from 'src/components/draft/draft_list_item.vue'

export default {
  name: 'listDrafts',
  props: {
    height: { type: Number },
    useNavHeader: { type: Boolean, default: true },
    searchInputState: { type: String },
    mode: { type: String },
    pagesFilter: { type: Function }
  },
  components: {
    draftListItem
  },
  data () {
    return {
      pageId: 'nodes',
      draftSelected: null,
      searchString: ''
    }
  },
  watch: {
    pageId: {
      // immediate: true,
      handler (to, from) {
        if (this.$route.query.pageId !== to) this.$router.replace({ path: this.$route.path, query: {...this.$route.query, pageId: to }})
      }
    },
    '$route.query.pageId': {
      immediate: true,
      handler (to, from) {
        this.pageId = to || this.pageId
      }
    }
  },
  computed: {
    _height () {
      return this.height || this.$q.screen.height
    },
    pages () {
      let pages = [
        // {id: 'collections', name: this.$t('Collections')},
        { id: 'nodes', name: this.$t('Nodes') },
        { id: 'joints', name: this.$t('Joints') },
        { id: 'blocks', name: this.$t('Blocks') }
      ]
      if (this.pagesFilter) return this.pagesFilter(pages)
      else return pages
    },
    query () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_ANY
        },
        sort: [{ createdAt: 'desc' }]
      }
      // Get types
      if (this.pageId === 'nodes') {
        res.selector.wsItemType = RxCollectionEnum.WS_NODE
      } else if (this.pageId === 'joints') {
        res.selector.wsItemType = RxCollectionEnum.WS_JOINT
      } else if (this.pageId === 'blocks') {
        res.selector.wsItemType = RxCollectionEnum.WS_BLOCK
      } else throw new Error('bad type: ' + this.pageId)
      // Search by name
      if (this.searchString.length > 0) {
        let nameRegExp = new RegExp(this.searchString, 'i')
        res.selector.name = { $regex: nameRegExp }
      }
      return res
    }
  },
  methods: {
    draftSelectHandle (draft) {
      this.$log('draftSelectHandle', draft)
      if (this.mode === 'select') {
        this.$emit('draft', draft)
      } else {
        this.draftSelected = draft
      }
    },
    createItem () {
      // eslint-disable-next-line no-constant-condition
      if (this.pageId === 'blocks') {
        this.$router.push('/workspace/create?mode=block')
      } else if (this.pageId === 'nodes') {
        this.$router.push('/workspace/contents')
      } else {
        this.$notify('warn', this.$t('not implemented'))
      }
    }
  }
}
</script>
