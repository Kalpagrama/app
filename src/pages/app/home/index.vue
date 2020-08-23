<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-header(reveal)
    .row.full-width.justify-center.b-30
      div(:style=`{position: 'relative', maxWidth: '800px'}`).row.full-width.b-30
        div(:style=`{height: '50px'}`).row.full-width.items-center.content-center.justify-between.q-px-sm
          q-icon(name="view_agenda" color="white" size="30px").q-mr-sm
          span(:style=`{fontSize: '18px',}`).text-bold.text-white Моя лента
          .col
          q-btn(round flat color="white" icon="settings" @click="$router.push('/subscriptions')")
  q-page-container
    q-page(:style=`{paddingTop: '50px', paddingBottom: '200px'}`)
      .row.full-width.items-start.content-start.justify-center
        div(:style=`{maxWidth: '800px'}`).row.full-width.items-start.content-start
          kalpa-loader(v-if="sphereOid" :mangoQuery="mangoQuery")
            template(v-slot=`{items,itemsMore}`)
              list-middle(:items="items" :more="itemsMore" :itemStyles=`{marginBottom: '50px',}`)
                template(v-slot:item=`{item,itemIndex,isActive,isVisible}`)
                  node-lite(:node="item" :isActive="isActive" :isVisible="isVisible")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageApp__home',
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
