<template lang="pug">
  div(:style=`{position: 'relative'}`).row.full-width.items-start.content-start
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

    transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
      div(v-if="showHeader" :style=`{position: 'absolute', zIndex: 1000, top: '0px', left: '0px'}`).row.full-width.items-center.content-center.justify-center
        q-resize-observer(@resize="headerHeight = $event.height")
        //- search bar
        div(v-if="searchStringShow").row.full-width.justify-center.q-px-sm
          div(:style=`{maxWidth: $store.state.ui.pageWidth+'px',}`).row.full-width
            q-input(
              v-model="searchString"
              borderless dark
              :placeholder="$t('Search')"
              :input-style=`{
                      padding: '16px',
                      background: 'rgb(40,40,40)',
                      borderRadius: '10px',
                    }`
            ).full-width
        //- tabs sticky
        .row.full-width.q-px-md.b-30
          q-tabs(
            v-model="pageInfo.pageId"
            :switch-indicator="false"
            no-caps dense
            active-color="green"
          ).full-width.text-grey-8
            q-tab(
              v-for="(p,pi) in pageInfo.pages" :key="p.id"
              :name="p.id" :label="p.name")

    //- tab panels
    q-tab-panels(
      v-model="pageInfo.pageId"
      :swipeable="$q.platform.is.mobile"
      :animated="$q.platform.is.mobile").full-width.b-30
      q-tab-panel(
        v-for="(p,pi) in pageInfo.pages" :key="p.id" :name="p.id"
        :style=`{
            background: 'none',
          }`
      ).row.full-width.items-start.content-start.justify-center.q-pa-none
        list-feed(
          :scrollAreaHeight="scrollAreaHeight"
          :query="query"
          nextSize=50
          :itemMiddlePersist="false"
          screenSize=100
          :style=`{maxWidth: $store.state.ui.pageWidth+'px'}`
          @showHeader="showHeader = $event")
          template(v-slot:prepend)
            div(:style=`{height: headerHeight + 'px' }`).row.full-width
          template(v-slot:append)
            div(v-if="$store.state.ui.mobileMenuShown" :style=`{height: '65px' }`).row.full-width
          template(v-slot:item=`{item,itemIndex,isActive,isVisible}`)
            div(
              @click="onSelected(item)"
              :style=`{
                  background: 'rgb(35,35,35)',
                  borderRadius: '10px',
                }`
            ).row.full-width.items-start.content-start.q-mb-sm
              img(
                v-if="!['WORD', 'SENTENCE', 'SPHERE'].includes(item.type)"
                draggable="false"
                :src="item.thumbUrl"
                :style=`{
                      height: '60px',
                      minWidth: '90px',
                      maxWidth: '90px',
                      borderRadius: '10px',
                      objectFit: 'cover',
                    }`).b-50.q-mt-sm.q-ml-sm.q-mb-sm
              div(
                v-else
                :style=`{width: '90px', height: '60px',}`
              ).row.items-center.content-center.justify-center.q-mt-sm.q-ml-sm.q-mb-sm
                q-icon(name="blur_on" size="60px" color="white")
              .col.full-height
                .row.fit.items-between.content-between.q-pa-sm
                  .row.full-width
                    span.text-white.q-pt-sm {{ item.name }}
                  .row.full-width
                    small.text-grey-8 {{ itemType(item) }}
  //kalpa-layout
  //  template(v-slot:header)
  //    div(
  //      v-if="useNavHeader"
  //    ).row.full-width.justify-center.b-30
  //      div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
  //        div(
  //          :style=`{
  //          height: '60px',
  //          borderRadius: '10px',
  //        }`
  //        ).row.full-width.items-center.content-center.q-pa-sm.b-40
  //          q-btn(round flat color="white" icon="west" @click="$routerKalpa.back()")
  //          .col.full-height
  //            .row.fit.items-center.content-center.justify-center
  //              span(:style=`{fontSize: '18px'}`).text-white.text-bold {{$t('Search')}}
  //          q-btn(round flat color="white" icon="more_vert")
  //  template(v-slot:body)
  //    .row.full-width.items-start.content-start
  //      //- bookmark editor
  //      q-dialog(
  //        v-model="bookmarkEditorShow"
  //        :full-width="$q.screen.xs"
  //        :full-height="$q.screen.xs"
  //        :maximized="$q.screen.xs"
  //        :square="$q.screen.xs"
  //        @hide="bookmarkSelected = null")
  //        bookmark-editor(
  //          :bookmark="bookmarkSelected"
  //          @close="bookmarkEditorShow = false, bookmarkSelected = null")
  //
  //      transition(enter-active-class="animated slideInDown" leave-active-class="animated slideOutUp")
  //        div(v-if="showHeader" :style=`{position: 'absolute', zIndex: 1000, top: '0px', left: '0px'}`).row.full-width.items-center.content-center.justify-center
  //          q-resize-observer(@resize="headerHeight = $event.height")
  //          //- search bar
  //          div(v-if="searchStringShow").row.full-width.justify-center.q-px-sm
  //            div(:style=`{maxWidth: $store.state.ui.pageWidth+'px',}`).row.full-width
  //              q-input(
  //                v-model="searchString"
  //                borderless dark
  //                :placeholder="$t('Search')"
  //                :input-style=`{
  //                    padding: '16px',
  //                    background: 'rgb(40,40,40)',
  //                    borderRadius: '10px',
  //                  }`
  //              ).full-width
  //          //- tabs sticky
  //          .row.full-width.q-px-md.b-30
  //            q-tabs(
  //              v-model="pageInfo.pageId"
  //              :switch-indicator="false"
  //              no-caps dense
  //              active-color="green"
  //            ).full-width.text-grey-8
  //              q-tab(
  //                v-for="(p,pi) in pageInfo.pages" :key="p.id"
  //                :name="p.id" :label="p.name")
  //
  //      //- tab panels
  //      q-tab-panels(
  //        v-model="pageInfo.pageId"
  //        :swipeable="$q.platform.is.mobile"
  //        :animated="$q.platform.is.mobile"
  //        :style=`{}`).full-width.b-30
  //        q-tab-panel(
  //          v-for="(p,pi) in pageInfo.pages" :key="p.id" :name="p.id"
  //          :style=`{
  //          background: 'none',
  //          minHeight: '70vh',
  //        }`
  //        ).row.full-width.items-start.content-start.justify-center.q-pa-none
  //          list-feed(
  //            :scrollAreaHeight="scrollAreaHeight"
  //            :query="query"
  //            nextSize=50
  //            :itemMiddlePersist="false"
  //            screenSize=100
  //            :style=`{maxWidth: $store.state.ui.pageWidth+'px'}`
  //            @showHeader="showHeader = $event")
  //            template(v-slot:prepend)
  //              div(:style=`{height: headerHeight + 'px' }`).row.full-width
  //            template(v-slot:append)
  //              div(v-if="$store.state.ui.mobileMenuShown" :style=`{height: '65px' }`).row.full-width
  //            template(v-slot:item=`{item,itemIndex,isActive,isVisible}`)
  //              div(
  //                @click="onSelected(item)"
  //                :style=`{
  //                background: 'rgb(35,35,35)',
  //                borderRadius: '10px',
  //              }`
  //              ).row.full-width.items-start.content-start.q-mb-sm
  //                img(
  //                  v-if="!['WORD', 'SENTENCE', 'SPHERE'].includes(item.type)"
  //                  draggable="false"
  //                  :src="item.thumbUrl"
  //                  :style=`{
  //                    height: '60px',
  //                    minWidth: '90px',
  //                    maxWidth: '90px',
  //                    borderRadius: '10px',
  //                    objectFit: 'cover',
  //                  }`).b-50.q-mt-sm.q-ml-sm.q-mb-sm
  //                div(
  //                  v-else
  //                  :style=`{width: '90px', height: '60px',}`
  //                ).row.items-center.content-center.justify-center.q-mt-sm.q-ml-sm.q-mb-sm
  //                  q-icon(name="blur_on" size="60px" color="white")
  //                .col.full-height
  //                  .row.fit.items-between.content-between.q-pa-sm
  //                    .row.full-width
  //                      span.text-white.q-pt-sm {{ item.name }}
  //                    .row.full-width
  //                      small.text-grey-8 {{ itemType(item) }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import bookmarkListItem from 'src/components/bookmark/bookmark_list_item.vue'
import bookmarkEditor from 'src/components/bookmark/bookmark_editor.vue'
import { assert } from 'src/system/common/utils'
import {objectTypeName, objectUrl} from '../../../system/common/object_info';

export default {
  name: 'pageSearch',
  components: {
    bookmarkListItem,
    bookmarkEditor
  },
  props: {
    pageInfo: {
      type: Object,
      default() {
        return {
          pages: [
            { id: 'all', name: this.$t('All') },
            { id: 'nodes', name: this.$t('Nodes') },
            { id: 'joints', name: this.$t('Joints') },
            { id: 'blocks', name: this.$t('Blocks') },
            { id: 'contents', name: this.$t('Contents') },
            { id: 'users', name: this.$t('Users') },
            { id: 'spheres', name: this.$t('Spheres') }
          ],
          pageId: 'all'
        }
      }
    },
    scrollAreaHeight: { type: Number },
    useNavHeader: { type: Boolean, default: true },
    searchString: { type: String, default: '' },
    searchStringShow: { type: Boolean, default: true },
    mode: { type: String },
    pagesFilter: { type: Function }
  },
  watch: {
    'pageInfo.pageId': {
      immediate: true,
      handler (to, from) {
        this.showHeader = true
      }
    }
  },
  data () {
    return {
      bookmarkSelected: null,
      bookmarkEditorShow: false,
      headerHeight: 0,
      showHeader: true
    }
  },
  computed: {
    query () {
      let objectTypes
      if (this.pageInfo.pageId === 'all') {
        objectTypes = ['VIDEO', 'IMAGE', 'BOOK', 'NODE', 'BLOCK', 'USER', 'JOINT', 'WORD', 'SENTENCE', 'CHAR']
      } else if (this.pageInfo.pageId === 'nodes') {
        objectTypes = ['NODE']
      } else if (this.pageInfo.pageId === 'joints') {
        objectTypes = ['JOINT']
      } else if (this.pageInfo.pageId === 'blocks') {
        objectTypes = ['BLOCK']
      } else if (this.pageInfo.pageId === 'contents') {
        objectTypes = ['VIDEO', 'IMAGE', 'BOOK']
      } else if (this.pageInfo.pageId === 'users') {
        objectTypes = ['USER']
      } else if (this.pageInfo.pageId === 'spheres') {
        objectTypes = ['WORD', 'SENTENCE', 'CHAR']
      } else throw new Error('bad pageInfo.pageId: ' + this.pageInfo.pageId)

      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SEARCH,
          objectTypeEnum: { $in: objectTypes },
          querySearch: this.searchString || 'any_random_values',
        },
        populateObjects: false,
        limit: 150
      }
    },
  },
  methods: {
    itemType(item) {
      return objectTypeName(item)
    },
    itemLink (item) {
      // this.$log('itemLink', item)
      if (item.wsItemType) {
        // confirm('Open in workspace?')
        return '/trends'
      }
      else {
        return objectUrl(item)
      }
    },
    onSelected(item) {
      if (this.mode === 'select') {
        this.$emit('item', item)
      } else {
        this.$router.push(this.itemLink(item))
      }
    }
  },
  mounted () {
    // this.$logW('this.$q.screen.height', this.$q.screen.height)
    // this.$logW('this.scrollAreaHeight', this.scrollAreaHeight)
  }
}
</script>
