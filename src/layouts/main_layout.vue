<template lang="pug">
  q-layout(view='lHh Lpr lFf' :style=`{height: $q.screen.height+'px'}` @resize="handleResize")
    q-header(reveal v-if="false")
      div(style=`height: 60px; zIndex: 1000`).row.full-width.justify-center.bg-white
        div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.fit.justify-center.q-px-xs
          .row.full-height.items-center
            div(style=`height: 40px; width: 40px; borderRadius: 50%`
              @click="$router.push('/app/home')"
              ).row.items-center.justify-center.bg-primary.cursor-pointer
              q-icon(name="vertical_align_center" size="20px" color="white")
            .col
              .row.fit.items-center
                h6(v-if="$q.screen.width >= 600").q-ma-xs.q-ml-sm.text-black.text-bold kalpa
                small.text-black.q-pt-sm.q-ml-xs v0.03
          .col
            .row.fit.justify-end.items-center.content.center
              div(v-if="$q.screen.width >= 400" style=`height: 40px; overflow: hidden; borderRadius: 8px`).col.q-px-sm
                //- div(style=`borderRadius: 8px; overflow: hidden`).row.fit.items-end
                //-   q-input(v-model="search" filled).fit.items-end
                //-     template(v-slot:prepend)
                //-       q-icon(name="search")
              //- q-btn(v-if="$q.screen.width >= 400" rounded color="primary" no-caps style=`height: 40px`
              //-   @click="$router.push('/app/create')").q-mx-md Создать
              q-btn(round flat dense color="grey-9" icon="search").q-mr-xs
              q-btn(round flat dense color="grey-9" icon="notifications").q-mr-xs
              div(style=`height: 40px; width: 40px; borderRadius: 50%`
                @click="$router.push('/app/settings')"
                ).row.items-center.justify-center.bg-grey-7.cursor-pointer.q-ml-xs
                q-icon(name="face" size="20px" color="white")
    q-page-container
      q-page.row.full-width.justify-center.bg-grey-2
        div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width
          div(v-if="$q.screen.width >= $store.state.ui.nodeMaxWidth+$store.state.ui.menuMaxWidth"
            :style=`{position: 'relative', width: '200px'}`).row.q-py-md
            div(:style=`{position: 'fixed', width: '200px', height: '500px', borderRadius: $store.state.ui.radiusDefault+'px'}`).row.bg-white
              k-menu
          .col.q-pt-md
            //- debug
            div(v-if="false" style=`position: fixed; zIndex: 100000; right: 0px; top: 50%`).row.bg-green-1
              small {{$store.state.ui.page}}
            keep-alive
              router-view(v-if="!loading")
              div(v-else).row.fit.items-center.justify-center
                q-spinner(size="50px" :thickness="2" color="primary")
    q-footer(v-if="$q.screen.width < $store.state.ui.nodeMaxWidth+$store.state.ui.menuMaxWidth").bg-white
      div(
        style=`height: 56px; borderTop: 1px solid #eee`
        ).row.full-width.justify-between.items-center.q-px-sm
        q-btn(v-for="(p, pi) in getPages" :key="pi" flat round v-touch-hold="btnHolded"
          :color="getColor(p)" :icon="p.icon" size="16px" @click="pageClick(p)")
</template>

<script>
import kMenu from 'pages/app/menu'

export default {
  name: 'mainLayout',
  components: {kMenu},
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
        { id: 'explore', icon: 'explore', name: 'explore' },
        { id: 'create', icon: 'add_circle_outline', name: 'create' },
        { id: 'notifications', icon: 'notifications_none', name: 'notifications' },
        { id: 'menu', icon: 'menu', name: 'menu' }
      ],
      mini: false
    }
  },
  computed: {
    getPages () {
      return this.$store.state.ui.pages.filter(p => {
        return p.mobile === true
      })
    }
  },
  watch: {
    '$route': {
      deep: true,
      immediate: true,
      handler (to, from) {
        this.$log('$route CHANGED', to)
        if (to.path) {
          let findPage = this.$store.state.ui.pages.find(p => {
            return p.id === to.path
          })
          this.$log('findPage', findPage)
          if (findPage) this.$store.commit('ui/state', ['page', findPage])
          else this.$router.push({path: this.getPages[0].id})
        }
      }
    },
    '$store.state.workspace.workspace': {
      deep: true,
      immediate: false,
      async handler (to, from) {
        this.$log('workspace CHANGED', to, from)
        // sync it ? version? from the server?
        // TODO: this shit
        let {data: {userWorkspaceUpdate}} = await this.$apollo.mutate({
          mutation: gql`
            mutation userWorkspaceUpdate ($workspace: RawJSON) {
              userWorkspaceUpdate(workspace: $workspace)
            }
          `,
          variables: {
            workspace: to
          }
        })
        this.$log('userWorkspaceUpdate', userWorkspaceUpdate)
      }
    }
  },
  methods: {
    getColor (p) {
      if (this.$store.state.ui.page) {
        if (p.id === this.$store.state.ui.page.id) return 'primary'
        else return 'grey'
      } else {
        return 'grey'
      }
    },
    handleMini () {
      this.$log('handleMini')
      this.$set(this, 'mini', !this.mini)
    },
    btnHolded () {
      window.location.reload(true)
    },
    handleScroll (e) {
      this.$log('handleScroll', e)
    },
    handleResize (e) {
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
    // get user and save it to vuex
    let { data: { user } } = await this.$apollo.query({query: gql`query getCurrentUser { user { oid name } }`})
    // this.$log('user', user)
    // userWorkspace
    this.$store.commit('auth/state', ['user', user])
    let {data: {userWorkspace}} = await this.$apollo.query({
      query: gql`
        query userWorkspace {
          userWorkspace
        }
      `
    })
    this.$log('userWorkspace', userWorkspace)
    // if (!userWorkspace.version) userWorkspace = this.$store.state.workspace.workspace
    this.$store.commit('workspace/state', ['workspace', userWorkspace])
    this.loading = false
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
