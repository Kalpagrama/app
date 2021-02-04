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
          q-btn(round flat color="grey-8" icon="more_vert")
  q-page-container
    q-page
      list-feed(
        :query="query"
        :itemStyles=`{
          paddingBottom: '50px',
        }`)
    //- router-view
    //- iframe(
      src="https://doc.clickup.com/p/h/2cve9-15/42d6a6e8f899a3b"
      frameBorder="0"
      :style=`{
        width: '100%', height: 'calc(100vh - 0px)',
      }`)
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageApp__notifications',
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
