<style lang="stylus">
iframe {
  width: 100%;
  height: 500px;
}
</style>

<template lang="pug">
q-layout( view="hHh Lpr lff")
  kalpa-action
  q-drawer(
    v-if="$q.screen.gt.xs && $route.name !== 'welcome'"
    v-model="$q.screen.xs ? false : drawerShow"
    no-swipe-open no-swipe-close
    behavior="desktop"
    :side="$q.screen.xs ? 'right' : 'left'"
    :width="60"
    content-class="bg-grey-8")
    kalpa-menu-desktop(v-if="!loading" :style=`{zIndex: 10000}`)
  q-dialog(
    v-model="drawerShowMobile" position="bottom")
    kalpa-menu-xs(@close="drawerShowMobile = false")
  div(
    v-if="$route.name !== 'welcome'"
    :style=`{position: 'fixed', zIndex: 1000, right: '0px', bottom: '0px',
      width: $q.screen.width/4+'px', height: $q.screen.width/4+'px'}`).row.items-center.content-center.justify-center.xs
    q-btn(
      round flat size="lg" @click="drawerShow = !drawerShow, drawerShowMobile = !drawerShowMobile"
      :color="drawerShowMobile ? 'red' : 'green'"
      :icon="drawerShowMobile ? 'clear' : 'menu'"
      :style=`{background: drawerShowMobile ? 'none' : 'rgba(0,0,0,0.3)'}`)
  q-page-container
    router-view(v-if="!loading")
    div(v-else).row.full-width.window-height.items-center.content-center.justify-center.bg-black
      q-spinner(color="green" size="50px")
</template>

<script>
import 'mediaelement/build/mediaelementplayer.min.css'
import 'mediaelement/full'

export default {
  name: 'mainLayout',
  components: {},
  data () {
    return {
      loading: true,
      drawerShow: true,
      drawerShowMobile: false,
      drawerMini: true
    }
  },
  // watch: {
  //   $route: {
  //     immediate: false,
  //     handler (to, from) {
  //       // check for tutolrial
  //       if (this.$store.getters.currentUser.profile.tutorial) this.$router.replace('/welcome').catch(e => e)
  //     }
  //   }
  // },
  async created () {
    this.$log('created')
    this.loading = true
    this.$q.addressbarColor.set('#424242')
    // take token from redirect url
    let token = this.$route.query.token
    let expires = this.$route.query.expires
    if (token) {
      localStorage.setItem('ktoken', token)
      localStorage.setItem('ktokenExpires', expires)
      await this.$router.push('/').catch(e => e)
    }
    if (!await this.$store.dispatch('init')) {
      this.$log('GO LOGIN')
      await this.$router.push('/auth').catch(e => e)
    }
    if (this.$store.getters.currentUser.profile.tutorial) this.$router.replace('/welcome').catch(e => e)
    this.loading = false
  }
}
</script>
