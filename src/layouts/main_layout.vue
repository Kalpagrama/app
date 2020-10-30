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
@-webkit-keyframes rotating
  from
    -webkit-transform: rotate(0deg)
  to
    -webkit-transform: rotate(-360deg)
.rotating
  -webkit-animation: rotating 2s linear infinite
</style>

<template lang="pug">
q-layout(view="lHh lpR lFf")
  //- no-swipe-open
  q-drawer(
    v-if="$q.screen.lt.md"
    side="left"
    :value="$store.state.ui.appShowMenu"
    behavior="mobile"
    :width="$q.screen.width - 70"
    @before-hide="$store.commit('ui/stateSet', ['appShowMenu', false])")
    kalpa-menu(
      :mini="false"
      :style=`{borderRadius: '0 10px 10px 0'}`
      ).full-height.b-40.q-pt-md
  //- left menu
  transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    div(
      v-if="$q.screen.gt.sm && $store.state.ui.showDesktopNavigation"
      :style=`{
        position: 'fixed', zIndex: 3000, left: '0px', top: '0px',
        maxWidth: $q.screen.lt.lg ? '70px' : '250px',
        minHeight: $q.screen.height+'px',
      }`).row.fit.items-start.content-start.justify-start.q-pt-sm.q-px-sm
      kalpa-menu(
        :mini="$q.screen.lt.lg"
        :style=`{
          borderRadius: '10px',
          maxWidth: $q.screen.lt.lg ? '60px' : '240px',
        }`).fit
  //- mobile menu navigation
  transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    q-footer(v-if="$q.screen.lt.md && $store.state.ui.showMobileNavigation")
      kalpa-menu-mobile
  q-page-container
    router-view
</template>

<script>
import { systemInit } from 'src/system/services'
import { AuthApi } from 'src/api/auth'

import authLayout from 'layouts/auth_layout.vue'

export default {
  name: 'mainLayout',
  components: {authLayout},
  data () {
    return {
      // loading: true,
    }
  },
  watch: {
    // '$q.appVisible': {
    //   immediate: true,
    //   async handler (to, from) {
    //     // this.$log('appVisible TO', to)
    //   }
    // }
  },
  async created () {
    // this.$log('created')
    // this.loading = true
    this.$q.addressbarColor.set('#424242')
    // this.loading = false
  }
}
</script>
