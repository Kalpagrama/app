<template lang="pug">
q-layout(view="lHh lpR lFf")
  q-drawer(
    side="left"
    :value="$store.state.ui.appShowMenu"
    behavior="mobile" no-swipe-open
    @before-show="$store.commit('ui/stateSet', ['showMobileNavigation', false])"
    @before-hide="$store.commit('ui/stateSet', ['showMobileNavigation', true]), $store.commit('ui/stateSet', ['appShowMenu', false])")
    kalpa-menu(v-if="!loading && $route.name !== 'welcome'").full-height.b-40
  div(
    v-if="$q.screen.width > 1260"
    :style=`{
      position: 'fixed', zIndex: 9999, left: '0px', top: '0px', width: ($q.screen.width-800)/2+'px',
    }`).row.full-height.items-start.content-start.justify-end.q-pa-sm
    kalpa-menu(v-if="!loading && $route.name !== 'welcome'" :style=`{maxWidth: '300px'}`)
  //- mobile navigation
  transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    div(
      v-if="$q.screen.width <= 1260 && $store.state.ui.showMobileNavigation"
      :style=`{
        position: 'fixed', zIndex: 9999, bottom: '0px',
      }`
      ).row.full-width.b-30.q-pa-xs
      q-btn(
        @click="$router.back()"
        round flat color="white"
        icon="keyboard_arrow_left"
        :style=`{marginLeft: $q.screen.width < 800 ? '0px' : ($q.screen.width-800)/2+0+'px'}`)
      .col
      q-btn(
        @click="$store.commit('ui/stateSet', ['appShowMenu', !$store.state.ui.appShowMenu])"
        round flat color="white"
        :icon="$store.state.ui.appShowMenu ? 'clear' : 'menu'"
        :style=`{marginRight: $q.screen.width < 800 ? '0px' : ($q.screen.width-800)/2+0+'px'}`)
  q-page-container
    router-view(v-if="!loading")
    div(
      v-else
      ).row.full-width.window-height.items-center.content-center.justify-center
      q-spinner(color="green" size="100px" :thickness="4")
</template>

<script>
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
        this.$log('appVisible TO', to)
      }
    }
  },
  async created () {
    this.$log('created')
    this.loading = true
    this.$q.addressbarColor.set('#424242')
    // take token from redirect url
    let token = this.$route.query.token
    let expires = this.$route.query.expires
    if (token) {
      localStorage.setItem('k_token', token)
      localStorage.setItem('ktokenExpires', expires)
      await this.$router.push('/').catch(e => e)
    }
    if (!await this.$store.dispatch('init')) {
      this.$log('GO LOGIN')
      await this.$router.push('/auth').catch(e => e)
    }
    else {
      // check welcomepage
      // if (this.$store.getters.currentUser().profile.tutorial) this.$router.replace('/welcome').catch(e => e)
    }
    this.loading = false
  }
}
</script>
