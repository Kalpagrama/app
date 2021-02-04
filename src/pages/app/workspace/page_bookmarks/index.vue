<template lang="pug">
q-layout(
  view="hHh Lpr lff").b-30
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
  q-header(reveal)
    .row.full-width.justify-center.q-px-sm.q-pt-sm.b-30
      div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
        div(
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
  q-page-container
    q-page(
      :style=`{
        paddingTop: '40px',
        paddingBottom: '100px',
      }`)
      q-tab-panels(
        v-model="pageId"
        :swipeable="$q.platform.is.mobile"
        :animated="$q.platform.is.mobile"
        :style=`{}`).b-30
        q-tab-panel(
          v-for="(p,pi) in pages" :key="p.id" :name="p.id"
          :style=`{
            background: 'none',
            minHeight: '70vh',
          }`
          ).row.full-width.items-start.content-start.justify-center.q-pa-sm
          list-feed(
            :query="query"
            :positionSaving="false"
            :style=`{
              maxWidth: $store.state.ui.pageWidth+'px',
            }`)
            template(v-slot:item=`{item:bookmark,itemIndex:bookmarkIndex,isActive,isVisible}`)
              bookmark-item(
                :bookmark="bookmark"
                @bookmark="bookmarkSelectHandle"
                ).q-mb-sm
      q-page-sticky(
        expand position="top-left" :offset="[0, 0]").row.full-width.q-px-md.b-30
        q-tabs(
          v-model="pageId"
          switch-indicator no-caps dense
          active-color="green"
          ).full-width.text-grey-8
          q-tab(
            v-for="(p,pi) in pages" :key="p.id"
            :name="p.id" :label="p.name")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import bookmarkItem from './bookmark_item.vue'
import bookmarkEditor from './bookmark_editor.vue'

export default {
  name: 'workspace_bookmarks',
  components: {
    bookmarkItem,
    bookmarkEditor,
  },
  data () {
    return {
      pageId: 'content',
      bookmarkSelected: null,
      bookmarkEditorShow: false,
    }
  },
  computed: {
    pages () {
      return [
        {id: 'content', name: 'Медиа'},
        {id: 'nodes', name: 'Ядра'},
        {id: 'joints', name: 'Связи'},
        {id: 'spheres', name: 'Сферы'}
      ]
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
      this.bookmarkSelected = bookmark
      this.bookmarkEditorShow = true
    }
  }
}
</script>
