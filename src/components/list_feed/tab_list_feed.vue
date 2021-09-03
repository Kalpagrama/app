<template lang="pug">
  div(:style=`{position: 'relative'}`)
    //- nav header
    div(v-if="navHeaderText").row.full-width.justify-center.q-px-sm.q-py-sm.b-30
      q-resize-observer(@resize="navHeaderHeight = $event.height")
      div( :style=`{ height: '60px', borderRadius: '10px'}`).row.full-width.items-center.content-center.q-pa-sm.b-40
        q-btn(round flat color="white" icon="west" @click="$routerKalpa.back()")
        .col.full-height
          .row.fit.items-center.content-center.justify-center
            span(:style=`{fontSize: '18px'}`).text-white.text-bold {{navHeaderText}}
        q-btn(round flat color="white" icon="more_vert")
    //-externalHeader
    .row.full-width.justify-center.q-px-sm.q-py-sm.b-30
      q-resize-observer(@resize="externalHeaderHeight = $event.height")
      slot(name="externalHeader")
    div(:style=`{position: 'relative'}`).row.full-width.items-start.content-start
      //- header2
      transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
        div(v-if="pageId !== 'empty' && showTabsHeader" :style=`{position: 'absolute', zIndex: 1000, top: '0px', left: '0px'}`).row.full-width.items-center.content-center.justify-center
          q-resize-observer(@resize="tabsHeaderHeight = $event.height")
          //- search bar
          //search String
          q-input(
            v-if="searchStringShow && searchInputVisible"
            v-model="searchString"
            flat borderless dark dense autofocus
            icon="search"
            :placeholder="$t('Type here to search...')"
            :debounce="500"
            :style=`{height: '40px'}`
            :input-style=`{
                    width: '500px',
                    color: 'grey',
                    fontSize: '16px',
                    fontWeight: 'bold',
                  }`
            @focus=""
          ).row.full-width.b-30
            template(v-slot:prepend)
              q-icon(name="search" :color="'green'" size="25px").q-mx-md

          //- tabs
          .row.full-width.q-px-md.b-30
            q-btn(v-if="searchStringShow && !searchInputVisible" flat no-caps color="grey" icon="search" @click="searchInputVisible = true").no-border-radius
            q-tabs(
              v-model="pageId"
              align="justify"
              switch-indicator="false" no-caps dense
            active-color="green"
            ).col.text-grey-8
              q-tab(
                v-for="(p,pi) in pages" :key="p.id"
                :name="p.id" :label="p.name" :icon="p.icon")
      //- tab panels
      q-tab-panels(
        v-model="pageId"
        :swipeable="$q.platform.is.mobile"
        :animated="$q.platform.is.mobile").full-width.b-30
        q-tab-panel(
          v-for="(p,pi) in (pages)" :key="p.id" :name="p.id"
          :style=`{background: 'none', minHeight: '70vh',}`
        ).row.full-width.items-start.content-start.justify-center.q-pa-none
          list-feed(
            :scrollAreaHeight="scrollAreaHeight || ($q.screen.height - navHeaderHeight - externalHeaderHeight)"
            :query="query"
            :nextSize="nextSize"
            :itemMiddlePersist="itemMiddlePersist"
            :screenSize="screenSize"
            @showHeader="showTabsHeader = $event")
            template(v-slot:prepend)
              div(:style=`{height: tabsHeaderHeight + 'px' }`).row.full-width
            template(v-slot:append)
              q-btn(v-if="showAddBtn" round flat icon="add" color="green" @click="$emit('add')" ).row.full-width
              div(v-if="$store.state.ui.mobileMenuShown" :style=`{height: '65px' }`).row.full-width
            template(v-slot:item=`{item,itemIndex,isActive,isVisible}`)
              slot(name="item" :item="item" :itemIndex="itemIndex" :isActive="isActive" :isVisible="isVisible")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import bookmarkListItem from 'src/components/bookmark/bookmark_list_item.vue'
import bookmarkEditor from 'src/components/bookmark/bookmark_editor.vue'

export default {
  name: 'listSearch',
  props: {
    scrollAreaHeight: { type: Number },
    navHeaderText: { type: String, default: '' },
    searchString: { type: String, default: '' },
    searchStringShow: { type: String, default: true },
    pages: {type: Array, default: [{id: 'empty'}]},
    pageId: {type: String, default: 'empty'},
    query: {type: String, required: true},
    nextSize: {type: Number, default: 50},
    screenSize: {type: Number, default: 100},
    itemMiddlePersist: {type: Boolean, default: false},
    showAddBtn: {type: Boolean, default: false},
  },
  components: {
    bookmarkListItem,
    bookmarkEditor
  },
  data () {
    return {
      searchInputVisible: false,
      showTabsHeader: true,
      externalHeaderHeight: 0,
      navHeaderHeight: 0,
      tabsHeaderHeight: 0
    }
  },
  watch: {
    pageId: {
      immediate: true,
      handler (to, from) {
        if (!this.searchString) this.searchInputVisible = false
        this.showTabsHeader = true
        this.$emit('pageId', this.pageId)
      }
    },
    searchString: {
      immediate: true,
      handler (to, from) {
        this.searchInputVisible = !!to
        this.$emit('searchString', this.searchString)
      }
    },
  },
  methods: {
  }
}
</script>
