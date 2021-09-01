<template lang="pug">
  kalpa-layout
    template(v-slot:footer)
      kalpa-menu-mobile(v-if="$q.screen.lt.md")
    template(v-slot:body)
      .row.full-width.items-start.content-start
        page-trends-nav-tabs(ref="navTabs" :pageInfo="pageInfo" :height="rootTabsHeight")
        q-tab-panels(
          v-model="pageInfo.rootPageId"
          :swipeable="$q.platform.is.mobile"
          :animated="$q.platform.is.mobile"
          :style=`{}`).full-width.b-30
          q-tab-panel(
            v-for="(p,pi) in pageInfo.rootPages" :key="p.id" :name="p.id"
            :style=`{
            background: 'none',
            minHeight: '70vh',
          }`
          ).row.full-width.items-start.content-start.justify-center.q-pa-none
            page-search(v-if="pageInfo.rootPageId === 'search'" :scrollAreaHeight="scrollAreaHeight"
              :useNavHeader="false", :searchStringShow="false", :searchString="pageInfo.searchString")
            list-feed(
              v-if="pageInfo.rootPageId !== 'search'"
              :scrollAreaHeight="scrollAreaHeight"
              :query="query"
              nextSize=50
              :itemMiddlePersist="false"
              screenSize=100
              :itemStyles=`{ paddingBottom: '30px',}`
              :style=`{ maxWidth: $store.state.ui.pageWidth+'px'}`
              @showHeader="showHeader = $event")
              template(v-slot:prepend)
                //div(:style=`{height: headerHeight + 'px' }`).row.full-width
              template(v-slot:append)
                div(v-if="$store.state.ui.mobileMenuShown" :style=`{height: '65px' }`).row.full-width
              template(v-slot:item=`{item,itemIndex,isActive,isVisible}`)
                item-feed(
                  :item="item.populatedObject"
                  :isActive="isActive"
                  :isVisible="isVisible")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import bookmarkListItem from 'src/components/bookmark/bookmark_list_item.vue'
import bookmarkEditor from 'src/components/bookmark/bookmark_editor.vue'
import pageTrendsNavTabs from 'src/pages/app/trends/nav_tabs.vue'
import pageSearch from 'src/pages/app/search'
import { assert } from 'src/system/common/utils'

export default {
  name: 'pageTrends',
  components: {
    bookmarkListItem,
    bookmarkEditor,
    pageTrendsNavTabs,
    pageSearch
  },
  data () {
    return {
      bookmarkSelected: null,
      bookmarkEditorShow: false,
      showHeader: true,
      rootTabsHeight: 40,
      pageInfo: {
        rootPages: [
          { id: 'search', name: this.$t('Search'), icon: 'search' },
          ...this.$store.getters.nodeCategories.map(c => {
            return { id: c.sphere.oid, name: c.alias, label: c.alias }
          })],
        rootPageId: this.$route.query.rootPageId || this.$store.getters.nodeCategories[0].sphere.oid,
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
        populateObjects: true
      }
    }
  }
}
</script>
