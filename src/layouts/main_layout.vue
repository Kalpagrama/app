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
    :width="$q.screen.width - 60"
    @before-show="$store.commit('ui/stateSet', ['showMobileNavigation', false])"
    @before-hide="$store.commit('ui/stateSet', ['showMobileNavigation', true]), $store.commit('ui/stateSet', ['appShowMenu', false])")
    kalpa-menu(
      v-if="!loading && $route.name !== 'welcome'"
      :mini="false"
      :style=`{borderRadius: '0 10px 10px 0'}`
      ).full-height.b-40
  //- left menu
  transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    div(
      v-if="$store.state.ui.showDesktopNavigation && $q.screen.width > 1020+200"
      :style=`{
        position: 'fixed', zIndex: 3000, left: '0px', top: '0px',
        width: ($q.screen.width-$store.state.ui.pageMaxWidth)/2+'px',
      }`).row.full-height.items-start.content-start.justify-end.q-pa-sm
      kalpa-menu(
        v-if="!loading && $route.name !== 'welcome'"
        :mini="false"
        :style=`{
          borderRadius: '10px',
          maxWidth: $q.screen.width < 1020+400 ? '60px' : '240px',
        }`).b-40
  //- right menu
  //- transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    div(
      v-if="true && $q.screen.width > 1020+200"
      :style=`{
        position: 'fixed', zIndex: 3000, right: '0px', top: '0px',
        width: ($q.screen.width-$store.state.ui.pageMaxWidth)/2+'px',
      }`).row.full-height.items-start.content-start.justify-start.q-pa-sm
      div(:style=`{borderRadius: '10px',}`).column.fit.b-40
        div(:style=`{height: '60px'}`).row.full-width.br
        .col.full-width.scroll
          .row.full-width.items-start.content-start.q-pa-sm
            div(
              v-for="n in 100" :key="n"
              :style=`{}`
              ).row.full-width.br
              span.text-white item
      //- kalpa-menu(
      //-   v-if="!loading && $route.name !== 'welcome'"
      //-   :inDrawer="false"
      //-   :style=`{
      //-     borderRadius: '10px',
      //-     maxWidth: $q.screen.width < 1020+400 ? '60px' : '240px',
      //-   }`).b-40
  //- mobile navigation
  transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    q-footer(v-if="$store.state.ui.showMobileNavigation && $q.screen.width < 960")
      .row.full-width.justify-center
        div(
          :style=`{maxWidth: $store.state.ui.pageMaxWidth+'px', borderRadius: '10px 10px 0 0'}`
          ).row.full-width.items-center.content-center.justify-between.q-pa-sm.b-40
          q-btn(
            @click="$router.back()"
            round flat dense color="white" icon="keyboard_arrow_left")
          q-btn(
            :to="{name: 'home'}"
            round flat dense icon="rss_feed"
            :color="$route.name.split('.')[0] === 'home' ? 'green' : 'grey-4'")
          //- router-link(
            v-if="$store.getters.currentUser()"
            :to="'/user/'+$store.getters.currentUser().oid"
            :style=`{
              border: $route.name.split('.')[0] === 'user' ? '3px solid #4caf50' : 'none',
              borderRadius: '50%', overflow: 'hidden',
            }`)
            user-avatar(:url="$store.getters.currentUser().profile.photoUrl" :width="25" :height="25")
          q-btn(
            :to="'/workspace/node/new'"
            round dense color="green" icon="add"
            :style=`{borderRadius: '50%'}`)
          q-btn(
            :to="{name: 'workspace'}"
            round flat dense icon="school"
            :color="$route.name.split('.')[0] === 'workspace' ? 'green' : 'grey-4'")
          q-btn(
            @click="$store.commit('ui/stateSet', ['appShowMenu', !$store.state.ui.appShowMenu])"
            round flat dense color='white' icon="menu")
  q-page-container
    //- keep-alive(:max="10")
      router-view(v-if="!loading")
    router-view(v-if="!loading")
    div(
      v-if="loading"
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
      loading: true,
    }
  },
  watch: {
    '$q.appVisible': {
      immediate: true,
      async handler (to, from) {
        // this.$log('appVisible TO', to)
      }
    }
  },
  async created () {
    // this.$log('created')
    this.loading = true
    this.$q.addressbarColor.set('#424242')
    this.loading = false
  }
}
</script>
