<template lang="pug">
kalpa-layout
  template(v-slot:footer)
    kalpa-menu-mobile(v-if="$q.screen.lt.md && !$store.state.ui.userTyping")
  template(v-slot:body)
    .row.full-width.items-start.content-start.justify-center
      div(v-if="$store.getters.isGuest" :style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
        .row.full-width.justify-center.b-30.q-mb-sm
          .row.full-width
            div(
              :style=`{
                height: '60px',
                borderRadius: '10px',
              }`
            ).row.full-width.items-center.content-center.q-pa-sm.b-40.justify-between
              q-btn(round flat color="white" icon="home")
              span(:style=`{fontSize: '18px'}`).text-white.text-bold {{$t('Home')}}
              //- tutorial
              q-btn(
                round flat color="white" icon="more_vert")
        //- guest
        guest-guard
      div(v-if="!$store.getters.isGuest" :style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
        // подписки
        //span.text-grey-5.text-h6.q-py-sm.q-pl-sm {{$t('Мои подписки')}}
        //list-feed-custom-horizontalPPV(
        //  ref="listFeedHorizontal"
        //  :scrollAreaWidth="$store.state.ui.pageWidth"
        //  :scrollAreaHeight="150"
        //  :query="querySubscriptions"
        //  :itemWidthApprox="150*1.618"
        //  :itemHeightApprox="150"
        //  :itemActivePersist="itemActivePersist"
        //  @count="$emit('count', $event)"
        //  @items="$emit('items', $event)")
        //  template(v-slot:item=`{item,itemState,itemIndex,isActive,isVisible,isPreload,scrolling}`)
        //    item-feed(
        //      :itemShortOrFull="item"
        //      :itemState="itemState"
        //      :itemIndex="itemIndex"
        //      :isActive="isActive"
        //      :isVisible="isVisible"
        //      :isPreload="isPreload"
        //      :scrolling="scrolling"
        //      :showContext="false"
        //      :layout="'card-tiny'"
        //      :height="150"
        //      :muted="true").q-px-xs
        div(v-if="$screenProps.isMobile"
          @click="$go('/home')"
        ).row.full-width.items-center.content-center.q-pa-xs
          div(
            :style=`{zIndex: 100, height: '45px', width: '45px', cursor: 'pointer !important'}`
          ).row.items-center.content-center.justify-center.cursor-pointer
            kalpa-logo(:width="35" :height="35" :style=`{pointEvents: 'none'}`)
          div.col
            div(
            ).row.fit.items-center.content-center.cursor-pointer
              span(:style=`{fontSize: '18px'}`).text-grey-5.text-bold {{$t('Kalpagrama')}}
              //.row.full-width
              //  small.text-grey-4 {{$t('Connect the dots')}}
        //div(
        //  :style=`{zIndex: 100, height: '60px', width: '60px', cursor: 'pointer !important'}`
        //).row.items-center.content-center.justify-center.cursor-pointer
        //kalpa-logo(:width="40" :height="40" :style=`{pointEvents: 'none'}`)
        //span(v-if="$screenProps.isMobile").text-grey-5.text-h6.q-pt-md.q-pl-sm {{$t('Kalpagrama')}}
        tab-list-feed(
          ref="listFeed"
          :type="'customPPV'"
          :scrollAreaHeight="0"
          searchInputState="disabled"
          :query="query"
          :itemHeightApprox="Math.min($store.state.ui.pageWidth, $q.screen.width) * 0.6 + 222"
          :itemActivePersist="true"
        ).row.full-width.q-mt-xs
          template(v-slot:item=`{item,itemState,itemIndex,isActive,isVisible,isPreload, scrolling}`)
            item-feed(
              :itemShortOrFull="item.object"
              :itemState="itemState"
              :itemIndex="itemIndex"
              :isActive="isActive"
              :isVisible="isVisible"
              :isPreload="isPreload"
              :layout="item.object.type.in('NODE', 'JOINT', 'BLOCK') ? 'card' : 'line'"
              :scrolling="scrolling").q-pb-md
          template(v-slot:nodata)
            nodata-guard(
              icon="newspaper"
              title="Здесь пока ничего нет"
              message="Новости и обновления появятся здесь"
            )
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import listFeedCustomHorizontalPPV from 'src/components/list_feed/list_feed_horizontal_custom_ppv.vue'
import guestGuard from 'src/components/kalpa_guard/guest_guard.vue'
import nodataGuard from 'src/components/kalpa_guard/nodata_guard'

export default {
  name: 'feeds_feed',
  props: ['feed'],
  components: {
    listFeedCustomHorizontalPPV,
    guestGuard,
    nodataGuard,
  },
  data () {
    return {
    }
  },
  methods: {
    onBusEvent(ev) {
      this.$refs.listFeed.scrollToStart()
      this.$refs.listFeedHorizontal.scrollToStart()
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
