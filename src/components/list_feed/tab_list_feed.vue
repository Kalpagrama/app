<template lang="pug">
div(:style=`{position: 'relative'}`).row.full-width.items-start.content-start
  //- tab panels
  //q-tab-panels(
  //  v-model="pageId"
  //  :swipeable="false && $q.platform.is.mobile"
  //  :animated="$q.platform.is.mobile").full-width.b-30
  //  q-tab-panel(
  //    v-for="(p,pi) in (pages)" :key="p.id" :name="p.id"
  //    :style=`{background: 'none'}`
  //  ).row.full-width.items-start.content-start.justify-center.q-pa-none
  component(
    :is="'list-feed-' + type"
    ref="listFeed"
    :scrollAreaHeight="scrollAreaHeight"
    :query="query"
    :screenSize="screenSize"
    :itemHeightApprox="itemHeightApprox"
    :itemActivePersist="itemActivePersist"
    @count="$emit('count', $event)"
    @items="$emit('items', $event)")
    template(v-slot:header)
      //- nav header
      div(v-if="navHeaderText").row.full-width.justify-center.b-30
        div( :style=`{ height: '60px', borderRadius: '10px'}`).row.full-width.items-center.content-center.q-pa-sm.b-40
          q-btn( flat color="white" icon="west" @click="$routerKalpa.back()")
          .col.full-height
            .row.fit.items-center.content-center.justify-center
              span(:style=`{fontSize: '18px'}`).text-white.text-bold {{navHeaderText}}
          q-btn(round flat color="white" icon="more_vert")
      //-externalHeader
      .row.full-width.justify-center
        slot(name="externalHeader")
    template(v-slot:sticky-header)
      div(:style=`{maxWidth: $q.screen.width+'px'}`).row.full-width.items-center.content-center.justify-center.b-30
        slot(name="stickyHeaderTop")
      div(v-if="pages.length > 1" :style=`{maxWidth: $q.screen.width+'px'}`).row.full-width.items-center.content-center.justify-center
        //- search bar
        //search String
        q-input(
          v-if="searchInputState === 'opened'"
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
          template(v-slot:append)
            q-btn(round flat dense color="grey-5" icon="clear" @click="searchInputState = 'enabled'" ).q-mr-md

        //- tabs
        .row.full-width.q-px-md.b-30
          q-btn(v-if="searchInputState === 'enabled'" flat no-caps color="grey" icon="search" @click="searchInputState = 'opened', searchString = ''").no-border-radius
          q-tabs(
            v-model="pageId"
            align="justify"
            switch-indicator="false" no-caps dense
            active-color="green"
          ).col.text-grey-8
            q-tab(
              v-for="(p,pi) in pages" :key="p.id"
              :name="p.id" :label="p.name" :icon="p.icon" @click="pageId === p.id ? scrollTo('start') : null" @dblclick="pageId === p.id ? scrollTo('end') : null")
      .row.full-width.items-center.content-center.justify-center.b-30
        slot(name="stickyHeaderBottom")
    template(v-slot:footer)
      q-btn(v-if="showAddBtn" round flat icon="add" color="green" @click="$emit('add')" ).row.full-width
    template(v-slot:item=`{item,itemState,itemIndex,isActive,isVisible, isPreload, scrolling}`)
      slot(name="item" :item="item" :itemState="itemState" :itemIndex="itemIndex" :isActive="isActive" :isVisible="isVisible" :isPreload="isPreload" :scrolling="scrolling")
    template(v-slot:nodata)
      slot(name="nodata")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import bookmarkListItem from 'src/components/bookmark/bookmark_list_item.vue'
import bookmarkEditor from 'src/components/bookmark/bookmark_editor.vue'
import { assert } from 'src/system/common/utils'
import listFeedQuasar from 'src/components/list_feed/list_feed_vs_quasar.vue'
import listFeedCustom from 'src/components/list_feed/list_feed_custom.vue'
import listFeedCustomPPV from 'src/components/list_feed/list_feed_custom_ppv.vue'

export default {
  name: 'tabListFeed',
  props: {
    type: { type: String, default: 'quasar' },
    scrollAreaHeight: { type: Number },
    navHeaderText: { type: String, default: '' },
    searchString: { type: String, default: '' },
    searchInputState: { type: String, default: 'enabled' }, // disabled|enabled|opened
    pages: { type: Array, default: [{ id: 'empty' }] },
    pageId: { type: String, default: 'empty' },
    query: { type: String, required: true },
    screenSize: { type: Number },
    itemHeightApprox: { // средний размер одного элемента
      type: Number
    },
    itemActivePersist: { type: Boolean, default: false },
    showAddBtn: { type: Boolean, default: false }
  },
  components: {
    bookmarkListItem,
    bookmarkEditor,
    listFeedQuasar,
    listFeedCustom,
    listFeedCustomPPV
  },
  watch: {
    pageId: {
      immediate: true,
      handler (to, from) {
        // this.$logW('pageId:', to)
        this.$emit('pageId', to)
      }
    },
    searchString: {
      immediate: true,
      handler (to, from) {
        // this.$logW('searchString:', to)
        this.$emit('searchString', to)
      }
    },

    searchInputState: {
      immediate: true,
      handler (to, from) {
        // this.$logW('searchInputState:', to)
        assert(this.searchInputState.in('enabled', 'disabled', 'opened'), this.searchInputState)
        this.$emit('searchInputState', to)
      }
    }
  },
  methods: {
    scrollToStart() {
      return this.$refs.listFeed.scrollToStart()
    },
    scrollToEnd() {
      return this.$refs.listFeed.scrollToEnd()
    },
    scrollTo (pos) {
      // assert(pos.in('start', 'end'))
      if (pos === 'start') this.$refs.listFeed.scrollToStart()
      else if (pos === 'end') this.$refs.listFeed.scrollToEnd()
      else if (typeof pos === 'number' && this.$refs.listFeed.scrollTo) this.$refs.listFeed.scrollTo(pos)
      else throw new Error('scrollTo bad pos:' + pos)
    },
    length () {
      return this.$refs.listFeed.length
    }
  }
}
</script>
