<style lang="sass">
.shaking
  &:hover
    animation: shake 0.82s cubic-bezier(.36,.07,.19,.97) both
    transform: translate3d(0, 0, 0)
    backface-visibility: hidden
    perspective: 1000px
    color: #4caf50 !important
@keyframes shake
  10%, 90%
    transform: translate3d(-1px, 0, 0)
    color: #4caf50 !important
  20%, 80%
    transform: translate3d(2px, 0, 0)
    color: #4caf50 !important
  30%, 50%, 70%
    transform: translate3d(-2px, 0, 0)
    color: #4caf50 !important
  40%, 60%
    transform: translate3d(2px, 0, 0)
    color: #4caf50 !important
.q-footer
  transform: translate3d(0,0,30px) !important
</style>

<template lang="pug">
q-layout(view="lHh lpR lFf")
  q-drawer(
    v-if="$q.screen.lt.md"
    side="left" no-swipe-open
    :value="$store.state.ui.mobileMenuShow"
    behavior="mobile"
    :width="$q.screen.width - 70"
    @before-hide="$store.commit('ui/stateSet', ['mobileMenuShow', false])")
    kalpa-menu(
      :mini="false"
      :style=`{borderRadius: '0 10px 10px 0'}`
      ).full-height.b-40.q-pt-md
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
  transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    q-footer(
      v-if="$q.screen.lt.md && $store.state.ui.mobileNavigationShow"
      :style=`{
         paddingBottom: 'env(safe-area-inset-bottom)',
      }`).b-30
      kalpa-menu-mobile
  q-page-container
    router-view
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import kalpaMenu from 'components/kalpa_menu/index.vue'
import kalpaMenuMobile from 'components/kalpa_menu_mobile/index.vue'

export default {
  name: 'mainLayout',
  components: {
    kalpaMenu, kalpaMenuMobile,
  },
  data () {
    return {
    }
  },
  watch: {
  },
  async mounted () {
    let nodeCategories = await this.$rxdb.get(RxCollectionEnum.GQL_QUERY, 'nodeCategories')
    this.$store.commit('ui/stateSet', ['nodeCategories', nodeCategories])
  },
  async created () {
    this.$store.commit('ui/stateSet', ['pageHeight', this.$q.screen.height])
    this.$q.addressbarColor.set('#424242')
  }
}
</script>
