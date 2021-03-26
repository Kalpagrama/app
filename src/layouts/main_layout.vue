<template lang="pug">
q-layout(
  view="lHh lpR lFf"
  :container="false")
  q-dialog(
    v-model="authGuardShow"
    maximized
    position="bottom")
    kalpa-auth-guard(@close="authGuardShow = null")
  q-dialog(
    v-model="kalpaWelcomeShow"
    maximized
    position="bottom")
    kalpa-welcome(
      :config="$store.state.ui.kalpaWelcome"
      @close="kalpaWelcomeShow = null")
  transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    div(
      v-if="$q.screen.gt.sm && $store.state.ui.desktopNavigationShow"
      :style=`{
        position: 'fixed', zIndex: 3000, left: '0px', top: '0px',
        maxWidth: ($q.screen.width - $store.state.ui.pageWidth) / 2 + 'px',
      }`).row.fit.items-start.content-start.justify-end.q-pa-sm
      kalpa-menu(
        :mini="($q.screen.width - $store.state.ui.pageWidth) / 2 < 280"
        :style=`{
          borderRadius: '10px',
          maxWidth: ($q.screen.width - $store.state.ui.pageWidth) / 2 < 280 ? '60px' : '280px',
        }`).fit
  //- mobile menu navigation
  //- transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    q-footer(v-if="$q.screen.lt.md && $store.state.ui.mobileNavigationShow")
      kalpa-menu-mobile
  q-page-container
    router-view(v-if="$store.state.ui.nodeCategories.length > 0")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import kalpaMenu from 'components/kalpa_menu/index.vue'
import kalpaAuthGuard from 'components/kalpa_auth_guard/index.vue'

export default {
  name: 'mainLayout',
  components: {
    kalpaMenu,
    // kalpaMenuMobile,
    kalpaAuthGuard
  },
  data () {
    return {
    }
  },
  computed: {
    authGuardShow: {
      get () {
        return this.$store.state.ui.authGuard !== null
      },
      set (val) {
        this.$store.commit('ui/stateSet', ['authGuard', null])
      }
    },
    kalpaWelcomeShow: {
      get () {
        return this.$store.state.ui.kalpaWelcome !== null
      },
      set (val) {
        this.$store.commit('ui/stateSet', ['kalpaWelcome', null])
      }
    }
  },
  methods: {
  },
  async created () {
    this.$log('created')
    // Check tutorials
    let userTutorials = this.$store.getters.currentUser().profile.tutorial
    this.$log('userTutorials', userTutorials)
    this.$log('userTutorials', userTutorials.main)
    if (userTutorials.main === false) {
      this.$store.commit('ui/stateSet', ['kalpaWelcome', {id: 'main', useIntro: true, useProfileEditor: true}])
    }
    // Node categories
    let nodeCategories = await this.$rxdb.get(RxCollectionEnum.GQL_QUERY, 'nodeCategories')
    this.$store.commit('ui/stateSet', ['nodeCategories', nodeCategories])
  },
  async mounted () {
    this.$log('mounted')
    this.$ym('APP_MOUNTED')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
