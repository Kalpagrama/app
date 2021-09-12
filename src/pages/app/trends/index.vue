<template lang="pug">
kalpa-layout
  template(v-slot:footer)
    kalpa-menu-mobile(v-if="$q.screen.lt.md && !$store.state.ui.userTyping")
  template(v-slot:body)
    .row.full-width.items-start.content-start.justify-center
      div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
        list-search-kalpa(v-if="pageInfo.searchInputState === 'opened'" :scrollAreaHeight="scrollAreaHeight"
          :useNavHeader="false", :searchInputState="pageInfo.searchInputState", @searchInputState="pageInfo.searchInputState = $event")
        tab-list-feed(
          v-else
          :scrollAreaHeight="scrollAreaHeight || $q.screen.height"
          :searchInputState="pageInfo.searchInputState"
          :pages="pageInfo.rootPages"
          :pageId="pageInfo.rootPageId"
          :query="query"
          :itemHeightApprox="500"
          :itemMiddlePersist="true"
          @searchString="pageInfo.searchString = $event"
          @pageId="pageInfo.rootPageId = $event"
          @searchInputState="pageInfo.searchInputState = $event"
        ).row.full-width
          //template(v-slot:externalHeader)
          //  page-trends-nav-tabs(ref="navTabs" :pageInfo="pageInfo" :height="rootTabsHeight")
          template(v-slot:item=`{item,itemIndex,isActive,isVisible,isPreload}`)
            item-feed(
              :itemShort="item"
              :itemIndex="itemIndex"
              :isActive="isActive"
              :isVisible="isVisible"
              :isPreload="isPreload").q-pb-xl
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
      rootTabsHeight: 40,
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
      return this.$q.screen.height - this.rootTabsHeight
    },
    query () {
      assert(this.pageInfo.rootPageId !== 'search')
      this.$log('query::this.pageInfo.rootPageId', this.pageInfo.rootPageId)
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
          objectTypeEnum: { $in: ['NODE', 'JOINT', 'BLOCK'] },
          oidSphere: this.pageInfo.rootPageId,
          sortStrategy: 'AGE' // 'ACTIVITY', // AGE
        },
        populateObjects: false
      }
    }
  }
}
</script>
