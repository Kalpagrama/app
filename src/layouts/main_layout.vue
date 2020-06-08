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
q-layout(
  view="hHh Lpr lff"
  container :style=`{height: $q.screen.height+'px',}`).bg-30
  q-drawer(
    side="left" :value="$store.state.ui.appShowMenu" @hide="$store.commit('ui/stateSet', ['appShowMenu', false])")
    kalpa-menu(
      v-if="!loading"
      :style=`{
        borderRadius: '0 10px 10px 0'
      }`)
  q-page-container
    q-page(:style=`{height: $q.screen.height+'px'}`)
      .row.fit.justify-center.q-pt-sm
        div(:style=`{position: 'relative', maxWidth: maxWidth+'px'}`).col.full-height
          div(
            :style=`{
              position: 'absolute', zIndex: 99999, left: '-300px',
              width: '300px', height: '500px'
            }`).row.q-pr-sm
            kalpa-menu
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
import assert from 'assert'

export default {
  name: 'mainLayout',
  data () {
    return {
      maxWidth: 800,
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
    // disableBodyScroll(document.body)
    // window.visualViewport.addEventListener('resize', this.onResize)
    // this.onResize()
  },
  beforeDestroy () {
    // window.visualViewport.removeEventListener('resize', this.onResize)
  }
}
</script>
