<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-header(reveal)
    .row.full-width.justify-center.b-30
      div(:style=`{position: 'relative', maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width.q-pt-sm.q-px-sm
        div(:style=`{height: '60px', borderRadius: '10px',}`
          ).row.full-width.items-center.content-center.justify-between.q-pl-md.q-pr-xs.b-40
          q-icon(name="rss_feed" color="white" size="30px").q-mr-sm
          span(:style=`{fontSize: '18px', userSelect: 'none'}`).text-bold.text-white Мои ленты
          .col
  q-page-container
    q-page(:style=`{paddingTop: '50px', paddingBottom: '200px'}`)
      .row.full-width.items-start.content-start.justify-center
        div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width.items-start.content-start
          kalpa-loader(v-if="sphereOid" :mangoQuery="mangoQuery")
            template(v-slot=`{items,next}`)
              list-middle(:items="items" :itemStyles=`{marginBottom: '50px',}`)
                q-infinite-scroll(@load="next" :offset="250")
                template(v-slot:item=`{item,itemIndex,isActive,isVisible}`)
                  feed-item(:item="item" :isActive="isActive" :isVisible="isVisible")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import feedItem from './feed_item.vue'

export default {
  name: 'pageApp__home',
  components: {feedItem},
  data () {
    return {
      feed: 'one',
      feeds: [
        {oid: 'one', name: 'Все подряд'},
        {oid: 'two', name: 'Программисты'},
        {oid: 'three', name: 'Стартапы'},
        {oid: 'four', name: 'Саморазвитие'},
        {oid: 'five', name: 'Спортик'}
      ]
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
          populateObjects: false,
          oidSphere: this.sphereOid
        }
      }
    }
  }
}
</script>
