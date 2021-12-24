<template lang="pug">
kalpa-layout
  template(v-slot:footer)
    kalpa-menu-mobile(v-if="$q.screen.lt.md && !$store.state.ui.userTyping")
  template(v-slot:body)
    .row.full-width.items-start.content-start.justify-center
      div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
        //- header
        .row.full-width.justify-center.b-30.q-mb-sm
          .row.full-width
            div(
              :style=`{
                height: '60px',
                borderRadius: '10px',
              }`
            ).row.full-width.items-center.content-center.q-pa-sm.b-40.justify-between
              q-btn(round flat color="white" icon="notifications")
              span(:style=`{fontSize: '18px'}`).text-white.text-bold {{$t('Activity')}}
              //- tutorial
              q-btn(
                round flat color="white" icon="more_vert")
        //- guest
        guest-guard(
          v-if="$store.getters.isGuest")
        //- user
        tab-list-feed(
          v-if="!$store.getters.isGuest && sphereOid"
          ref="listFeed"
          :scrollAreaHeight="scrollAreaHeight || $q.screen.height"
          searchInputState="disabled"
          :query="query"
          :itemHeightApprox="100"
          :itemActivePersist="true"
        ).row.full-width
          template(v-slot:item=`{item,itemState,itemIndex,isActive,isVisible,isPreload, scrolling}`)
            notification-item(
              :notification="item"
              :itemState="itemState"
              :itemIndex="itemIndex"
              :notificationIndex="itemIndex"
              :isActive="isActive"
              :isVisible="isVisible").q-mb-sm
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import notificationItem from './notification_item.vue'
import guestGuard from 'src/components/kalpa_guard/guest_guard.vue';

export default {
  name: 'pageApp__notifications',
  components: {
    notificationItem,
    guestGuard,
  },
  data () {
    return {
    }
  },
  computed: {
    sphereOid () {
      return this.$store.getters.currentUser ? this.$store.getters.currentUser.oid : null
    },
    query () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_FEED,
          oidSphere: this.sphereOid
        },
        populateObjects: false,
      }
    }
  },
  methods: {
    headerClick () {
      // this.$store.commit('ui/stateSet', ['listFeedGoToStart', true])
    },
    onBusEvent(ev) {
      this.$refs.listFeed.scrollTo('start')
    }
  },
  mounted () {
    this.$log('mounted')
    this.$eventBus.$on('btn-notifications-clicked', this.onBusEvent)
  },
  beforeUnmount () {
    this.$log('beforeDestroy')
    this.$eventBus.$off('btn-notifications-clicked', this.onBusEvent)
  }
}
</script>
