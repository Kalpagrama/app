<template lang="pug">
  q-layout(view='lHh Lpr lFf' :style=`{height: $q.screen.height+'px'}` @resize="handleResize")
    q-header
      div(style=`height: 60px`).row.full-width.items-center.justify-between.bg-white.q-pl-md.q-pr-sm
        q-btn(round flat color="grey-6" @click="$router.push('/app/home')")
          template(v-slot:default)
            img(:src="`statics/logo.png`" width="40px" height="40px")
        //- span.text-black.q-mx-sm Kalpagramma
        .col.q-px-sm
          k-search
        //- main btns
        div(v-if="!isMobile").row.full-height.items-center.justify-end
          q-btn(rounded flat no-caps color="grey-6" @click="$router.push('/app/home')") Home
          q-btn(v-if="$store.state.auth.user" rounded flat no-caps color="grey-6" @click="$router.push(`/app/user/${$store.state.auth.user.oid}/nodes`)").q-px-xs
            template(v-slot:default)
              div(style=`height: 30px; width: 30px; borderRadius: 50%`).bg-grey-4
              span(v-if="$store.state.auth.user").q-mx-sm {{$store.state.auth.user.name | cut(30)}}
              div(v-else style=`width: 100px`)
        //- notifications and chats
        div().row.full-height.items-center
          //- q-btn(round flat color="grey-6" icon="notifications")
          q-btn(round flat icon="more_vert" color="grey-6")
            q-menu(auto-close)
              div(style=`width: 200px`).row
                div(v-for="(m, mi) in menus" :key="m.id" @click="menuClick(m, mi)"
                  style=`height: 50px; borderBottom: 1px solid #eee`
                  ).row.full-width.items-center.hr.cursor-pointer.q-px-md
                  span {{m.name}}
    q-page-container
      q-page.bg-grey-2
        //- debug
        div(v-if="false" style=`position: fixed; zIndex: 100000; right: 0px; top: 50%`).row.bg-green-1
          //- small {{$store.state.ui.page}}
          small.full-width {{width}}/{{height}}
          small.full-width {{widthPage}}/{{heightPage}}
        keep-alive
          router-view(v-if="!loading" :width="widthPage" :height="heightPage")
          div(v-else).row.fit.items-center.justify-center
            q-spinner(size="50px" :thickness="2" color="primary")
    q-footer(v-if="isMobile" reveal).bg-white
      div(
        style=`height: 60px; borderTop: 1px solid #eee`
        ).row.full-width.justify-between.items-center.q-px-sm
        q-btn(v-for="(p, pi) in pages" :key="pi" flat round
          :color="getColor(p)" :icon="p.icon" size="16px" @click="pageClick(p)")
</template>

<script>
import kMenu from 'pages/app/menu'
import kSearch from 'components/kSearch'

export default {
  name: 'mainLayout',
  components: {kMenu, kSearch},
  data () {
    return {
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
        { id: 'home', icon: 'home', name: 'home' },
        // { id: 'sphere', icon: 'explore', name: 'explore' },
        { id: 'create', icon: 'add_circle_outline', name: 'create' },
        { id: 'notifications', icon: 'notifications_none', name: 'notifications' },
        { id: 'account', icon: 'perm_identity', name: 'account' }
        // { id: 'menu', icon: 'more_vert', name: 'menu' }
      ],
      menus: [
        {id: 'settings', name: 'Настройки'},
        {id: 'refresh', name: 'Обновить'},
        {id: 'logout', name: 'Выйти'},
      ],
      mini: false,
      menuWidth: 200,
      menuHeight: 500
    }
  },
  computed: {
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
      if (!this.menuShow) return this.height - 60
      else return this.height - 60
    }
  },
  watch: {
    '$route': {
      deep: true,
      immediate: true,
      handler (to, from) {
        this.$log('$route CHANGED', to)
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
      this.$log('menuClick', m)
      switch (m.id) {
        case 'settings': {
          this.$router.push(`/app/user/${this.$store.state.auth.user.oid}/settings`)
          break
        }
        case 'refresh': {
          window.location.reload(true)
          break
        }
        case 'logout': {
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
    handleResize (e) {
      // this.$log('handleResize', e.width)
      this.height = e.height
      this.width = e.width
      this.$store.commit('ui/state', ['width', e.width])
      this.$store.commit('ui/state', ['height', e.height])
    },
    pageClick (p) {
      this.$log('pageClick', p)
      this.$router.push({path: p.id})
    }
  },
  async mounted () {
    this.$log('mounted')
    this.loading = true
    // check token
    let token = this.$route.query.token
    if (token) localStorage.setItem('ktoken', token)
    // user check
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
    }
    // user
    let { data: { user } } = await this.$apollo.query({query: gql`query getCurrentUser { user { oid name } }`})
    // this.$log('user', user)
    this.$store.commit('auth/state', ['user', user])
    // userWorkspace
    // let {data: {userWorkspace}} = await this.$apollo.query({
    //   query: gql`
    //     query userWorkspace {
    //       userWorkspace
    //     }
    //   `
    // })
    // this.$log('userWorkspace', userWorkspace)
    // this.$store.commit('workspace/state', ['workspace', userWorkspace])
    this.loading = false
    // let p = await this.$axios.get('https://script.google.com/macros/s/AKfycbwXTp9upWTuMEsnXfvu-a5R8KfsFobj43kV-lvBFC6-l5m7WA/exec', {
    //   collection: 'review_call',
    //   phone: '666'
    // })
    // this.$log('p', p)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
