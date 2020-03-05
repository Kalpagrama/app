<style lang="stylus">
iframe {
  width: 100%;
  height: 500px;
}
.q-notification {
  border-radius: 10px !important
}
</style>

<template lang="pug">
q-layout( view="hHh Lpr lff")
  kalpa-action
  q-drawer(
    v-model="drawerShow"
    no-swipe-open no-swipe-close show-if-above
    :side="$q.screen.xs ? 'right' : 'left'"
    :width="$q.screen.xs ? $q.screen.width/2+30 : 60" :breakpoint="1000" :mini="!$q.screen.xs"
    content-class="bg-grey-8").gt-xs
    kalpa-menu-desktop(v-if="!loading" :mini="$q.screen.xs ? false : drawerMini" :style=`{zIndex: 10000}`)
  //- q-dialog(
  //-   v-model="drawerShow" position="bottom")
  //-   div(
  //-     @click="pageClick()"
  //-     :style=`{position: 'relative', zIndex: 200, height: ($q.screen.width/3)*2+'px', borderRadius: '30px 30px 0 0'}`).row.full-width.bg-grey-8
  //-     //- div(
  //-     //-   :style=`{width: $q.screen.width/3+'px', height: $q.screen.width/3+'px'}`).row.items-center.content-center.justify-center
  //-     //-   kalpa-spinner(:width="40" :height="40").cursor-pointer.q-mb-sm
  //-     //-   .row.full-width.justify-center
  //-     //-     small.text-white Home
  //-     div(
  //-       v-for="(p, pi) in pages" :key="p.id"
  //-       :style=`{position: 'relative', zIndex: 2000, width: $q.screen.width/3+'px', height: $q.screen.width/3+'px'}`).row.items-center.content-center.justify-center
  //-       q-btn(
  //-         round flat @click="pageClick(p.id)"
  //-         :color="$route.name === p.id ? 'green' : 'white'" size="lg" :icon="p.icon"
  //-         :style=`{position: 'relative', zIndex: 2000}`)
  //-       .row.full-width.justify-center.bg
  //-         small(@click="pageClick(p.id)").text-white {{ p.name }}
  div(
    :style=`{position: 'absolute', zIndex: 3100, right: '0px', bottom: '0px',
      width: $q.screen.width/3+'px', height: $q.screen.width/3+'px'}`).row.items-center.content-center.justify-center
    q-btn(
      round flat size="lg" color="green" @click="drawerShow = !drawerShow"
      :icon="drawerShow ? 'keyboard_arrow_down' : 'menu'"
      :style=`{background: drawerShow ? 'none' : 'rgba(0,0,0,0.3)'}`)
  q-page-container
    router-view(v-if="!loading")
    div(v-else).row.full-width.window-height.items-center.content-center.justify-center.bg-black
      q-spinner(color="green" size="50px")
</template>

<script>
import 'mediaelement/build/mediaelementplayer.min.css'
import 'mediaelement/full'

export default {
  name: 'mainLayout',
  components: {},
  data () {
    return {
      loading: true,
      width: 0,
      height: 0,
      me: null,
      player: null,
      drawerShow: true,
      drawerMini: true,
      pages: [
        {id: 'trends', name: 'Trends', icon: 'whatshot'},
        {id: 'workspce', name: 'Workspace', icon: 'school'},
        {id: 'refresh', name: 'Refresh', icon: 'refresh'},
        {id: 'debug', name: 'Debug', icon: 'bug_report'}
      ]
    }
  },
  computed: {
  },
  watch: {
    '$q.screen.gt.xs': {
      immediate: true,
      handler (to, from) {
        this.$logD('gt.sm CHANGED', to)
        this.$store.commit('ui/stateSet', ['gtxs', to])
      }
    }
  },
  methods: {
    someShit () {
      this.$log('someShit')
    },
    pageClick (id) {
      this.$log('pageClick', id)
    },
    menuToggle () {
      this.$log('menuToggle')
    },
    onResize (e) {
      this.$logD('onResize', e)
      this.width = e.width
      let vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty('--vh', `${vh}px`)
      this.height = vh
    },
    async closeTutorial(){
      await this.$refs.kTutorialDialog.hide()
      this.loading = false
    }
  },
  async mounted () {
    this.$log('mounted')
  },
  async created () {
    this.$log('created')
    this.loading = true
    if (this.$q.screen.xs) this.drawerShow = false
    this.$q.addressbarColor.set('#424242')
    // take token from redirect url
    let token = this.$route.query.token
    let expires = this.$route.query.expires
    if (token) {
      localStorage.setItem('ktoken', token)
      localStorage.setItem('ktokenExpires', expires)
      await this.$router.push('/').catch(e => e)
    }
    if (!await this.$store.dispatch('init')) {
      this.$log('GO LOGIN')
      await this.$router.push('/login').catch(e => e)
      // return
    }
    this.loading = false
    // if (this.$store.getters.currentUser.profile.tutorial) {
    //   this.$refs.kTutorialDialog.show()
    // } else this.loading = false
  }
 }
</script>
