<template lang="pug">
q-page(
  :style=`{paddingTop: '8px', paddingBottom: '200px'}`
  ).row.full-width.justify-center
  kalpa-loader(
    v-if="sphereOid"
    :immediate="true" :query="query" :limit="100" v-slot=`{items,next}`)
    div(
      :style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`
      ).row.full-width.items-start.content-start.q-px-sm
      div(
        v-for="(n,ni) in items" :key="n.id"
        :style=`{minHeight: '60px', borderRadius: '10px', overflow: 'hidden'}`
        ).row.full-width.items-center.content-center.b-40.q-px-md.q-py-sm.q-mb-sm
        //- span.text-white {{ JSON.stringify(n.card) }}
        span.text-white.q-mr-sm {{ n.card.items[0] }}
        span.text-white.q-mr-sm {{ n.card.items[1].name }}
        span.text-white.q-mr-sm {{ n.card.items[2] }}
        .row.full-width
          small.text-white {{ n.card }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageApp_notifications_viewHome',
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
  }
}
</script>
