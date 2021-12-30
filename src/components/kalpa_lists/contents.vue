<template lang="pug">
.row.full-width.items-start.content-start.justify-center
  div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
    //- content editor
    q-dialog(
      v-model="contentCardEditorShow"
      :maximized="$q.screen.xs"
      @hide="contentCardEditorContentOid = null, $router.replace('/workspace/contents')")
      content-card-editor(
        v-if="contentCardEditorContentOid"
        :showBottomMenu="false"
        :contentOid="contentCardEditorContentOid"
        @close="contentCardEditorShow = false, contentCardEditorContentOid = null")
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
        widget-upload(@uploaded="onUploadComplete($event)").q-mt-sm
      template(v-slot:stickyHeaderTop)
        div(:style=`{
        maxWidth: $store.state.ui.pageWidth+'px',
        maxHeight: '145px',
        }`).row.full-width.text-grey-8.wrap.justify-start.scroll.q-px-sm
          // add collection btn
          q-chip(
            v-for="(c,ci) in categories" :key="c.id"
            clickable outline
            :name="c.id" :label="c.name"
            :color="categoryId===c.id ? 'green' : 'grey-8'"
            @click="categoryId=c.id")
      template(v-slot:item=`{item:bookmark,itemState,itemIndex,isActive,isVisible,isPreload, scrolling}`)
        bookmark-list-item(
          :item="bookmark"
          :itemState="itemState"
          :itemIndex="itemIndex"
          :mode="mode"
          @item="bookmarkOptionsClickHandle"
        ).q-mb-sm
      template(v-slot:nodata)
        nodata-guard(
          :button="nodataGuardParams.button"
          :icon="nodataGuardParams.icon"
          :title="nodataGuardParams.title"
          :message="nodataGuardParams.message"
          :buttonName="nodataGuardParams.buttonName"
          :clickPath="nodataGuardParams.clickPath"
        )
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import bookmarkListItem from 'src/components/bookmark/bookmark_list_item.vue'
import contentCardEditor from 'src/components/kalpa_item/item_card/editor/content.vue'
import bookmarkEditor from 'src/components/bookmark/bookmark_editor.vue'
import widgetUpload from 'src/pages/app/workspace/page_home/widget_upload/index.vue'
import nodataGuard from 'src/components/kalpa_guard/nodata_guard'
import { assert } from 'src/system/common/utils'
import cloneDeep from 'lodash/cloneDeep'

export default {
  name: 'listContents',
  props: {
    scrollAreaHeight: { type: Number },
    useNavHeader: {type: Boolean, default: true},
    searchInputState: {type: String},
    mode: {type: String, default: 'edit'},
  },
  components: {
    bookmarkListItem,
    bookmarkEditor,
    contentCardEditor,
    widgetUpload,
    nodataGuard,
  },
  data () {
    return {
      categoryId: 'uploaded',
      pageId: 'video',
      bookmarkSelected: null,
      bookmarkEditorShow: false,
      contentCardEditorContentOid: null,
      contentCardEditorShow: false,
      searchString: ''
    }
  },
  computed: {
    categories () {
      return [
        // {id: 'collections', name: this.$t('Collections')},
        {id: 'uploaded', name: this.$t('Загруженный'), rxCollectionEnum: RxCollectionEnum.WS_CONTENT, filter: {}},
        {id: 'paid', name: this.$t('Платный'), rxCollectionEnum: RxCollectionEnum.WS_CONTENT, filter: {'payInfo.price': {$gt: 0}}},
        {id: 'bought', name: this.$t('Купленный'), rxCollectionEnum: RxCollectionEnum.WS_CONTENT, filter: {'payInfo.paid': true}},
        {id: 'bookmarked', name: this.$t('В закладках'), rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK, filter: {}}
      ]
    },
    pages () {
      return [
        // {id: 'collections', name: this.$t('Collections')},
        {id: 'video',
          name: this.$t('Video'),
          type: 'VIDEO',
          nodataGuardParams: {
            icon: 'theaters',
            button: true,
            message: this.$t('Видео которые Вы загрузите появятся здесь'),
            buttonName: this.$t('Загрузить'),
            title: this.$t('Здесь пока ничего нет'),
            clickPath: '/workspace/edit?mode=upload',
          }},
        {id: 'book',
          name: this.$t('Books'),
          type: 'BOOK',
          nodataGuardParams: {
            icon: 'menu_book',
            button: true,
            message: this.$t('Книги которые Вы загрузите появятся здесь'),
            buttonName: this.$t('Загрузить'),
            title: this.$t('Здесь пока ничего нет'),
            clickPath: '/workspace/edit?mode=upload',
          }},
        {id: 'image',
          name: this.$t('Images'),
          type: 'IMAGE',
          nodataGuardParams: {
            icon: 'o_image',
            button: true,
            message: this.$t('Изображения которые Вы загрузите появятся здесь'),
            buttonName: this.$t('Загрузить'),
            title: this.$t('Здесь пока ничего нет'),
            clickPath: '/workspace/edit?mode=upload',
          }},
      ]
    },
    nodataGuardParams() {
      return this.pages.find(page => page.id === this.pageId).nodataGuardParams
    },
    query () {
      let res = {
        selector: {
          rxCollectionEnum: this.categories.find(p => p.id === this.categoryId).rxCollectionEnum,
          type: this.pages.find(p => p.id === this.pageId).type,
          ...(this.categories.find(p => p.id === this.categoryId).filter)
        },
        sort: [{createdAt: 'desc'}]
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
    '$route.query.pageId': {
      immediate: true,
      handler(to) {
        if (to) {
          assert(this.pages.find(p => p.id === to))
          this.pageId = to
        }
      }
    },
    '$route.query.categoryId': {
      immediate: true,
      handler(to) {
        if (to) {
          assert(this.categories.find(p => p.id === to))
          this.categoryId = to
        }
      }
    },
    pageId: {
      immediate: true,
      async handler(to) {
        if (this.$route.query.pageId !== to) await this.$router.replace({ path: this.$route.path, query: {...this.$route.query, pageId: to, categoryId: this.categoryId }})
      }
    },
    categoryId: {
      immediate: true,
      async handler(to) {
        if (this.$route.query.categoryId !== to) await this.$router.replace({ path: this.$route.path, query: {...this.$route.query, categoryId: to, pageId: this.pageId }})
      }
    }
  },
  methods: {
    onUploadComplete (contentKalpa) {
      assert(contentKalpa)
      this.$logT('onUploadComplete', cloneDeep(contentKalpa))
      if (this.mode === 'select') {
        // this.$emit('item', bookmark)
      }
      else {
        if (contentKalpa && contentKalpa.contentAuthor && contentKalpa.contentAuthor.oid === this.$store.getters.currentUser.oid) {
          this.contentCardEditorContentOid = contentKalpa.oid
          this.contentCardEditorShow = true
        } else {
          this.$router.push('/content/' + contentKalpa.oid)
        }
      }
    },
    bookmarkOptionsClickHandle (bookmark) {
      assert(bookmark && bookmark.oid)
      if (this.categoryId.in('uploaded', 'paid')){
        this.contentCardEditorContentOid = bookmark.oid
        this.contentCardEditorShow = true
      } else if (this.categoryId.in('bookmarked')){
        this.bookmarkSelected = bookmark
        this.bookmarkEditorShow = true
      }
    }
  }
}
</script>
