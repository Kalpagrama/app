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
  q-drawer(
    side="left"
    :value="$store.state.ui.appShowMenu"
    behavior="mobile" no-swipe-open
    :width="$q.screen.width - 70"
    @before-hide="$store.commit('ui/stateSet', ['appShowMenu', false])")
    kalpa-menu(
      :mini="false"
      :style=`{borderRadius: '0 10px 10px 0'}`
      ).full-height.b-40
  //- left menu
  transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    div(
      v-if="$store.state.ui.showDesktopNavigation && $q.screen.width > $store.state.ui.pageMaxWidth+140"
      :style=`{
        position: 'fixed', zIndex: 3000, left: '0px', top: '0px',
        width: ($q.screen.width-$store.state.ui.pageMaxWidth)/2+'px',
      }`).row.full-height.items-start.content-start.justify-end.q-pa-sm
      kalpa-menu(
        :mini="$q.screen.width < $store.state.ui.pageMaxWidth+500"
        :style=`{
          borderRadius: '10px',
          maxWidth: $q.screen.width < $store.state.ui.pageMaxWidth+500 ? '60px' : '240px',
        }`).b-40
  //- mobile menu navigation
  transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    q-footer(v-if="$store.state.ui.showMobileNavigation && $q.screen.width <= $store.state.ui.pageMaxWidth+140")
      kalpa-menu-mobile
  q-page-container
    router-view
    //- div(
      :style=`{height: $q.screen.height-50+'px'}`
      ).row.full-width.items-center.content-center.justify-center
      q-spinner(color="green" size="100px" :thickness="4")
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
