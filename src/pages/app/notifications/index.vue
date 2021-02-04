<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-header(reveal :style=`{paddingTop: 'env(safe-area-inset-top)',}`).b-30
    .row.full-width.justify-center.b-30.q-pt-sm.q-px-sm
      div(:style=`{position: 'relative', maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
        div(
          :style=`{
            height: '60px', borderRadius: '10px',
          }`
          ).row.full-width.items-center.content-center.justify-between.q-pa-sm.b-40
          q-icon(name="notifications_none" color="white" size="30px").q-mx-sm
          .col
          span(
            :style=`{fontSize: '18px', userSelect: 'none'}`
            ).text-bold.text-white {{$t('pageApp_notifications_title', 'Уведомления')}}
          .col
          q-btn(round flat color="grey-8" icon="more_vert")
  q-page-container
    q-page.row.full-width.justify-center.q-pt-sm.q-px-sm
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
}
</script>
