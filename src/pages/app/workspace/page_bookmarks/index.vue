<template lang="pug">
kalpa-layout(
  :height="height")
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
              span(:style=`{fontSize: '18px'}`).text-white.text-bold Закладки
          q-btn(round flat color="white" icon="more_vert")
  template(v-slot:body)
    .row.full-width.items-start.content-start
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
      div(
        ).row.full-width.justify-center.q-px-sm
        div(:style=`{maxWidth: $store.state.ui.pageWidth+'px',}`).row.full-width
          q-input(
            v-model="searchString"
            borderless dark
            :placeholder="$tt('Search')"
            :input-style=`{
              padding: '16px',
              background: 'rgb(40,40,40)',
              borderRadius: '10px',
            }`
            ).full-width
      //- tabs sticky
      div(
        :style=`{
          position: 'sticky', top: '0px', zIndex: 1000,
        }`).row.full-width.q-px-md.b-30
        q-tabs(
          v-model="pageId"
          switch-indicator no-caps dense
          active-color="green"
          ).full-width.text-grey-8
          q-tab(
            v-for="(p,pi) in pages" :key="p.id"
            :name="p.id" :label="p.name")
      //- tab panels
      q-tab-panels(
        v-model="pageId"
        :swipeable="$q.platform.is.mobile"
        :animated="$q.platform.is.mobile"
        :style=`{}`).full-width.b-30
        q-tab-panel(
          v-for="(p,pi) in pages" :key="p.id" :name="p.id"
          :style=`{
            background: 'none',
            minHeight: '70vh',
          }`
          ).row.full-width.items-start.content-start.justify-center.q-pa-sm
          list-feed(
            :query="query"
            :itemsPerPage="24"
            :itemMiddlePersist="false"
            :itemsMax="100"
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

import bookmarkListItem from 'components/bookmark/bookmark_list_item.vue'
import bookmarkEditor from 'components/bookmark/bookmark_editor.vue'

export default {
  name: 'workspace_pageBookmarks',
  props: {
    height: {type: Number},
    useHeader: {type: Boolean, default: true},
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
      let pages = [
        {id: 'content', name: this.$tt('Media')},
        {id: 'nodes', name: this.$tt('Nodes')},
        {id: 'joints', name: this.$tt('Joints')},
        {id: 'spheres', name: this.$tt('Spheres')}
      ]
      return pages
    },
    query () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK,
        },
        sort: [{createdAt: 'desc'}]
      }
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
      return res
    }
  },
  methods: {
    bookmarkSelectHandle (bookmark) {
      this.$log('bookmarkSelectHandle', bookmark)
      if (this.mode === 'select') {
        this.$emit('bookmark', bookmark)
      }
      else {
        this.bookmarkSelected = bookmark
        this.bookmarkEditorShow = true
      }
    }
  }
}
</script>
