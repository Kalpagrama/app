<template lang="pug">
q-layout(view='hHh Lpr fFf')
  q-dialog(ref="nodeCreatorDialog" :maximized="true" transition-show="slide-up" transition-hide="slide-down")
    node-creator(@hide="$refs.nodeCreatorDialog.hide()")
  q-dialog(ref="bookmarkDialog" :maximized="true" transition-show="slide-up" transition-hide="slide-down")
    ws-bookmark-editor
  q-dialog(
    ref="fragmentDialog" :value="$store.state.ui.fragmentDialogOpened" @hide="$store.commit('ui/stateSet', ['fragmentDialogOpened', false])"
    :maximized="true" transition-show="slide-up" transition-hide="slide-down")
    ws-fragment-editor
  q-dialog(ref="nodeRateDialog" :maximized="true" transition-show="slide-up" transition-hide="slide-down")
    node-rate
  q-drawer(
    side="left" v-model="drawer" show-if-above
    :mini="!drawer || miniState" bordered content-class="bg-grey-3" :width="250" no-swipe-open).gt-sm
    k-menu-vert.bg-primary
    div(style="margin-top: -80px; margin-right: 4px;").row.justify-start
      q-btn(
        dense round unelevated size="20px" :icon="miniState ? 'chevron_right' : 'chevron_left'" @click="toggleMini"
        style=`color: #fff`)
    .row.full-width.justify-start.q-pl-sm
      span.text-grey-3 0.4.0
  q-page-container
    q-page
      q-resize-observer(@resize="onResize")
      router-view(v-if="!loading" :height="height" :width="width")
      div(v-else).row.full-width.window-height.items-center.justify-center
        k-spinner(:width="200" :height="200")
</template>

<script>
import kMenuVert from 'components/k_menu_vert'
import kMenuHoriz from 'components/k_menu_horiz'
import nodeCreator from 'components/node_creator'

export default {
  name: 'mainLayout',
  components: { kMenuHoriz, kMenuVert, nodeCreator },
  data () {
    return {
      loading: true,
      showLeftDrawer: true,
      radius: 30,
      width: 0,
      height: 0,
      noPointerEvents: true,
      miniState: false,
      drawer: true,
      toggleIcon: ''
    }
  },
  watch: {
    '$q.screen.gt.sm': {
      immediate: true,
      handler (to, from) {
        this.$log('gt.sm CHANGED', to)
        let vh = window.innerHeight
        // if (to) vh = vh * 0.01
        // else vh = (vh - 60) * 0.01
        vh = vh * 0.01
        document.documentElement.style.setProperty('--vh', `${vh}px`)
      }
    }
  },
  methods: {
    toggleMini (miniState) {
      this.miniState = !this.miniState
    },
    onResize (e) {
      // this.$log('onResize', e)
      this.width = e.width
      this.height = this.$q.screen.height
      // this.height = e.height
    },
    menuToggle () {
      this.$log('menuToggle')
      if (this.showLeftDrawer) {
      this.$tween.to(this, 0.5, { radius: 0 })
      } else {
      this.$tween.to(this, 0.5, { radius: 30 })
      }
      this.$set(this, 'showLeftDrawer', !this.showLeftDrawer)
    }
  },
  async mounted () {
    this.$log('mounted')
    await this.$wait(500)
    // TODO: handle page height...
    // this.$refs.zresize.trigger()
    // let vh = (window.innerHeight - 60) * 0.01
    // Then we set the value in the --vh custom property to the root of the document
    // document.documentElement.style.setProperty('--vh', `${vh}px`)
    // this.$root.$on('toggle_menu', () => {
    //   if (this.$q.screen.lt.md) this.menuToggle()
    // })
    // this.$root.$on('create', () => {
    //   if (this.$refs.nodeCreatorDialog) this.$refs.nodeCreatorDialog.show()
    // })
  },
  async created () {
    try {
      // this.$log('created')
      // console.time('created')
      // this.$q.notify('Created start')
      this.loading = true
      // Oauth case. take token from redirect url
      let token = this.$route.query.token
      let expires = this.$route.query.expires
      if (token) {
        localStorage.setItem('ktoken', token)
        localStorage.setItem('ktokenExpires', expires)
        this.$router.push('/app/home')
      }
      // this.$q.notify('token', token)
      // user check
      // this.$log('Checking user...')
      let { data: { userIsAuthorized, userIsConfirmed } } = await this.$apollo.query({
        client: 'authApollo',
        query: gql`
          query userCheck {
            userIsAuthorized
            userIsConfirmed
          }
        `,
        fetchPolicy: 'network-only'
      })
      this.$log('userIsAuthorized', userIsAuthorized)
      this.$log('userIsConfirmed', userIsConfirmed)
      // this.$q.notify('userIsAuthorized', userIsAuthorized)
      // this.$q.notify('userIsConfirmed', userIsConfirmed)
      // TODO: create with try/catch this...
      if (!userIsAuthorized || !userIsConfirmed) {
        this.$log('GO LOGIN')
        this.$router.push('/login')
        this.$q.notify('Go login')
        return
        // throw new Error(`No auth!`)
        // // TODO: error code? switch...
      }
      await this.$store.dispatch('init')

      this.loading = false
    } catch (error) {
      this.$log('error', error)
      // this.loading = false
    }
  },
  beforeDestroy () {
   this.$log('beforeDestroy')
  }
 }
</script>
