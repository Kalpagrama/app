<template lang="pug">
  kalpa-layout
    template(v-slot:footer)
      //kalpa-menu-mobile(v-if="$q.screen.lt.md && !$store.state.ui.userTyping")
      kalpa-menu-mobile(v-if="$q.screen.lt.md")
    template(v-slot:body)
      .row.full-width.items-start.content-start.justify-center
        div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width.justify-center
          list-search-kalpa(v-if="pageInfo.searchInputState === 'opened'" :scrollAreaHeight="scrollAreaHeight"
            :useNavHeader="false", :searchInputState="pageInfo.searchInputState", @searchInputState="$logW('searchInputState', $event), pageInfo.searchInputState = $event")
          tab-list-feed(
            v-else
            ref="listFeed"
            :type="'customPPV'"
            :scrollAreaHeight="0"
            :searchInputState="pageInfo.searchInputState"
            :pages="pageInfo.categories"
            :pageId="pageInfo.categoryId"
            :query="queryCategory"
            :itemHeightApprox="Math.min($store.state.ui.pageWidth, $q.screen.width) * 0.6 + 222"
            :itemActivePersist="true"
            @searchString="pageInfo.searchString = $event"
            @pageId="pageInfo.categoryId = $event"
            @searchInputState="pageInfo.searchInputState = $event"
          ).row.full-width
            template(v-slot:item=`{item,itemState,itemIndex,isActive,isVisible,isPreload,scrolling}`)
              item-feed(
                :itemShortOrFull="item"
                :itemState="itemState"
                :itemIndex="itemIndex"
                :isActive="isActive"
                :isVisible="isVisible"
                :isPreload="isPreload"
                :scrolling="scrolling").q-pb-xl
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import bookmarkListItem from 'src/components/bookmark/bookmark_list_item.vue'
import bookmarkEditor from 'src/components/bookmark/bookmark_editor.vue'
import pageTrendsNavTabs from 'src/pages/app/trends/nav_tabs.vue'
import listSearchKalpa from 'src/components/kalpa_lists/search_kalpa.vue'
import listFeedCustomHorizontalPPV from 'src/components/list_feed/list_feed_horizontal_custom_ppv.vue'
import { assert } from 'src/system/common/utils'

export default {
  name: 'pageCategory',
  components: {
    bookmarkListItem,
    bookmarkEditor,
    pageTrendsNavTabs,
    listSearchKalpa,
    listFeedCustomHorizontalPPV
  },
  data () {
    return {
      bookmarkSelected: null,
      bookmarkEditorShow: false,
      showHeader: true,
      pageInfo: {
        categories: [
          ...this.$store.getters.nodeCategories.map(c => {
            return { id: c.type, name: c.alias, label: c.alias }
          })],
        categoryId: this.$route.params.categoryId || this.$store.getters.nodeCategories[0].type,
        searchInputState: 'enabled',
        searchString: ''
      }
    }
  },
  computed: {
    scrollAreaHeight () {
      return this.$q.screen.height
    },
    queryCategory () {
      assert(this.pageInfo.categoryId !== 'search')
      this.$log('query::this.pageInfo.categoryId', this.pageInfo.categoryId)
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
          objectTypeEnum: { $in: ['NODE', 'BLOCK', 'JOINT'] },
          oidSphere: this.$store.getters.nodeCategories.find(c => c.type === this.pageInfo.categoryId).sphere.oid,
          sortStrategy: this.pageInfo.categoryId === 'ALL' ? 'AGE' : 'HOT', // 'ACTIVITY', // AGE
          stack: 'item0'
        },
        populateObjects: false
      }
    }
  },
  methods: {
    onBusEvent (ev) {
      this.$refs.listFeed.scrollTo('start')
    }
  },
  mounted () {
    this.$eventBus.$on('btn-trends-clicked', this.onBusEvent)
  },
  beforeDestroy () {
    this.$eventBus.$off('btn-trends-clicked', this.onBusEvent)
  }
}
</script>
