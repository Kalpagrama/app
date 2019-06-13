<template lang="pug">
  q-layout(view='lHh Lpr lFf' :style=`{height: height+'px'}` @resize="handleResize")
    div(:style=`{height: $q.screen.height+'px', width: $q.screen.width+'px'}`).column
      .col.full-width
        router-view(v-if="!loading").fit
        div(v-else).row.fit.items-center.justify-center
          q-spinner(size="50px" :thickness="2" color="primary")
      div(style=`height: 50px; borderTop: 1px solid #eee`).row.full-width.justify-between.q-px-sm
        q-btn(v-if="page" v-for="(p, pi) in pages" :key="pi" flat round v-touch-hold="btnHolded"
          :color="page.id === p.id ? 'primary' : 'grey'"
          :icon="p.icon" size="16px" @click="pageClick(p)")
    //- q-page-container.fit
    //-   q-page.fit
    //-     div(v-if="loading").row.fit.items-center.justify-center.content-center
    //-       div(style=`height: 80px`).row.full-width.items-center.justify-center
    //-         q-spinner(size="50px" color="primary" :thickness="2")
    //-     //- TODO: route level transitions
    //-     //- transition(enter-active-class="animated slideInRight" leave-active-class="animated slideOutLeft")
    //-     router-view(v-else)
    //- q-footer(v-if="!loading && show_footer" bordered).row.full-width.justify-between.bg-white.q-px-sm
    //-   q-btn(v-if="page" v-for="(p, pi) in pages" :key="pi" flat round
    //-     :color="page.id === p.id ? 'primary' : 'grey'"
    //-     :icon="p.icon" size="16px" @click="pageClick(p)")
        //- q-badge(color="red" floating transparent style=`padding: 3px`).q-mr-sm.q-mt-sm 1
</template>

<script>
export default {
  name: 'mainLayout',
  components: {},
  data () {
    return {
      loading: true,
      height: window.innerHeight,
      width: window.innerWidth,
      show_footer: true,
      show_right_drawer: false,
      show_left_drawer: false,
      page: null,
      pageId: '',
      pages: [
        { id: 'home', icon: 'home', name: 'Лента' },
        { id: 'search', icon: 'search', name: 'Поиск' },
        { id: 'create', icon: 'add_circle_outline', name: 'Создать' },
        { id: 'notifications', icon: 'notifications_none', name: 'Уведомления' },
        { id: 'menu', icon: 'menu', name: 'Меню' }
      ]
    }
  },
  watch: {
    '$route': {
      deep: true,
      immediate: true,
      handler (to, from) {
        this.$log('$route CHANGED', to)
        if (!to.name) {
          this.$log('NO PAGE')
          this.$set(this, 'page', this.pages[0])
        } else {
          this.$log('GOT PAGE', this.$route.name)
          let findPage = this.pages.find(p => p.id === to.name)
          if (findPage) this.$set(this, 'page', findPage)
          else this.$set(this, 'page', this.pages[this.pages.length - 1])
        }
      }
    }
  },
  methods: {
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
      this.$router.push({name: p.id})
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
    this.$store.commit('auth/state', ['user', user])
    this.loading = false
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
