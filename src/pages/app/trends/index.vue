<template lang="pug">
kalpa-layout
  template(v-slot:footer)
    //kalpa-menu-mobile(v-if="$q.screen.lt.md && !$store.state.ui.userTyping")
    kalpa-menu-mobile(v-if="$q.screen.lt.md")
  template(v-slot:body)
    .row.full-width.items-start.content-start.justify-center
      div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
        list-search-kalpa(v-if="pageInfo.searchInputState === 'opened'" :scrollAreaHeight="scrollAreaHeight"
          :useNavHeader="false", :searchInputState="pageInfo.searchInputState", @searchInputState="pageInfo.searchInputState = $event")
        tab-list-feed(
          v-else
          :type="'customPPV'"
          :scrollAreaHeight="0"
          :searchInputState="pageInfo.searchInputState"
          :pages="pageInfo.rootPages"
          :pageId="pageInfo.rootPageId"
          :query="query"
          :itemHeightApprox="Math.min($store.state.ui.pageWidth, $q.screen.width) * 0.6 + 222"
          :itemActivePersist="true"
          @searchString="pageInfo.searchString = $event"
          @pageId="pageInfo.rootPageId = $event"
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
import { assert } from 'src/system/common/utils'

export default {
  name: 'pageTrends',
  components: {
    bookmarkListItem,
    bookmarkEditor,
    pageTrendsNavTabs,
    listSearchKalpa
  },
  data () {
    return {
      bookmarkSelected: null,
      bookmarkEditorShow: false,
      showHeader: true,
      pageInfo: {
        rootPages: [
          ...this.$store.getters.nodeCategories.map(c => {
            return { id: c.sphere.oid, name: c.alias, label: c.alias }
          })],
        rootPageId: this.$route.query.rootPageId || this.$store.getters.nodeCategories[0].sphere.oid,
        searchInputState: 'enabled',
        searchString: '',
      }
    }
  },
  computed: {
    scrollAreaHeight () {
      return this.$q.screen.height
    },
    query () {
      assert(this.pageInfo.rootPageId !== 'search')
      this.$log('query::this.pageInfo.rootPageId', this.pageInfo.rootPageId)
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
          objectTypeEnum: { $in: ['NODE', 'BLOCK'] },
          oidSphere: this.pageInfo.rootPageId,
          sortStrategy: 'AGE', // 'ACTIVITY', // AGE
          stack: 'item0'
        },
        populateObjects: false,
      }
    }
  }
}
</script>
