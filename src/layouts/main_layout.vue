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
    :width="60" :breakpoint="1000"
    content-class="bg-grey-8")
    kalpa-menu-desktop(v-if="!loading" :mini="$q.screen.xs ? false : drawerMini" :style=`{zIndex: 10000}`)
  q-btn(
    round flat color="white" icon="menu" @click="drawerShow = !drawerShow"
    :style=`{position: 'fixed', left: '16px', bottom: '16px', zIndex: 10000, background: 'rgba(0,0,0,0.2)'}`).xs
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
      drawerMini: true
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
