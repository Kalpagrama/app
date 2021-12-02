<template lang="pug">
kalpa-layout
  template(v-slot:footer)
    kalpa-menu-mobile(v-if="$q.screen.lt.md && !$store.state.ui.userTyping")
  template(v-slot:body)
    .row.full-width.items-start.content-start.justify-center
      div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
        // подписки
        span.text-grey-5.text-h5.q-py-sm.q-pl-sm {{$t('Мои подписки')}}
        list-feed-custom-horizontalPPV(
          ref="listFeed"
          :scrollAreaWidth="$store.state.ui.pageWidth"
          :scrollAreaHeight="150"
          :query="querySubscriptions"
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
              :showContext="false"
              :layout="'card-tiny'"
              :height="150").q-px-xs
        span.text-grey-5.text-h5.q-py-md.q-pl-sm {{$t('Новое по подпискам')}}
        tab-list-feed(
          ref="listFeed"
          :type="'customPPV'"
          :scrollAreaHeight="0"
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
              :layout="item.type.in('NODE', 'JOINT', 'BLOCK') ? 'card' : 'line'"
              :scrolling="scrolling").q-pb-xl
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import listFeedCustomHorizontalPPV from 'src/components/list_feed/list_feed_horizontal_custom_ppv.vue'

export default {
  name: 'feeds_feed',
  props: ['feed'],
  components: {
    listFeedCustomHorizontalPPV
  },
  data () {
    return {
    }
  },
  methods: {
    onBusEvent(ev) {
      this.$refs.listFeed.scrollToStart()
    }
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
    },
    querySubscriptions () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SUBSCRIPTIONS,
          oidSphere: this.$store.getters.currentUser.oid,
          // objectTypeEnum: {$in: ['USER']}
        },
        populateObjects: false,
      }
    }
  },
  mounted () {
    this.$log('mounted')
    this.$eventBus.$on('btn-home-clicked', this.onBusEvent)
  },
  beforeUnmount () {
    this.$log('beforeDestroy')
    this.$eventBus.$off('btn-home-clicked', this.onBusEvent)
  }
}
</script>
