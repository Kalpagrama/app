<template lang="pug">
    .row.full-width.items-start.content-start.justify-center
      div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
        //- bookmark editor
        q-dialog(
          v-model="bookmarkEditorShow"
          @hide="bookmarkSelected = null")
          bookmark-editor(
            :style=`{borderRadius: '20px',}`
            :showBottomMenu="false"
            :hideCollection="ddd"
            :bookmark="bookmarkSelected"
            @close="bookmarkEditorShow = false, bookmarkSelected = null")
            //template(v-slot:bottomMenu)
              //q-btn(label="Открыть" @click="ddd=!ddd")
              //div(v-if="ddd" transition-show="slide-up" transition-hide="slide-down").row
              //  q-input(
              //    v-model="name"
              //    color="green"
              //    borderless dark dense
              //    :placeholder="$t('enter content name', 'Введите название контента')"
              //    :input-style=`{
              //    background: 'rgb(45,45,45)',
              //    borderRadius: '10px',
              //    padding: '10px',
              //    minHeight: '60px',
              //    fontSize: fontSize+'px',
              //    textAlign: 'left',
              //    }`).row.full-width.q-pa-md
              //  q-input(
              //    v-model="name"
              //    borderless dark
              //    ref="nameInput"
              //    type="textarea" autogrow
              //    :placeholder="$t('Введите описание')"
              //    :autofocus="false"
              //    :input-style=`{
              //    background: 'rgb(45,45,45)',
              //    padding: '10px',
              //    borderRadius: '10px',
              //    fontSize: fontSize+'px',
              //    lineHeight: 1.3,
              //    minHeight: '100px',
              //  }`
              //  ).full-width.q-pa-md
              //  .row.full-width.justify-end.q-pr-md
              //    q-btn(outline color="green" :label="$t('Save')")
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
              @item="bookmarkSelectHandle"
            ).q-mb-sm

</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import bookmarkListItem from 'src/components/bookmark/bookmark_list_item.vue'
import bookmarkEditor from 'src/components/bookmark/bookmark_editor.vue'
import widgetUpload from 'src/pages/app/workspace/page_home/widget_upload/index.vue'

export default {
  name: 'listContents',
  props: {
    scrollAreaHeight: { type: Number },
    useNavHeader: {type: Boolean, default: true},
    ddd: {type: Boolean, default: true},
    searchInputState: {type: String},
    mode: {type: String},
  },
  components: {
    bookmarkListItem,
    bookmarkEditor,
    widgetUpload,
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
