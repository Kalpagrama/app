<style lang="sass">
// iframe
//   width: 100%
//   height: 500px
.q-btn
  borderRadius: 10px
.q-header
  background: none !important
.q-footer
  background: none !important
h1
  font-size: 60px
  font-weight: 400
  margin: 0
// html, body
//   position: fixed
//   bottom: 0px
.menu-item
  &:hover
    background: #888
</style>

<template lang="pug">
q-layout( view="hHh Lpr lff" container :style=`{height: $q.screen.height+'px'}`)
  kalpa-action
  q-dialog(
    :value="$store.state.ui.menuAppShow" @hide="$store.commit('ui/stateSet', ['menuAppShow', false])" position="bottom")
    kalpa-menu-xs
  //- menu
  div(
    v-if="$route.name !== 'welcome' && $q.screen.width > $store.state.ui.maxWidthPage+$store.state.ui.maxWidthMenu*2"
    :style=`{
      position: 'fixed',
      zIndex: 1,
      top: '0px',
      width: $store.state.ui.maxWidthMenu+'px',
      left: ($q.screen.width-$store.state.ui.maxWidthPage)/2-$store.state.ui.maxWidthMenu+'px',
      paddingTop: '0px'
    }`).column.q-px-sm.q-pb-sm
    div(
      :style=`{height: '60px'}`
      ).row.full-width.items-center.content-center
      div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
        q-btn(round flat color="white" :style=`{borderRadius: '50%'}`)
          q-icon(name="blur_on" size="36px" color="white")
      span(:style=`{fontSize: '18px'}`).text-white.text-bold Kalpagramma
    .col.full-width.q-pt-sm
      div(
        :style=`{
          borderRadius: '10px', overflow: 'hidden'
        }`
        ).column.full-width.bg-grey-9
          router-link(
            v-if="!loading"
            :to="'/user/'+$store.getters.currentUser.oid"
            :style=`{height: '70px'}`
            ).row.full-width.items-center.content-center
            div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
              kalpa-avatar(:url="$store.getters.currentUser.profile.photoUrl" :width="40" :height="40")
            .col.full-height
              .row.fit.items-center.content-center
                span(:style=`{lineHeight: 1.1}`).text-white.text-bold Ivan Motovilov
                small.text-white.full-width @ivanmoto
          router-link(
            v-for="(p,pi) in pages" :key="p.id"
            :to="{name: p.id}"
            :class=`{
              'bg-grey-7': $route.name === p.id
            }`
            :style=`{
              height: '50px'
            }`
            ).row.full-width.items-center.menu-item
            div(:style=`{height: '50px', width: '60px'}`).row.items-center.content-center.justify-center
              q-btn(round dense flat :icon="p.icon" color="white")
            span.text-white {{ p.name }}
          .row.full-width.items-center.q-px-md.q-py-sm
            small.text-white 1.0.0
  q-page-container.fit
    q-page.fit
      router-view(
        v-if="!loading")
      div(
        v-else
        ).row.full-width.window-height.items-center.content-center.justify-center.bg-black
        q-spinner(color="green" size="50px")
</template>

<script>
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock'
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
      drawerMini: true,
      offsetTop: null,
      pages: [
        {id: 'home', name: 'Home', icon: 'home'},
        {id: 'subscriptions', name: 'Subscriptions', icon: 'list'},
        {id: 'notifications', name: 'Notifications', icon: 'notifications'},
        {id: 'trends', name: 'Trends', icon: 'whatshot'},
        {id: 'workspace', name: 'Workspace', icon: 'school'},
        {id: 'settings', name: 'Settings', icon: 'tune'},
        {id: 'report', name: 'Report a bug', icon: 'bug_report'},
        {id: 'refresh', name: 'Refresh', icon: 'refresh'},
        {id: 'logout', name: 'Logout', icon: 'power_off'},
      ]
    }
  },
  methods: {
    onResize (e) {
      this.$log('onResize', e)
      let vv = window.visualViewport
      this.$log('vv', vv)
      let height = vv.height
      this.offsetTop = vv.offsetTop
      this.$store.commit('ui/stateSet', ['height', height])
      this.$store.commit('ui/stateSet', ['offsetTop', this.offsetTop])
      // this.$q.notify('onResize: ' + height + '/' + this.offsetTop)
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
  },
  mounted () {
    window.visualViewport.addEventListener('resize', this.onResize)
    this.onResize()
  },
  beforeDestroy () {
    window.visualViewport.removeEventListener('resize', this.onResize)
  }
}
</script>
