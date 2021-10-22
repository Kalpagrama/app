<template lang="pug">
kalpa-layout
  template(v-slot:footer)
    //kalpa-menu-mobile(v-if="$q.screen.lt.md && !$store.state.ui.userTyping")
    kalpa-menu-mobile(v-if="$q.screen.lt.md")
  template(v-slot:body)
    .row.full-width.items-start.content-start.justify-center

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
  },
  methods: {
    onBusEvent(ev) {
      this.$refs.listFeed.scrollTo('start')
    }
  },
  mounted () {
    this.$bus.$on('btn-trends-clicked', this.onBusEvent)
  },
  beforeDestroy () {
    this.$bus.$off('btn-trends-clicked', this.onBusEvent)
  }
}
</script>
