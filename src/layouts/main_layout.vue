<style lang="sass">
.q-menu
  border-radius: 10px !important
  // background: none !important
.q-drawer
  z-index: 100000
  // border-radius: 10px 10px 0 0 !important
  border-radius: 10px !important
  background: none !important
.q-input
  z-index: 100
  border-radius: 10px !important
  overflow: hidden !important
  transform: translate3d(0,0,0)
.q-dialog__backdrop
  background: rgba(0,0,0,0.8) !important
.k-input
  border: none
  border-radius: 10px
  overflow: hidden
  padding-left: 16px
  padding-right: 16px
  color: white
  height: 42px
  &:focus
    outline: none
    border: 1px solid rgb(150,150,150)
// *
//   outline: 0.5px solid red
</style>

<template lang="pug">
q-layout(view="hHh Lpr lff").bg-30
  //- menu
  div(
    v-if="$route.name !== 'welcome' && $q.screen.width > $store.state.ui.maxWidthPage+$store.state.ui.maxWidthMenu*2"
    :style=`{
      position: 'fixed',
      zIndex: 1,
      top: '0px',
      width: $store.state.ui.maxWidthMenu+'px',
      left: ($q.screen.width-$store.state.ui.maxWidthPage)/2-$store.state.ui.maxWidthMenu+'px'
    }`).row.q-pa-sm
    kalpa-menu(v-if="!loading" :style=`{borderRadius: '10px', overflow: 'hidden'}`)
  q-page-container
    q-page(:style=`{}`)
      router-view(
        v-if="!loading")
      div(
        v-else
        ).row.full-width.window-height.items-center.content-center.justify-center.bg-black
        q-spinner(color="green" size="50px")
  q-drawer(side="left" :value="$store.state.ui.appShowMenu" @hide="$store.commit('ui/stateSet', ['appShowMenu', false])")
    kalpa-menu(
      v-if="!loading"
      :style=`{
        borderRadius: '0 10px 10px 0'
      }`)
</template>

<script>
// import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock'
import 'mediaelement/build/mediaelementplayer.min.css'
import 'mediaelement/full'
import assert from 'assert'

export default {
  name: 'mainLayout',
  data () {
    return {
      loading: true,
      offsetTop: null,
      showLeftDrawer: false
    }
  },
  meta: {
    title: 'Kalpagramma'
  },
  methods: {
    // onResize (e) {
    //   this.$log('onResize', e)
    //   let vv = window.visualViewport
    //   this.$log('vv', vv)
    //   let height = vv.height
    //   this.offsetTop = vv.offsetTop
    //   this.$store.commit('ui/stateSet', ['height', height])
    //   this.$store.commit('ui/stateSet', ['offsetTop', this.offsetTop])
    // }
  },
  async created () {
    this.$log('created')
    // alert('created')
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
      // alert('GO LOGIN')
      await this.$router.push('/auth').catch(e => e)
    } else { // залогинились
      // go to welcome...
      if (this.$store.getters.currentUser().profile.tutorial) this.$router.replace('/welcome').catch(e => e)
    }
    this.loading = false
  },
  mounted () {
    // window.visualViewport.addEventListener('resize', this.onResize)
    // this.onResize()
  },
  beforeDestroy () {
    // window.visualViewport.removeEventListener('resize', this.onResize)
  }
}
</script>
