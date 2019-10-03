<template lang="pug">
q-layout(view='hHh Lpr fFf').bg-primary
  //- //- bookmark
  //- k-dialog(:value="$store.state.workspace.bookmarkEditorDialogOpened"
  //-   @hide="$store.commit('workspace/state', ['bookmarkEditorDialogOpened', false]), $store.commit('workspace/state', ['bookmark', null])")
  //-   ws-bookmark-editor(type="create" :bookmark="$store.state.workspace.bookmark" @hide="$store.commit('workspace/state', ['bookmarkEditorDialogOpened', false])")
  //- //- fragment
  //- k-dialog(:value="$store.state.workspace.fragmentEditorDialogOpened"
  //-   @hide="$store.commit('workspace/state', ['fragmentEditorDialogOpened', false]), $store.commit('workspace/state', ['fragment', null])")
  //-   ws-fragment-editor(type="create" :fragment="$store.state.workspace.fragment" @hide="$store.commit('workspace/state', ['fragmentEditorDialogOpened', false])")
  //- rate dialog
  k-dialog(v-if="$store.state.node.rateDialogOpened" :value="$store.state.node.rateDialogOpened" @hide="$store.commit('node/state', ['rateDialogOpened', false])")
    node-rate(@hide="$store.commit('node/state', ['rateDialogOpened', false])")
  //- drawer
  q-drawer(side="left" v-model="showLeftDrawer" :width="210" no-swipe-open)
    k-menu-vert.bg-primary
  q-page-container
    q-page(:style=`{borderRadius: $q.screen.gt.sm ? '10px 0 0 10px' : '0 0 10px 10px', overflow: 'hidden'}`)
      router-view(v-if="!loading" :width="width" :height="height")
      div(v-else).row.full-width.window-height.items-center.justify-center
        q-spinner(size="50px" :thickness="2" color="white")
  q-footer(reveal :style=`{background: 'none '}`).lt-md
    k-menu-horiz
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
        if (to) vh = vh * 0.01
        else vh = (vh - 60) * 0.01
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
      if (token) localStorage.setItem('ktoken', token)
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
      // workspace
      this.$log('Getting user workspace')
      // this.$q.notify('Getting user workspace!')
      let userWorkspace = await this.$store.dispatch('workspace/userWorkspace', this.$apollo)
      this.$log('userWorkspace', userWorkspace)
      // return to path
      // let path = localStorage.getItem('path')
      // this.$log('path', path)
      // if (path) this.$router.push(path)
      // await this.$wait(1000)
      // this.$log('created done')
      // console.timeEnd('created')
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
