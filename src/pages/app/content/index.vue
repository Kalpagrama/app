<template lang="pug">
//component(
//  v-if="contentKalpa"
//  :is="'layout-'+layoutId"
//  :key="contentKalpa.oid"
//  :contentKalpa="contentKalpa"
//  :draftId="$route.query.draftId")
// content-extended(:oid="oid")
kalpa-layout()
  template(v-slot:footer)
    kalpa-menu-mobile(v-if="$screenProps.isMobile && !$store.state.ui.userTyping")
      template(v-slot:left-button)
        nav-mobile(
          :pageId="pageId"
          @pageId="pageIdChange")
      template(v-slot:center)
        .row.content-center
          span.text-grey-7 {{$t('Страница контента')}}
  template(v-slot:body)
    .row.full-width.items-start.content-start.justify-center
      content-extended(:oid="oid")
</template>

<script>
import { ObjectApi } from 'src/api/object'
import { RxCollectionEnum } from 'src/system/rxdb'
import contentExtended from 'src/components/kalpa_item/item_extended/content_extended'
import layoutDefault from './layout_default/index.vue'
import navMobile from 'src/components/kalpa_menu_mobile/nav_mobile.vue'
import layoutVideo from './layout_video/index.vue'
import layoutImage from './layout_image/index.vue'
import layoutBook from './layout_book/index.vue'
import { assert } from 'src/system/common/utils'

export default {
  name: 'pageApp_content',
  props: ['oid'],
  components: {
    contentExtended,
    layoutDefault,
    layoutVideo,
    navMobile,
    layoutImage,
    layoutBook,
  },
  data () {
    return {
      contentKalpa: null,
      startWatchDt: null,
    }
  },
  watch: {
    oid: {
      immediate: true,
      async handler (to, from) {
        this.$log('oid TO', to)
        if (from) await this.updateStat(from, this.startWatchDt)
        if (to) {
          this.contentKalpa = await this.$rxdb.get(RxCollectionEnum.OBJ, to)
          this.startWatchDt = Date.now()
        }
      }
    },
    'contentKalpa.payInfo.paid': {
      immediate: true,
      async handler (to, from) {
        if (!to && this.contentKalpa && this.contentKalpa.payInfo.price && this.contentKalpa.author.oid !== this.$store.getters.currentUser.oid) {
          this.$logT('content is paid! goto short version...')
          await this.$router.replace('/cover/' + this.contentKalpa.oid)
        }
      }
    }
  },
  computed: {
    layoutId () {
      if (this.contentKalpa.type === 'VIDEO') return 'video'
      else if (this.contentKalpa.type === 'BOOK') return 'book'
      else if (this.contentKalpa.type === 'IMAGE') return 'image'
      else return 'default'
    }
  },
  methods: {
    async updateStat(oid, startDt) {
      // todo переместить вовнутрь плеера и учитывать реально просмотренное
      assert(oid)
      assert(startDt)
      if (!this.$store.getters.isGuest) {
        // handle views stats
        if (startDt > 0) {
          let statValue = Date.now() - startDt
          this.$log('statValue', statValue)
          let stat = await ObjectApi.updateStat(oid, 'VIEWED_TIME', statValue)
          this.$log('statValue stat', stat)
        }
      }
    }
  },
  created () {
    this.$log('created')
  },
  mounted () {
    // this.$log('mounted', this.oid)
    document.body.style.background = 'black'
    // this.$store.commit('ui/stateSet', ['desktopNavigationShow', false])
  },
  async beforeUnmount () {
    this.$log('beforeDestroy')
    // this.$store.commit('ui/stateSet', ['desktopNavigationShow', true])
    await this.updateStat(this.oid, this.startWatchDt)
  }
}
</script>
