<style lang="sass">
.menu-item
  &:hover
    background: #888
.q-menu
  border-radius: 10px !important
  background: none !important
</style>

<template lang="pug">
q-layout( view="hHh Lpr lff" container :style=`{height: $q.screen.height+'px'}`)
  //- kalpa-action
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
    }`).row.q-px-sm.q-pb-sm
    kalpa-menu(v-if="!loading")
  q-page-container
    q-page
      router-view(
        v-if="!loading")
      div(
        v-else
        ).row.full-width.window-height.items-center.content-center.justify-center.bg-black
        q-spinner(color="green" size="50px")
</template>

<script>
// import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock'
import 'mediaelement/build/mediaelementplayer.min.css'
import 'mediaelement/full'

export default {
  name: 'mainLayout',
  data () {
    return {
      loading: true,
      offsetTop: null
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
    // go to welcom...
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
