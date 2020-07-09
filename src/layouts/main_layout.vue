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
  container :style=`{height: $q.screen.height+'px',}`
  @resize="onResize").bg-30
  q-drawer(
    behavior="mobile"
    side="left" :value="$store.state.ui.appShowMenu" @hide="$store.commit('ui/stateSet', ['appShowMenu', false])")
    kalpa-menu(
      v-if="!loading"
      :style=`{
        borderRadius: '0 10px 10px 0'
      }`).full-height
  q-page-container
    q-page(:style=`{height: $q.screen.height+'px'}`)
      div(
        :class=`{
          'q-pt-sm': false
        }`
        :style=`{}`).row.fit.justify-center
          //- div(:style=`{position: 'relative', maxWidth: maxWidth+'px'}`).col.full-height
          //- left panel menu
          div(
            v-if="$q.screen.width > 1260"
            @wheel="onWheel"
            :style=`{
              position: 'fixed', zIndex: 9999, left: '0px', top: '0px', width: ($q.screen.width-800)/2+'px',
              pointerEvents: pointerEvents,
            }`).row.full-height.items-start.content-start.justify-end.q-pa-sm
            kalpa-menu(v-if="!loading && $route.name !== 'welcome'" :style=`{maxWidth: '300px'}`)
          router-view(
            v-if="!loading")
          div(
            v-else
            ).row.full-width.window-height.items-center.content-center.justify-center
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
      showLeftDrawer: false,
      pointerEventsTimeout: null,
      pointerEvents: false,
    }
  },
  meta: {
    title: 'Kalpagrama'
  },
  watch: {
    '$store.state.ui.appFullscreen': {
      immediate: true,
      handler (to, from) {
        this.$log('$store.state.ui.appFullscreen TO', to)
        // this.$tween.to(this, 0.3, {maxWidth: to ? this.$q.screen.width : 800})
        this.maxWidth = to ? this.$q.screen.width : 800
      }
    }
  },
  methods: {
    onWheel (e) {
      // this.$log('onWheel', e)
      if (this.pointerEventsTimeout !== undefined) clearTimeout(this.pointerEventsTimeout)
      this.pointerEvents = 'none'
      this.pointerEventsTimeout = setTimeout(() => {
        this.pointerEvents = 'auto'
      }, 100)
    },
    onResize (e) {
      // this.$log('onResize', e)
      this.$store.commit('ui/stateSet', ['panelMaxWidth', (e.width - this.maxWidth) / 2])
      if (this.$store.state.ui.appFullscreen) {
        this.maxWidth = e.width
      }
    }
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
      this.$log('this.$store.getters.currentUser()=', this.$store.getters.currentUser())
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
