<template lang="pug">
  kalpa-layout
    template(v-slot:footer)
      kalpa-menu-mobile(v-if="$q.screen.lt.md")
    template(v-slot:body)
      //-header
      transition(enter-active-class="animated slideInDown" leave-active-class="animated slideOutUp")
        div(v-if="pageInfo.search || showHeader" :style=`{position: 'fixed', zIndex: 1000, top: '0px', left: '0px'}`).row.full-width.items-center.content-center.justify-center
          q-resize-observer(@resize="headerHeight = $event.height")
          page-trends-nav-tabs(:pageInfo="pageInfo")
      transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
          page-search(v-if="pageInfo.search" :useNavHeader="false" :searchString="pageInfo.searchString"
            :searchStringShow="false" @showHeader="this.showHeader = $event")
          page-trends(v-else :pageInfo="pageInfo" :useNavHeader="false"
            :searchString="pageInfo.searchString" :searchStringShow="false" @showHeader="showHeader = $event")
            template(v-slot:prepend)
              div(:style=`{height: headerHeight + 'px' }`).row.full-width
            template(v-slot:append)
              div(v-if="$store.state.ui.mobileMenuShown" :style=`{height: '65px' }`).row.full-width
</template>

<script>
import pageSearch from 'src/pages/app/search'
import pageTrends from './page_trends'
import pageTrendsNavTabs from 'src/pages/app/trends/nav_tabs.vue'
import { RxCollectionEnum } from 'src/system/rxdb'
import { assert } from 'src/system/utils'

export default {
  name: 'pageApp_trends',
  components: {
    pageTrendsNavTabs,
    pageSearch,
    pageTrends
  },
  data () {
    return {
      headerHeight: 0,
      showHeader: true,
      pageInfo: {
        pages: [
          ...this.$store.getters.nodeCategories.map(c => {
            return { id: c.sphere.oid, name: c.alias, label: c.alias }
          })],
        pageId: this.$route.query.pageId || this.$store.getters.nodeCategories[0].sphere.oid,
        searchString: '',
        search: false
      }
    }
  }
}
</script>
