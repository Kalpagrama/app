<template lang="pug">
  q-layout(view='lHh Lpr lFf' :style=`{height: $q.screen.height+'px'}` @resize="handleResize").window-height.bg-grey-2
    q-header(reveal)
      div(style=`height: 60px; borderBottom: 1px solid #eee`).row.full-width.justify-center.bg-white
        div(style=`maxWidth: 1130px` :class=`{'q-px-sm': $q.screen.width < 600}`).row.fit.justify-center.q-px-sm
          .row.full-height.items-center
            div(style=`height: 40px; width: 40px; borderRadius: 50%`
              @click="$router.push('/app/home')"
              ).row.items-center.justify-center.bg-primary.cursor-pointer
              q-icon(name="vertical_align_center" size="20px" color="white")
            h6(v-if="$q.screen.width >= 600").q-ma-xs.q-ml-sm.text-black.text-bold kalpa
          .col
            .row.fit.justify-end.items-center.content.center
              div(v-if="$q.screen.width >= 400" style=`height: 40px; overflow: hidden; borderRadius: 8px`).col.q-px-sm
                div(style=`borderRadius: 8px; overflow: hidden`).row.fit.items-end
                  q-input(v-model="search" filled).fit.items-end
                    template(v-slot:prepend)
                      q-icon(name="search")
              //- q-btn(v-if="$q.screen.width >= 400" rounded color="primary" no-caps style=`height: 40px`
              //-   @click="$router.push('/app/create')").q-mx-md Создать
              div(style=`height: 40px; width: 40px; borderRadius: 50%`
                @click="$router.push('/app/settings')"
                ).row.items-center.justify-center.bg-grey-7.cursor-pointer
                q-icon(name="face" size="20px" color="white")
    q-page-container.fit
      q-page.fit
        router-view(v-if="!loading").fit
          template(v-slot:menu v-if="$q.screen.width > 850")
            div(:style=`{position: 'relative', width: mini ? 40+'px' : 240+'px'}`).row.full-height.q-py-md
              div(:style=`{position: 'fixed', width: mini ? 40+'px' : 240+'px', height: $q.screen.height-100+'px'}`).row
                div(style=`overflow: hidden; borderRadius: 8px`).row.fit
                  k-menu(:mini="mini" @mini="handleMini")
        div(v-else).row.fit.items-center.justify-center
          q-spinner(size="50px" :thickness="2" color="primary")
    q-footer(v-if="$q.screen.width < 600").bg-white
      div(
        style=`height: 50px; borderTop: 1px solid #eee`
        ).row.full-width.justify-between.q-px-sm
        //- :color="page.id === p.id ? 'primary' : 'grey'"
        q-btn(v-for="(p, pi) in pages" :key="pi" flat round v-touch-hold="btnHolded"
          color="grey" :icon="p.icon" size="16px" @click="pageClick(p)")
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
        { id: 'home', icon: 'home', name: 'Лента' },
        { id: 'search', icon: 'search', name: 'Поиск' },
        { id: 'create', icon: 'add_circle_outline', name: 'Создать' },
        { id: 'notifications', icon: 'notifications_none', name: 'Уведомления' },
        { id: 'menu', icon: 'menu', name: 'Меню' }
      ],
      mini: false
    }
  },
  watch: {
    // '$route': {
    //   deep: true,
    //   immediate: true,
    //   handler (to, from) {
    //     this.$log('$route CHANGED', to)
    //     if (!to.name) {
    //       this.$log('NO PAGE')
    //       this.$set(this, 'page', this.pages[0])
    //     } else {
    //       this.$log('GOT PAGE', this.$route.name)
    //       let findPage = this.pages.find(p => p.id === to.name)
    //       if (findPage) this.$set(this, 'page', findPage)
    //       else this.$set(this, 'page', this.pages[this.pages.length - 1])
    //     }
    //   }
    // }
  },
  methods: {
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
    this.$store.commit('auth/state', ['user', user])
    this.loading = false
    // const observer = this.$apollo.subscribe({
    //   client: 'ws',
    //   query: gql`
    //     subscription uploadProgress {
    //       uploadProgress
    //     }
    //   `,
    // })
    // observer.subscribe({
    //   next: (data) => {
    //     this.$log('sub data', data)
    //   },
    //   error: (error) => {
    //     this.$log('sub error', error)
    //   }
    // })
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
