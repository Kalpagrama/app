<template lang="pug">
  q-layout(view='hHh Lpr fFf')
    q-header(reveal v-if="true")
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
        div.row.full-height.items-center
          q-btn(round flat color="grey-6" icon="notifications")
          //- menu app
          q-btn(round flat icon="more_vert" color="grey-6")
            q-popup-proxy(position="bottom" auto-close anchor="bottom right" self="top right")
              div(
                :style=`{maxWidth: $q.screen.width < 451 ? '100%' : '230px'}`
                :class="{'q-pa-md': $q.screen.width <= 450}").row.fit
                div(:style=`{borderRadius: '4px'}`).row.full-width.bg-white
                  //- header
                  div(
                    v-if="$q.screen.width <= 450 && $store.state.auth.user"
                    @click="$router.push(`/app/user/${$store.state.auth.user.oid}`)"
                    :style=`{height: '50px', borderBottom: '1px solid #eee'}`
                    ).row.full-width.items-center.justify-center.q-px-md
                    span.text-bold {{ $store.state.auth.user.name | cut(30) }}
                  //- menus
                  div(:style=`{borderRadius: '4px'}`).row.full-width.bg-white
                    div(v-for="(m, mi) in menus" :key="m.id" @click="menuClick(m, mi)"
                      :style=`{height: '50px'}`
                      ).row.full-width.items-center.justify-center.hr.cursor-pointer.q-px-md
                      span(:style=`{color: m.color}`) {{m.name}}
                //- cancel
                div(:style=`{height: '50px', borderRadius: '4px'}`
                  ).row.full-width.items-center.justify-center.q-mt-sm.q-px-md.bg-grey-1
                  span(:style=`{color: 'red'}`).text-bold {{ $t('Отмена') }}
    q-page-container
      q-page.bg-grey-2
        //- q-resize-observer(@resize="onResize" :debounce="200")
        keep-alive
          router-view(v-if="!loading" :width="widthPage" :height="heightPage")
          div(v-else :style=`{minHeight: '500px'}`).row.fit.items-center.justify-center
            q-spinner(size="50px" :thickness="2" color="primary")
    //- q-footer(v-if="isMobile" reveal).bg-white
    //-   div(
    //-     style=`height: 60px; borderTop: 1px solid #eee`
    //-     ).row.full-width.justify-between.items-center.q-px-sm
    //-     q-btn(v-for="(p, pi) in pages" :key="pi" flat round
    //-       :color="getColor(p)" :icon="p.icon" size="16px" @click="pageClick(p)")
</template>

<script>
import kSearch from 'components/k_search'

export default {
  name: 'mainLayout',
  components: {kSearch},
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
        { id: '/app/create/node', icon: 'add_circle_outline', name: 'create' },
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
    this.$log('mounted')
    this.loading = true
    if (localStorage.getItem('kdebug')) this.d = true
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
    // this.$log('userIsAuthorized', userIsAuthorized)
    // this.$log('userIsConfirmed', userIsConfirmed)
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
