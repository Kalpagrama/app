<template lang="pug">
q-layout(view='hHh Lpr fFf')
  q-dialog(ref="nodeCreatorDialog" :maximized="true" transition-show="slide-up" transition-hide="slide-down")
    node-creator(@hide="$refs.nodeCreatorDialog.hide()")
  q-dialog(ref="bookmarkDialog" :maximized="true" transition-show="slide-up" transition-hide="slide-down")
    ws-bookmark-editor
  q-dialog(
    ref="fragmentDialog" :value="$store.state.ui.fragmentDialogOpened" @hide="$store.commit('ui/state', ['fragmentDialogOpened', false])"
    :maximized="true" transition-show="slide-up" transition-hide="slide-down")
    ws-fragment-editor
  q-dialog(ref="nodeRateDialog" :maximized="true" transition-show="slide-up" transition-hide="slide-down")
    node-rate
  q-drawer(
    side="left" v-model="drawer" show-if-above
    :mini="!drawer || miniState" :breakpoint="500" bordered content-class="bg-grey-3" :width="210" no-swipe-open).gt-sm
    k-menu-vert.bg-primary
    div(class="" style="margin-top: -80px; margin-right: 4px;").row.justify-end
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
        q-spinner(size="50px" :thickness="2" color="white")
</template>

<script>
import kMenuVert from 'components/k_menu_vert'
import kMenuHoriz from 'components/k_menu_horiz'
import nodeCreator from 'components/node_creator'

export default {
  name: 'mainLayout',
  components: {kMenuHoriz, kMenuVert, nodeCreator},
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
    // drawerClick (e) {
    //   // if in "mini" state and user
    //   // click on drawer, we switch it to "normal" mode
    //   if (this.miniState) {
    //     this.miniState = false
    //     // notice we have registered an event with capture flag;
    //     // we need to stop further propagation as this click is
    //     // intended for switching drawer to "normal" mode only
    //     e.stopPropagation()
    //   }
    // },
    onResize (e) {
      // this.$log('onResize', e)
      this.width = e.width
      this.height = e.height
    },
    menuToggle () {
      this.$log('menuToggle')
      if (this.showLeftDrawer) {
        this.$tween.to(this, 0.5, {radius: 0})
      } else {
        this.$tween.to(this, 0.5, {radius: 30})
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
    this.$root.$on('toggle_menu', () => {
      if (this.$q.screen.lt.md) this.menuToggle()
    })
    this.$root.$on('create', () => {
      if (this.$refs.nodeCreatorDialog) this.$refs.nodeCreatorDialog.show()
    })
  },
  async created () {
    try {
      // this.$log('created')
      // console.time('created')
      // this.$q.notify('Created start')
      this.loading = true
      // save last route to state
      // await this.$wait(3000)
      // if (localStorage.getItem('kdebug')) this.d = true
      // check token
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
        query: gql`
        query userCheck {
          userIsAuthorized
          userIsConfirmed
          }`,
       fetchPolicy: 'network-only'
        })
      // this.$log('userIsAuthorized', userIsAuthorized)
      // this.$log('userIsConfirmed', userIsConfirmed)
      // this.$q.notify('userIsAuthorized', userIsAuthorized)
      // this.$q.notify('userIsConfirmed', userIsConfirmed)
      // TODO: create with try/catch this...
      if (!userIsAuthorized || !userIsConfirmed) {
        this.$log('GO LOGIN')
        this.$router.push('/login')
        this.$q.notify('Go login')
        throw new Error(`No auth!`)
        // TODO: error code? switch...
      }
      // user
      // this.$log('Getting user...')
      let { data: { user } } = await this.$apollo.query({query: gql`query getCurrentUser { user { oid name thumbUrl(preferWidth: 50) } }`})
      // this.$log('user', user)
      this.$store.commit('auth/state', ['user', user])
      // catagories
      let categories = await this.$store.dispatch('node/categories')
      // this.$log('catagories', categories)
      this.$store.commit('node/state', ['categories', categories])
      // workspace
      this.$log('Getting user workspace')
      // this.$q.notify('Getting user workspace!')
      let userWorkspace = await this.$store.dispatch('workspace/userWorkspace')
      this.$log('userWorkspace', userWorkspace)
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
