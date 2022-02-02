<template lang="pug">
q-layout(
  view="lHh lpR lFf"
  :container="false")
  q-dialog(
    v-model="authGuardShow"
    position="bottom"
    maximized)
    kalpa-auth-guard(@close="authGuardShow = null" :message="$store.state.ui.authGuard ? $store.state.ui.authGuard.message : ''")
  q-dialog(
    v-model="kalpaTutorialShow"
    maximized
    position="standard")
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
      v-if="$screenProps.isDesktop && $store.state.ui.desktopNavigationShow"
      :style=`{ maxWidth: ($q.screen.width - $store.state.ui.pageWidth) / 2 + 'px',}`
      ).fixed-left.row.fit.items-start.content-start.justify-end.q-pa-xs.z-top
      kalpa-menu(
        :mini="($q.screen.width - $store.state.ui.pageWidth) / 2 < 280"
        :style=`{ maxWidth: ($q.screen.width - $store.state.ui.pageWidth) / 2 < 280 ? '60px' : '280px'}`
        ).fit.br-10
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
// import { useMeta } from 'quasar'
//
// const metaData = {
//   // sets document title
//   title: 'Index Page',
//   // optional; sets final title as "Index Page - My Website", useful for multiple level meta
//   titleTemplate: title => `${title} - My Website`,
//
//   // meta tags
//   meta: {
//     description: { name: 'description', content: 'Page 1' },
//     keywords: { name: 'keywords', content: 'Quasar website' },
//     equiv: { 'http-equiv': 'Content-Type', content: 'text/html; charset=UTF-8' },
//     // note: for Open Graph type metadata you will need to use SSR, to ensure page is rendered by the server
//     ogTitle: {
//       property: 'og:title',
//       // optional; similar to titleTemplate, but allows templating with other meta properties
//       template (ogTitle) {
//         return `${ogTitle} - My Website`
//       }
//     }
//   },
//
//   // CSS tags
//   link: {
//     material: { rel: 'stylesheet', href: 'https://fonts.googleapis.com/icon?family=Material+Icons' }
//   },
//
//   // JS tags
//   script: {
//     ldJson: {
//       type: 'application/ld+json',
//       innerHTML: '{ "@context": "http://schema.org" }'
//     }
//   },
//
//   // <html> attributes
//   htmlAttr: {
//     'xmlns:cc': 'http://creativecommons.org/ns#', // generates <html xmlns:cc="http://creativecommons.org/ns#">,
//     empty: undefined // generates <html empty>
//   },
//
//   // <body> attributes
//   bodyAttr: {
//     'action-scope': 'xyz', // generates <body action-scope="xyz">
//     empty: undefined // generates <body empty>
//   },
//
//   // <noscript> tags
//   noscript: {
//     default: 'This is content for browsers with no JS (or disabled JS)'
//   }
// }

export default {
  name: 'mainLayout',
  components: {
    kalpaMenu,
    kalpaAuthGuard,
    kalpaInitialSetup
  },
  // setup () {
  //   // needs to be called in setup()
  //   useMeta(metaData)
  // },
  data() {
    return {
      kalpaInitialSetupShow: false,
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
    onBusEvent({notice, force}) {
      if (force || (this.$store.getters.currentUser.profile.role !== 'GUEST' && !this.$store.getters.currentUser.profile.notice[notice])) {
        if (notice === 'initial_settings') {
          this.kalpaInitialSetupShow = true
        } else {
          this.noticeName = notice
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
      this.$eventBus.$emit('notice-check', {notice: 'initial_settings', force: false})
    } else {
      this.$eventBus.$emit('notice-check', {notice: 'tutorial_main', force: false})
    }
  },
  beforeUnmount () {
    this.$log('beforeDestroy')
    this.$eventBus.$off('notice-check', this.onBusEvent)
  }
}
</script>
