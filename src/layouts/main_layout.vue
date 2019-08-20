<template lang="pug">
  q-layout(view='hHh Lpr fFf')
    q-drawer(side="left" ref="drawerLeft").bg-white
      k-menu
    q-page-container
      q-page.bg-grey-2
        div(:style=`{position: 'relative'}`).row.fit
          q-btn(
            v-if="$q.screen.width <= 600"
            @click="$refs.drawerLeft.toggle()"
            icon="menu" round color="primary" size="md"
            :style=`{position: 'fixed', zIndex: 30000, left: '10px', bottom: '10px'}`)
          k-menu(v-if="$q.screen.width > 600" :style=`{maxWidth: '60px', width: '60px', overflow: 'hidden', position: 'fixed'}` :mini="true").bg-white
          //- div(v-if="$q.screen.width > 600" :style=`{width: '60px', height: $q.screen.height+'px', position: 'fixed', left: '0px', zIndex: 1000}`).column.items-center.bg-white
          div(:style=`{paddingLeft: $q.screen.width > 600 ? '60px' : '0px'}`).col
            //- keep-alive
            router-view(v-if="!loading" :width="width" :height="heightPage")
            div(v-else :style=`{minHeight: '500px'}`).row.fit.items-center.justify-center
              q-spinner(size="50px" :thickness="2" color="primary")
</template>

<script>
import kMenu from 'components/k_menu'

export default {
  name: 'mainLayout',
  components: {kMenu},
  data () {
    return {
      d: false,
      loading: true,
      search: '',
      height: window.innerHeight,
      width: window.innerWidth,
      show_footer: true,
      show_right_drawer: false,
      show_left_drawer: false,
      page: null,
      pageId: '',
      pages: [
        { id: '/app/home', icon: 'home', name: 'home' },
        // { id: 'sphere', icon: 'explore', name: 'explore' },
        { id: '/app/create/node', icon: 'add', name: 'create' },
        // { id: 'notifications', icon: 'notifications_none', name: 'notifications' },
        { id: '/app/user', icon: 'perm_identity', name: 'account' }
        // { id: 'menu', icon: 'more_vert', name: 'menu' }
      ],
      // menus: [],
      mini: false,
      menuWidth: 200,
      menuHeight: 500
    }
  },
  computed: {
    menus () {
      return [
        {id: 'settings', name: 'Настройки', color: 'black'},
        {id: 'refresh', name: 'Обновить', color: 'black'},
        {id: 'logout', name: 'Выйти', color: 'red'},
        {id: 'debug', name: this.d ? 'debug ON' : 'debug OFF', color: 'green'}
      ]
    },
    getPages () {
      return this.$store.state.ui.pages.filter(p => {
        return p.hidden === false && p.mobile === true
      })
    },
    isMobile () {
      return this.$q.screen.width <= 600
    },
    menuShow () {
      return this.width >= this.$store.state.ui.nodeMaxWidth + this.$store.state.ui.menuMaxWidth
    },
    widthPage () {
      // if (this.menuShow) return this.width - this.menuWidth
      // else return this.width
      return this.width
    },
    heightPage () {
      // if (!this.menuShow) return this.height - 60
      // else return this.height - 60
      return this.height
    }
  },
  watch: {
    '$route': {
      deep: true,
      immediate: true,
      handler (to, from) {
        // this.$log('$route CHANGED', to)
        // if (to.path) {
        //   let findPage = this.$store.state.ui.pages.find(p => {
        //     return p.id === to.path
        //   })
        //   this.$log('findPage', findPage)
        //   if (findPage) this.$store.commit('ui/state', ['page', findPage])
        //   else this.$router.push({path: this.getPages[0].id})
        // }
      }
    },
    // '$store.state.workspace.workspace': {
    //   deep: true,
    //   immediate: false,
    //   async handler (to, from) {
    //     this.$log('workspace CHANGED', to, from)
    //     // sync it ? version? from the server?
    //     // TODO: this shit
    //     let {data: {userWorkspaceUpdate}} = await this.$apollo.mutate({
    //       mutation: gql`
    //         mutation userWorkspaceUpdate ($workspace: RawJSON) {
    //           userWorkspaceUpdate(workspace: $workspace)
    //         }
    //       `,
    //       variables: {
    //         workspace: to
    //       }
    //     })
    //     this.$log('userWorkspaceUpdate', userWorkspaceUpdate)
    //   }
    // }
  },
  methods: {
    async menuClick (m) {
      switch (m.id) {
        case 'settings': {
          this.$log('menuClick', m.id)
          this.$router.push(`/app/user/${this.$store.state.auth.user.oid}/settings`)
          break
        }
        case 'refresh': {
          this.$log('menuClick', m.id)
          window.location.reload(true)
          break
        }
        case 'logout': {
          this.$log('menuClick', m.id)
          await this.$apollo.query({
            query: gql`
              query logout {
                logout
              }
            `
          })
          this.$router.push('/login')
          break
        }
        case 'debug': {
          this.$log('menuClick', m.id)
          let d = localStorage.getItem('kdebug')
          if (d) {
            this.d = false
            localStorage.removeItem('kdebug')
          } else {
            this.d = true
            localStorage.setItem('kdebug', 'kdebug')
          }
          window.location.reload(true)
          break
        }
      }
    },
    getColor (p) {
      if (this.$store.state.ui.page) {
        if (p.id === this.$store.state.ui.page.id) return 'primary'
        else return 'grey'
      } else {
        return 'grey'
      }
    },
    onResize (e) {
      this.$log('onResize', e.width)
      this.height = e.height
      this.width = e.width
    },
    pageClick (p) {
      this.$log('pageClick', p)
      this.$router.push({path: p.id})
    }
  },
  async mounted () {
    try {
      this.$log('mounted')
      console.time('loading')
      this.loading = true
      if (localStorage.getItem('kdebug')) this.d = true
      // check token
      let token = this.$route.query.token
      if (token) localStorage.setItem('ktoken', token)
      // user check
      this.$log('Checking user...')
      let { data: { userIsAuthorized, userIsConfirmed } } = await this.$apollo.query({
        query: gql`
        query userCheck {
          userIsAuthorized
          userIsConfirmed
          }`
        })
      this.$log('userIsAuthorized', userIsAuthorized)
      this.$log('userIsConfirmed', userIsConfirmed)
      // TODO: create with try/catch this...
      if (!userIsAuthorized || !userIsConfirmed) {
        this.$log('GO LOGIN')
        this.$router.push('/login')
        this.$q.notify('Go login')
        throw new Error(`No auth!`)
        // TODO: error code? switch...
      }
      // user
      this.$log('Getting user...')
      let { data: { user } } = await this.$apollo.query({query: gql`query getCurrentUser { user { oid name thumbUrl(preferWidth: 50) } }`})
      this.$log('user', user)
      this.$store.commit('auth/state', ['user', user])
      this.loading = false
      console.timeEnd('loading')
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
