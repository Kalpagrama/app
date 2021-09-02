<template lang="pug">
  kalpa-layout
    template(v-slot:footer)
      kalpa-menu-mobile(v-if="$q.screen.lt.md && !$store.state.ui.userTyping")
    template(v-slot:body)
      .row.full-width.items-start.content-start.justify-center
        div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
          //- guest
          div(
            v-if="$store.getters.isGuest"
            :style=`{maxWidth: 600+'px'}`).row.full-width.items-center.content-center.justify-center
            .row.full-width.justify-center
              q-icon(name="login" color="grey-8" size="100px")
            div(:style=`{textAlign: 'center'}`).row.full-width.justify-center
              span.text-white {{$t('You will see your notifications')}}
            .row.full-width.justify-center.q-pt-md
              q-btn(
                outline color="white" no-caps
              :style=`{
                  height: '50px',
                }`
                @click="$store.commit('ui/stateSet', ['authGuard', {message: null}])"
              )
                h1.text-white {{$t('Login')}}
          //- user
          tab-list-feed(
            v-if="!$store.getters.isGuest && sphereOid"
            :scrollAreaHeight="scrollAreaHeight || $q.screen.height"
            :navHeaderText="$t('Activity')"
            :searchStringShow="searchStringShow"
            :searchString="searchString"
            :query="query"
            nextSize=50
            :itemMiddlePersist="false"
            screenSize=100
            @searchString="searchString = $event"
            @pageId="pageId = $event"
          ).row.full-width
            template(v-slot:item=`{item,itemIndex,isActive,isVisible}`)
              notification-item(
                :notification="item"
                :notificationIndex="itemIndex"
                :isActive="isActive"
                :isVisible="isVisible").q-mb-sm
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import notificationItem from './notification_item.vue'

export default {
  name: 'pageApp__notifications',
  components: {
    notificationItem,
  },
  data () {
    return {
      searchString: ''
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
