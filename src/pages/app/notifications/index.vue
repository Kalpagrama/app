<template lang="pug">
q-layout(
  view="hHh lpR fFf"
  container
  :style=`{
    height: $q.screen.height+'px',
  }`).b-30
  q-header(reveal :style=`{paddingTop: 'env(safe-area-inset-top)',}`).b-30
    .row.full-width.justify-center.b-30.q-pt-sm.q-px-sm
      div(:style=`{position: 'relative', maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
        div(
          :style=`{
            height: '60px', borderRadius: '10px',
          }`
          ).row.full-width.items-center.content-center.justify-between.q-pa-sm.b-40
          q-icon(name="notifications_none" color="white" size="30px").q-mx-sm
          div(
            @click="headerClick()"
            ).col
            .row.full-width.items-center.content-center.justify-center
              span(
                :style=`{fontSize: '18px', userSelect: 'none'}`
                ).text-bold.text-white {{$tt('Activity')}}
          q-btn(round flat color="white" icon="more_vert")
  q-footer(v-if="$q.screen.lt.md")
    kalpa-menu-mobile
  q-page-container
    q-page(
      v-if="$store.getters.currentUser().profile.role === 'GUEST'"
      :style=`{
        height: '80vh',
      }`
      ).row.full-width.justify-center
      div(:style=`{maxWidth: 600+'px'}`).row.full-width.items-center.content-center.justify-center
        .row.full-width.justify-center
          q-icon(name="login" color="grey-8" size="100px")
        div(:style=`{textAlign: 'center'}`).row.full-width.justify-center
          span.text-white Вы увидите список уведомлений.
        .row.full-width.justify-center.q-pt-md
          q-btn(
            outline color="white" no-caps
            :to="'/auth/sign-in'"
            :style=`{
              height: '50px',
            }`)
            h1.text-white Войти в аккаунт
    q-page(
      v-if="$store.getters.currentUser().profile.role !== 'GUEST'"
      ).row.full-width.justify-center.q-pt-sm.q-px-sm
      list-feed(
        v-if="sphereOid"
        :query="query"
        :itemStyles=`{
          paddingBottom: '8px',
        }`
        :style=`{
          maxWidth: $store.state.ui.pageWidth+'px',
        }`)
        template(v-slot:item=`{item,itemIndex,isActive,isVisible}`)
          notification-item(
            :notification="item"
            :notificationIndex="itemIndex"
            :isActive="isActive"
            :isVisible="isVisible")
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
    }
  },
  computed: {
    sphereOid () {
      return this.$store.getters.currentUser() ? this.$store.getters.currentUser().oid : null
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
      this.$store.commit('ui/stateSet', ['listFeedNeedDrop', true])
    }
  },
}
</script>
