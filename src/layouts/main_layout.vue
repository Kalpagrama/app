<template lang="pug">
  q-layout(view='lHh Lpr lFf' :style=`{height: height+'px'}`
    @resize="handleResize")
    //- left drawer
    //- q-drawer(v-model="show_left_drawer")
    //-     .column.fit.bg-white.justify-center.items-center
    //-         span Menu
    //- right drawer
    //- q-drawer(v-if="!loading" :value="$store.state.ui.show_right_drawer" side="right" @input="$store.commit('ui/state', ['show_right_drawer', false])")
    //-   settings
    //- q-header.bg-white.text-black(elevated='' v-show="headerVisible()")
    //-   q-toolbar
    //-       q-btn.q-mr-sm(flat='', round='', dense='', icon='menu')
    //-       q-toolbar-title(v-if="isTitle()") Кальпаграмма
    //-       q-toolbar-title(v-if="isSearch()")
    //-           q-input.text-black(borderless standout  color="purple-12" v-model="search" size="sm")
    //-               template(v-slot:prepend)
    //-                   q-icon(v-if="search === ''" name="search")
    //-                   q-icon(v-else name="clear" class="cursor-pointer" @click="search = ''")
    //-       q-btn(flat='', round='', dense='', icon='more_vert')
    //- page
    q-page-container.fit
      q-page.fit
        div(v-if="loading").row.fit.items-center.justify-center.content-center
          div(style=`height: 80px`).row.full-width.items-center.justify-center
            q-spinner(size="50px" color="primary" :thickness="2")
        //- TODO: route level transitions
        //- transition(enter-active-class="animated slideInRight" leave-active-class="animated slideOutLeft")
        router-view(v-else)
    //- footer
    q-footer(v-if="!loading && show_footer" bordered).row.full-width.justify-between.bg-white.q-px-sm
      q-btn(v-if="page" v-for="(p, pi) in pages" :key="pi" flat round
        :color="page.id === p.id ? 'primary' : 'grey'"
        :icon="p.icon" size="16px" @click="pageClick(p)")
        //- q-badge(color="red" floating transparent style=`padding: 3px`).q-mr-sm.q-mt-sm 1
</template>

<script>
import settings from 'pages/app/settings'
import yi from 'youtube-info'

export default {
  name: 'mainLayout',
  components: { settings },
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
        { id: 'settings', icon: 'menu', name: 'Меню' }
      ]
    }
  },
  watch: {
    page: {
      deep: true,
      immediate: false,
      handler (to, from) {
        this.$router.push({ name: to.id, params: { page: to.id } })
      }
    },
    '$route': {
      deep: true,
      immediate: true,
      handler (to, from) {
        this.$log('$route CHANGED', to)
      }
    }
  },
  methods: {
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
      this.$set(this, 'pageId', p.id)
      this.$set(this, 'page', p)
    }
  },
  async mounted () {
    this.$log('mounted')
    this.loading = true
    // check token
    let token = this.$route.query.token
    if (token) localStorage.setItem('ktoken', token)
    // this.$log('ui/store', this.$store.state.ui.show_right_drawer)
    if (!this.$route.name) {
      // this.$log('NO PAGE')
      this.$set(this, 'page', this.pages[0])
    } else {
      // this.$log('GOT PAGE', this.$route.name)
      let findPage = this.pages.find(p => p.id === this.$route.name)
      if (findPage) this.$set(this, 'page', findPage)
      else this.$set(this, 'page', this.pages[0])
    }
    await this.$wait(1000)
    // check user auth
    let {data: { userIsAuthorized }} = await this.$apollo.query({query: gql`query userIsAuthorized {userIsAuthorized}`})
    // this.$log('userIsAuthorized', userIsAuthorized)
    if (!userIsAuthorized) this.$router.push('/login')
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
