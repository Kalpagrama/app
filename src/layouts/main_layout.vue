<template lang="pug">
q-layout(view='hHh Lpr fFf').bg-primary
  q-drawer(side="left" v-model="showLeftDrawer" :width="210" no-swipe-open)
    k-menu-vert(:style=`{borderRadius: '0px 30px 30px 0px', overflow: 'hidden'}`).bg-primary
  q-btn(round color="primary" size="md" @click="menuToggle"
    :style=`{position: 'fixed', zIndex: 1000, top: '20px', left: showLeftDrawer ? 210+20+'px' : 20+'px'}`)
    q-icon(name="blur_on")
  q-page-container
    q-page(:style=`{borderRadius: $q.screen.gt.sm ? radius+'px 0 0 '+radius+'px' : '0px', overflow: 'hidden'}`)
      q-resize-observer(ref="zresize" @resize="onResize")
      //- keep-alive
      router-view(v-if="!loading" :width="width" :height="height")
      div(v-else).row.full-width.window-height.items-center.justify-center
        q-spinner(size="50px" :thickness="2" color="primary")
  //- q-footer(reveal :style=`{background: 'none', borderRadius: '10px', overflow: 'hidden'}`)
  //-   k-menu-horiz
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
      height: 0
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
    }
  },
  methods: {
    onResize (e) {
      this.$log('onResize', e)
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
  mounted () {
    this.$log('mounted')
    this.$refs.zresize.trigger()
    let vh = window.innerHeight * 0.01
    // Then we set the value in the --vh custom property to the root of the document
    document.documentElement.style.setProperty('--vh', `${vh}px`)
    this.$root.$on('toggle_menu', () => {
      if (this.$q.screen.lt.md) this.menuToggle()
    })
  },
  async created () {
    try {
      // this.$log('created')
      // console.time('created')
      this.loading = true
      // save last route to state
      // await this.$wait(3000)
      // if (localStorage.getItem('kdebug')) this.d = true
      // check token
      let token = this.$route.query.token
      if (token) localStorage.setItem('ktoken', token)
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
      // this.$log('Getting user workspace')
      // let { data: { userWorkspace } } = await this.$apollo.query({query: gql`query getUserWorkspace { userWorkspace }`})
      // this.$log('userWorkspace', userWorkspace)
      // this.$store.commit('workspace/state', ['workspace', userWorkspace])
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
