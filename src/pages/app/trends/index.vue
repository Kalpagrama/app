<template lang="pug">
kalpa-layout
  template(v-slot:footer)
    //kalpa-menu-mobile(v-if="$q.screen.lt.md && !$store.state.ui.userTyping")
    kalpa-menu-mobile(v-if="$q.screen.lt.md")
  template(v-slot:body)
    .row.full-width.items-start.content-start.justify-center
      div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width.justify-center
        div(v-if="pageInfo.searchInputState === 'enabled'").row.full-width
          //search String
          q-input(
            v-model="pageInfo.searchString"
            flat borderless dark dense
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
            @focus="pageInfo.searchInputState = 'opened'"
          ).row.full-width.b-30
            template(v-slot:prepend)
              q-icon(name="search" :color="'green'" size="25px").q-mx-md
            template(v-slot:append)
              //q-btn(round flat dense color="white" icon="clear" @click="pageInfo.searchString = '', pageInfo.searchInputState = 'enabled'" ).q-mr-md
          // горизонтальная полоса
          span.text-grey-5.text-h6.q-py-sm.q-pl-sm {{$t('Популярные смыслы')}}
          list-feed-custom-horizontalPPV(
            ref="listFeed"
            :scrollAreaWidth="$store.state.ui.pageWidth"
            :scrollAreaHeight="150"
            :query="queryPopular"
            :itemWidthApprox="150*1.618"
            :itemHeightApprox="150"
            :itemActivePersist="itemActivePersist"
            @count="$emit('count', $event)"
            @items="$emit('items', $event)")
            template(v-slot:item=`{item,itemState,itemIndex,isActive,isVisible,isPreload,scrolling}`)
              item-feed(
                :itemShortOrFull="item"
                :itemState="itemState"
                :itemIndex="itemIndex"
                :isActive="isActive"
                :isVisible="isVisible"
                :isPreload="isPreload"
                :scrolling="scrolling"
                :layout="'card-tiny'"
                :showContext="false"
                :height="150").q-px-xs
                //template(v-slot:skeleton=`{queryInProgress}`)
                  div(:style=`{width: 150*1.618+'px', height: '150px'}`).relative-position
                    q-skeleton(type='rect' height='100%' :animation="queryInProgress ? 'wave' : 'none'" dark).br-10
                    .row.full-width.absolute-bottom.justify-center
                      span.text-grey-5.text-h6 {{item.name}}
                    //.row.full-width.justify-center.q-pt-sm
                      q-skeleton(type='text' width='50%' :animation="queryInProgress ? 'wave' : 'none'" dark)
          span.text-grey-5.text-h6.q-py-sm.q-pl-sm {{$t('Категории')}}
          .row.full-width
            div(v-for="(c, ix) in $store.getters.nodeCategories").col-6.q-pa-xs
              q-responsive(:ratio="1.618" :style=`{overflow: 'hidden', borderRadius: '', position: 'relative'}`).full-width.br-10.relative-position
                img(
                  :src="c.icon"
                  :style=`{
                    // height: '60px',
                    // opacity: 0.2,
                    objectFit: 'cover',
                    borderRadius: '10px'}`)
                div(:style=`{background: 'rgba(0,0,0,0.2)'}` @click="$go(categoryLink(c))").absolute-full.row.content-end.items-end.justify-center.cursor-pointer
                  div(v-if="c.type !== 'SYMPOSIUM'").row.q-pb-none
                    span(v-if="$q.screen.lt.md" :style=`{fontSize: '17px', textShadow: '2px 2px 2px '+$getPaletteColor('grey-10')}`).text-grey-1.text-bold {{c.alias}}
                    span(v-else :style=`{textShadow: '2px 2px 2px '+$getPaletteColor('grey-10')}`).text-grey-1.text-bold.text-h5 {{c.alias}}
        list-search-kalpa(v-else-if="pageInfo.searchInputState === 'opened'" :scrollAreaHeight="scrollAreaHeight"
          :useNavHeader="false", :searchInputState="pageInfo.searchInputState", @searchInputState="$logW('searchInputState', $event), pageInfo.searchInputState = $event")
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
  name: 'pageTrends',
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
        searchInputState: 'enabled',
        searchString: ''
      }
    }
  },
  computed: {
    scrollAreaHeight () {
      return this.$q.screen.height
    },
    queryPopular () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
          objectTypeEnum: { $in: ['NODE'] },
          oidSphere: this.$store.getters.nodeCategories[0].sphere.oid,
          sortStrategy: 'ACTIVITY', // 'ACTIVITY', // AGE
          stack: 'item0'
        },
        populateObjects: false
      }
    }
  },
  methods: {
    categoryLink(c){
      return '/sphere/' + c.sphere.oid + '/' + (c.type === 'ALL' ? 'AGE' : 'HOT')
    },
    onBusEvent (ev) {
      this.$refs.listFeed.scrollToStart()
    }
  },
  mounted () {
    this.$eventBus.$on('btn-trends-clicked', this.onBusEvent)
  },
  beforeUnmount () {
    this.$eventBus.$off('btn-trends-clicked', this.onBusEvent)
  }
}
</script>
