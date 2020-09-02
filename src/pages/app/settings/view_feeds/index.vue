<template lang="pug">
q-page.row.full-width.justify-center
  div(:style=`{maxWidth: '800px',}`).row.full-width
    .col
      .row.full-width.q-py-md.q-px-sm
        .col
          span.text-white.text-bold Feeds
        q-btn(round flat dense color="green" icon="add")
      .row.full-width.items-start.contents-start.q-pt-sm
        div(
          v-for="(f,fi) in 100" :key="fi"
          :style=`{
            borderRadius: '10px', overflow: 'hidden',
            height: '100px',
          }`
          ).row.full-width.items-center.content-center.q-px-md.q-mb-sm.b-40
          span.text-white Feed {{ ii }}
    .col
      user-subscriptions()
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import userSubscriptions from 'components/user_subscriptions/index.vue'

export default {
  name: 'pageApp_settings_viewFeeds',
  components: {userSubscriptions},
  computed: {
    mangoQuery () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SUBSCRIPTIONS,
          oidSphere: this.oid || this.$store.getters.currentUser().oid,
        }
      }
    }
  },
}
</script>
