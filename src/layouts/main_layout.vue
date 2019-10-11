<template lang="pug">
q-layout(view='hHh Lpr fFf')
  k-dialog(:value="$store.state.ui.dialogOpened" ref="kDialog" @hide="$store.commit('ui/state', ['dialogOpened', false])")
    ws-fragment-editor(
      v-if="$store.state.workspace.fragment && !$store.state.node.node"
      @hide="$refs.kDialog.hide()")
    node-rate(
      v-if="$store.state.node.node && !$store.state.node.answer"
      @hide="$refs.kDialog.hide()")
    node-answer(
      v-if="$store.state.node.node && $store.state.node.answer"
      @hide="$refs.kDialog.hide()")
  q-drawer(side="left" v-model="showLeftDrawer" :width="210" no-swipe-open)
    k-menu-vert.bg-primary
  q-page-container
    router-view(v-if="!loading")
    div(v-else).row.full-width.window-height.items-center.justify-center
      q-spinner(size="50px" :thickness="2" color="white")
</template>

<script>
import kMenuVert from 'components/k_menu_vert'
import kMenuHoriz from 'components/k_menu_horiz'

export default {
  name: 'mainLayout',
  components: {kMenuHoriz, kMenuVert},
  data () {
    return {
      loading: true,
      showLeftDrawer: true,
      radius: 30,
      width: 0,
      height: 0,
      noPointerEvents: true
    }
  },
  watch: {
    '$route': {
      handler (to, from) {
        this.$log('$route CHANGED', to)
        // window.history.length = 0
        // window.history.replaceState([], null, null)
        // window.browser.history.deleteAll()
        // delete window.history
        // window.history.replaceState(null, null, '#' + url)
        // document.location.hash = to.path
        // window.history.replaceState(null, null, to.path)
        // this.$q.notify('route changed')
      }
    },
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
    // TODO: handle page height...
    // this.$refs.zresize.trigger()
    // let vh = (window.innerHeight - 60) * 0.01
    // Then we set the value in the --vh custom property to the root of the document
    // document.documentElement.style.setProperty('--vh', `${vh}px`)
    this.$root.$on('toggle_menu', () => {
      if (this.$q.screen.lt.md) this.menuToggle()
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
      if (token) {
        localStorage.setItem('ktoken', token)
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
          }`
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
