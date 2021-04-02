<template lang="pug">
component(
  v-if="contentKalpa"
  :is="'layout-'+layoutId"
  :key="contentKalpa.oid"
  :contentKalpa="contentKalpa")
</template>

<script>
import { ObjectApi } from 'src/api/object'
import { RxCollectionEnum } from 'src/system/rxdb'

import layoutDefault from './layout_default/index.vue'
import layoutVideo from './layout_video/index.vue'
import layoutImage from './layout_image/index.vue'
import layoutBook from './layout_book/index.vue'

export default {
  name: 'pageApp_content',
  props: ['oid'],
  components: {
    layoutDefault,
    layoutVideo,
    layoutImage,
    layoutBook,
  },
  data () {
    return {
      contentKalpa: null,
      isActiveStart: 0,
      user: this.$store.getters.currentUser()
    }
  },
  watch: {
    oid: {
      deep: true,
      immediate: true,
      async handler (to, from) {
        this.$log('oid TO', to)
        if (to) {
          this.$set(this, 'contentKalpa', await this.$rxdb.get(RxCollectionEnum.OBJ, to))
          this.isActiveStart = Date.now()
        }
      }
    },
    'user.profile.tutorial': {
      immediate: true,
      async handler (to, from) {
        this.$log('user.profile.tutorial changed to', to)
        if (to && !to.content_first) {
          this.$store.commit('ui/stateSet', ['kalpaWelcome', {id: 'content_first', useIntro: true, useProfileEditor: true}])
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
  async beforeDestroy () {
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
