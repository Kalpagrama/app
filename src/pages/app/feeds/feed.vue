<template lang="pug">
  kalpa-layout
    template(v-slot:footer)
      kalpa-menu-mobile(v-if="$q.screen.lt.md && !$store.state.ui.userTyping")
    template(v-slot:body)
      .row.full-width.items-start.content-start.justify-center
        div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
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
          tab-list-feed(
            :type="'customPPV'"
            :scrollAreaHeight="0"
            :navHeaderText="$t('Feed')"
            searchInputState="disabled"
            :query="query"
            :itemHeightApprox="Math.min($store.state.ui.pageWidth, $q.screen.width) * 0.6 + 222"
            :itemActivePersist="true"
          ).row.full-width
            template(v-slot:item=`{item,itemState,itemIndex,isActive,isVisible,isPreload, scrolling}`)
              item-feed(
                :itemShortOrFull="item.object"
                :itemState="itemState"
                :itemIndex="itemIndex"
                :isActive="isActive"
                :isVisible="isVisible"
                :isPreload="isPreload"
                :scrolling="scrolling")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'feeds_feed',
  props: ['feed'],
  components: {
  },
  data () {
    return {
    }
  },
  methods: {
  },
  computed: {
    scrollAreaHeight () {
      return this.$q.screen.height
    },
    query () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_FEED,
          oidSphere: this.$store.getters.currentUser.oid,
          // subscription: {$in: this.feedSubscriptions}
          matterReason: {$ne: 'AUTHOR'}, // только события относительно объектов, где я не являюсь автором объекта
          eventType: {$in: ['OBJECT_CREATED']} // только события о создании объектов
        },
        populateObjects: false
      }
      return res
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
