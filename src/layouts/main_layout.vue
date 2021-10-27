<template lang="pug">
q-layout(
  view="lHh lpR lFf"
  :container="false")
  q-dialog(
    v-model="authGuardShow"
    maximized)
    kalpa-auth-guard(@close="authGuardShow = null" :message="$store.state.ui.authGuard ? $store.state.ui.authGuard.message : ''")
  q-dialog(
    v-model="kalpaTutorialShow"
    maximized
    position="bottom")
    kalpa-tutorial(
      :config="$store.state.ui.kalpaTutorial"
      @close="kalpaTutorialShow = null")
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
      router-view(v-if="$store.getters.nodeCategories.length > 0")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import kalpaMenu from 'src/components/kalpa_menu/index.vue'
import kalpaAuthGuard from 'src/components/kalpa_auth_guard/index.vue'

export default {
  name: 'mainLayout',
  components: {
    kalpaMenu,
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
    kalpaTutorialShow: {
      get () {
        // this.$store.commit('ui/stateSet', ['kalpaTutorial', {showTutorial: true}])
        return this.$store.state.ui.kalpaTutorial !== null
      },
      set (val) {
        this.$store.commit('ui/stateSet', ['kalpaTutorial', null])
      }
    }
  },
  watch: {
    '$store.getters.currentUser.profile.tutorial': {
      immediate: true,
      async handler (to, from) {
        this.$log('user.profile.tutorial changed to', to)
        if (to && !to.main) {
          this.$store.commit('ui/stateSet', ['kalpaTutorial', {id: 'main', useIntro: true, useProfileEditor: true}])
        }
      }
    }
  },
  async created () {
    this.$log('created')
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
