<template lang="pug">
  q-layout(view='lHh Lpr lFf' :style=`{height: height+'px'}` @resize="handleResize")
    //- left drawer
    //- q-drawer(v-model="show_left_drawer")
    //-     .column.fit.bg-white.justify-center.items-center
    //-         span Menu
    //- right drawer
    q-drawer(v-if="!loading" :value="$store.state.ui.show_right_drawer" side="right" @input="$store.commit('ui/state', ['show_right_drawer', false])")
      settings
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
    //- TODO: add route transitions
    q-page-container.fit
      q-page.fit
        div(v-if="loading").row.fit.items-center.justify-center.content-center
          //- .row.full-width.justify-center
          //-   span.q-ma-sm Connecting kalpagramma...
          //- .row.full-width.justify-center
          //-   small {{ SERVICES_URL }}
          div(style=`height: 80px`).row.full-width.items-center.justify-center
            //- q-spinner(size="50px" color="blue")
        //- transition(enter-active-class="fadeIn" leave-active-class="animated fadeOut")
        router-view(v-if="!loading")
    //- footer
    q-footer(v-if="!loading && show_footer" bordered).row.full-width.justify-between.bg-white.q-px-sm
      q-btn(v-if="page" v-for="(p, pi) in pages" :key="pi" flat round
        :color="page.id === p.id ? 'primary' : 'grey'"
        :icon="p.icon" size="16px" @click="pageClick(p)")
        //- q-badge(color="red" floating transparent style=`padding: 3px`).q-mr-sm.q-mt-sm 1
</template>

<script>
import settings from 'pages/app/settings'
export default {
  name: 'mainLayout',
  components: { settings },
  data () {
    return {
      loading: true,
      SERVICES_URL: process.env.SERVICES_URL,
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
        { id: 'bell', icon: 'notifications_none', name: 'Уведомления' },
        // { id: 'chat', icon: 'send', name: 'Сообщения' },
        { id: 'settings', icon: 'perm_identity', name: 'Профиль' }
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
    }
  },
  methods: {
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
    await this.$wait(500)
    let {data} = await this.$apollo.query({query: gql`query userIsAuthorized {userIsAuthorized}`})
    // this.$log('data', data)
    if (!data.userIsAuthorized) this.$router.push('/login')
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
    this.loading = false
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
