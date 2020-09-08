<template lang="pug">
q-page(:style=`{paddingTop: '8px', paddingBottom: '200px'}`).row.full-width.justify-center
  kalpa-loader(v-if="sphereOid" :mangoQuery="mangoQuery" :sliseSize="100")
    template(v-slot=`{items,next}`)
      div(:style=`{maxWidth: '800px'}`).row.full-width.items-start.content-start
        div(
          v-for="(n,ni) in items" :key="n.id"
          :style=`{height: '60px', borderRadius: '10px', overflow: 'hidden'}`
          ).row.full-width.items-center.content-center.b-40.q-px-md.q-mb-sm
          span.text-white {{ n.subject.name }} =>
          span.text-white {{ n.matter.reason }}
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
    mangoQuery () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_FEED,
          oidSphere: this.sphereOid
        }
      }
    }
  }
}
</script>
