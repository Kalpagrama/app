<template lang="pug">
//component(
//  v-if="contentKalpa"
//  :is="'layout-'+layoutId"
//  :key="contentKalpa.oid"
//  :contentKalpa="contentKalpa"
//  :draftId="$route.query.draftId")
content-extended(:oid="oid")
</template>

<script>
import { ObjectApi } from 'src/api/object'
import { RxCollectionEnum } from 'src/system/rxdb'
import contentExtended from 'src/components/kalpa_item/item_extended/content_extended'
import layoutDefault from './layout_default/index.vue'
import layoutVideo from './layout_video/index.vue'
import layoutImage from './layout_image/index.vue'
import layoutBook from './layout_book/index.vue'

export default {
  name: 'pageApp_content',
  props: ['oid'],
  components: {
    contentExtended,
    layoutDefault,
    layoutVideo,
    layoutImage,
    layoutBook,
  },
  data () {
    return {
      contentKalpa: null,
      isActiveStart: 0,
    }
  },
  watch: {
    oid: {
      deep: true,
      immediate: true,
      async handler (to, from) {
        this.$log('oid TO', to)
        if (to) {
          this.$set_deprecated(this, 'contentKalpa', await this.$rxdb.get(RxCollectionEnum.OBJ, to))
          this.isActiveStart = Date.now()
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
  created () {
    this.$log('created')
  },
  mounted () {
    this.$log('mounted', this.oid)
    document.body.style.background = 'black'
    this.$store.commit('ui/stateSet', ['desktopNavigationShow', false])
    if (this.$store.getters.isGuest) {
      // do nothing ?
    }
    else {
      // do something ?
    }
  },
  async beforeUnmount () {
    this.$log('beforeDestroy')
    this.$store.commit('ui/stateSet', ['desktopNavigationShow', true])
    if (this.$store.getters.isGuest) {
      // do nothing ?
    }
    else {
      // handle views stats
      if (this.isActiveStart > 0) {
        let statValue = Date.now() - this.isActiveStart
        this.$log('statValue', statValue)
        let stat = await ObjectApi.updateStat(this.oid, 'VIEWED_TIME', statValue)
        this.$log('statValue stat', stat)
      }
    }
  }
}
</script>
