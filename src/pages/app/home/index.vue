<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-header(reveal)
    .row.full-width.justify-center.b-30
      div(:style=`{position: 'relative', maxWidth: '800px'}`).row.full-width.q-pt-sm
        div(:style=`{height: '50px', borderRadius: '10px',}`
          ).row.full-width.items-center.content-center.justify-between.q-pl-md.q-pr-xs.b-40
          q-icon(name="view_week" color="white" size="30px").q-mr-sm
          span(:style=`{fontSize: '18px', userSelect: 'none'}`).text-bold.text-white {{$t('pageApp_MyFeeds_title', 'Мои ленты')}}
          .col
          q-btn(round flat color="green" icon="add" to="/settings/feeds")
          q-btn(round flat color="white" icon="settings" to="/settings/feeds")
  q-page-container
    q-page(:style=`{paddingTop: '50px', paddingBottom: '200px'}`)
      .row.full-width.items-start.content-start.justify-center
        div(:style=`{maxWidth: '800px'}`).row.full-width.items-start.content-start
          kalpa-loader(v-if="sphereOid" :mangoQuery="mangoQuery")
            template(v-slot=`{items,itemsMore}`)
              list-middle(:items="items" :more="itemsMore" :itemStyles=`{marginBottom: '50px',}`)
                template(v-slot:item=`{item,itemIndex,isActive,isVisible}`)
                  node-lite(:node="item" :isActive="isActive" :isVisible="isVisible")
      q-page-sticky(
        expand position="top" :style=`{zIndex: 1000}`)
        .row.full-width.justify-center.b-30
          div(:style=`{maxWidth: '800px', height: '50px',}`).row.full-width.q-px-md
            q-tabs(
              v-model="feed" switch-indicator
              no-caps active-color="white" align="left"
              ).fit.text-grey-8
              q-tab(v-for="(f,fi) in feeds" :key="f.oid" :name="f.oid" :label="f.name")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageApp__home',
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
          oidSphere: this.sphereOid
        }
      }
    }
  }
}
</script>
