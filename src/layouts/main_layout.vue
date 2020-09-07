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
      :inDrawer="true"
      :style=`{borderRadius: '0 10px 10px 0'}`
      ).full-height.b-40
  transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    div(
      v-if="$q.screen.width > 960"
      :style=`{
        position: 'fixed', zIndex: 3000, left: '0px', top: '0px', width: ($q.screen.width-800)/2+'px',
      }`).row.full-height.items-start.content-start.justify-end.q-pa-sm
      kalpa-menu(
        v-if="!loading && $route.name !== 'welcome'"
        :inDrawer="false"
        :style=`{
          borderRadius: '10px',
          maxWidth: $q.screen.width < 1260 ? '60px' : '300px',
        }`).b-40
  //- mobile navigation
  transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    q-footer(v-if="$store.state.ui.showMobileNavigation && $q.screen.width < 960")
      .row.full-width.justify-center
        div(
          :style=`{maxWidth: '800px', borderRadius: '10px 10px 0 0'}`
          ).row.full-width.items-center.content-center.justify-between.q-pa-sm.b-40
          q-btn(
            @click="$router.back()"
            round flat dense color="white" icon="keyboard_arrow_left")
          q-btn(
            :to="{name: 'home'}"
            round flat dense icon="view_week"
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
    router-view(v-if="!loading")
    div(
      v-if="loading"
      :style=`{height: $q.screen.height-50+'px'}`
      ).row.full-width.items-center.content-center.justify-center
      q-spinner(color="green" size="100px" :thickness="4")
</template>

<script>
import { systemLogin } from 'src/system/services'
import { AuthApi } from 'src/api/auth'

export default {
  name: 'mainLayout',
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
    // this.$log('systemLogin...')
    await systemLogin()
    this.loading = false
  }
}
</script>
