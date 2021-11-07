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
        :tutorialId="noticeName"
        @close="kalpaTutorialShow = null")
    q-dialog(
      v-model="kalpaInitialSetupShow"
      maximized
      persistent
      position="standard")
      kalpa-initial-setup(
        @close="kalpaInitialSetupShow = null")
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
import kalpaMenu from 'src/components/kalpa_menu/index.vue'
import kalpaInitialSetup from 'src/components/kalpa_initial_setup/index.vue'
import kalpaAuthGuard from 'src/components/kalpa_auth_guard/index.vue'

export default {
  name: 'mainLayout',
  components: {
    kalpaMenu,
    kalpaAuthGuard,
    kalpaInitialSetup
  },
  data() {
    return {
      kalpaInitialSetupShow: true,
      kalpaTutorialShow: false,
      noticeName: null
    }
  },
  computed: {
    authGuardShow: {
      get() {
        return this.$store.state.ui.authGuard !== null
      },
      set(val) {
        this.$store.commit('ui/stateSet', ['authGuard', null])
      }
    }
  },
  methods: {
    onBusEvent(noticeName) {
      if (this.$store.getters.currentUser.profile.role !== 'GUEST' && !this.$store.getters.currentUser.profile.notice[noticeName]) {
        if (noticeName === 'initial_settings') {
          this.kalpaInitialSetupShow = true
        } else {
          this.noticeName = noticeName
          this.kalpaTutorialShow = true
        }
      }
    }
  },
  async created() {
    this.$log('created')
  },
  async mounted() {
    this.$log('mounted')
    this.$ym('APP_MOUNTED')
    this.$eventBus.$on('notice-check', this.onBusEvent)
    if (!this.$store.getters.currentUser.profile.notice.initial_settings) {
      this.$eventBus.$emit('notice-check', 'initial_settings')
    } else {
      this.$eventBus.$emit('notice-check', 'tutorial_main')
    }
  },
  beforeDestroy() {
    this.$log('beforeDestroy')
    this.$eventBus.$off('notice-check', this.onBusEvent)
  }
}
</script>
