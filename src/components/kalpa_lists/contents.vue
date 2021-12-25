<template lang="pug">
.row.full-width.items-start.content-start.justify-center
  div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
    //- bookmark editor
    q-dialog(
      v-model="videoEditorShow"
      :maximized="$q.screen.xs"
      @hide="videoEditorContentOid = null, $router.replace('/workspace/contents')")
      video-editor(
        v-if="videoEditorContentOid"
        :showBottomMenu="false"
        :contentOid="videoEditorContentOid"
        @close="videoEditorShow = false, videoEditorContentOid = null")
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
import videoEditor from 'src/components/kalpa_item/item_card/editor/video_editor.vue'
import bookmarkEditor from 'src/components/bookmark/bookmark_editor.vue'
import widgetUpload from 'src/pages/app/workspace/page_home/widget_upload/index.vue'
import nodataGuard from 'src/components/kalpa_guard/nodata_guard'
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
    videoEditor,
    widgetUpload,
    nodataGuard,
  },
  data () {
    return {
      pageId: 'video',
      videoEditorShow: false,
      searchString: '',
      videoEditorContentOid: null
    }
  },
  computed: {
    pages () {
      return [
        // {id: 'collections', name: this.$t('Collections')},
        {id: 'video',
          name: this.$t('Video'),
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
    '$route.params.contentOid': {
      immediate: true,
      handler(to) {
        if (to) {
          this.videoEditorContentOid = to
          this.videoEditorShow = true
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
          this.videoEditorContentOid = bookmark.oid
          this.videoEditorShow = true
        } else {
          this.$router.push('/content/' + bookmark.oid)
        }
      }
    },
    bookmarkOptionsClickHandle (bookmark) {
      assert(bookmark && bookmark.oid)
      this.videoEditorContentOid = bookmark.oid
      this.videoEditorShow = true
    }
  }
}
</script>
