<template lang="pug">
kalpa-layout()
  template(v-slot:footer)
    kalpa-menu-mobile(v-if="$q.screen.lt.md && !$store.state.ui.userTyping")
      template(v-slot:left-button)
        nav-mobile(
          :pageId="pageId"
          @pageId="pageIdChange")
      template(v-slot:center)
        .row.content-center
          span.text-grey-7 {{$t('Content page', 'Страница контента')}}
  template(v-slot:body)
    .row.full-width.justify-center
      item-card(
        v-if="contentKalpa"
        :item="contentKalpa"
        )
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import itemCard from 'src/components/kalpa_item/item_card/viewer'
import navMobile from 'src/components/kalpa_menu_mobile/nav_mobile.vue'

export default {
  name: 'pageApp_content',
  props: ['oid'],
  components: {
    itemCard,
    navMobile,
  },
  data () {
    return {
      contentKalpa: null,
    }
  },
  watch: {
    oid: {
      deep: true,
      immediate: true,
      async handler (to, from) {
        this.$log('oid TO', to)
        if (to) {
          this.contentKalpa = await this.$rxdb.get(RxCollectionEnum.OBJ, to)
        }
      }
    },
  },
  computed: {
  },
  created () {
    this.$log('created')
  },
  mounted () {
    this.$log('mounted', this.oid)
  },
  async beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
