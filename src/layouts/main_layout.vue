<template lang="pug">
q-layout(
  view="lHh lpR lFf"
  :container="false")
  q-dialog(
    v-model="authGuardShow")
    kalpa-auth-guard(@close="authGuardShow = null")
  q-dialog(
    v-model="kalpaWelcomeShow" :maximized="true"
    @hide="kalpaWelcomeShown")
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
        this.$log('authGuardShow', val)
        this.$store.commit('ui/stateSet', ['authGuard', val])
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
     async kalpaWelcomeShown () {
      this.$log('kalpaWelcomeShown')
    },
  },
  async beforeCreate () {
    this.$log('beforeCreate')
  },
  async beforeMount () {
    this.$log('beforeMount')
  },
  async created () {
    this.$log('created')
    let nodeCategories = await this.$rxdb.get(RxCollectionEnum.GQL_QUERY, 'nodeCategories')
    this.$store.commit('ui/stateSet', ['nodeCategories', nodeCategories])
    let userTutorials = this.$store.getters.currentUser().profile.tutorial
    this.$log('userTutorials', userTutorials)
    if (!userTutorials.workspace_first) {
      this.$store.commit('ui/stateSet', ['kalpaWelcome', {id: 'main', mode: 'slides-only'}])
    }
    if (this.$store.getters.currentUser().profile.role === 'GUEST') {
      // do nothing ?
    }
    else {
    }
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
