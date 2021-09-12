<template lang="pug">
  kalpa-layout
    template(v-slot:footer)
      kalpa-menu-mobile(v-if="$q.screen.lt.md && !$store.state.ui.userTyping")
    template(v-slot:body)
      .row.full-width.items-start.content-start.justify-center
        div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
          //- guest
          view-guest(
            v-if="$store.getters.isGuest")
          //- user
          tab-list-feed(
            v-if="!$store.getters.isGuest && sphereOid"
            :scrollAreaHeight="scrollAreaHeight || $q.screen.height"
            :navHeaderText="$t('Activity')"
            searchInputState="disabled"
            :query="query"
            :itemHeightApprox="100"
            :itemMiddlePersist="true"
          ).row.full-width
            template(v-slot:item=`{item,itemIndex,isActive,isVisible,isPreload}`)
              notification-item(
                :notification="item"
                :notificationIndex="itemIndex"
                :isActive="isActive"
                :isVisible="isVisible").q-mb-sm
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import notificationItem from './notification_item.vue'
import viewGuest from '../notifications/view_guest';

export default {
  name: 'pageApp__notifications',
  components: {
    notificationItem,
    viewGuest,
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
      this.$store.commit('ui/stateSet', ['listFeedGoToStart', true])
    }
  },
}
</script>
