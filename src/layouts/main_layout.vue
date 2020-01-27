<style lang="stylus">
iframe {
  width: 100%;
  height: 500px;
}
</style>

<template lang="pug">
.row.full-width.items-start.content-start
  k-action
  router-view(v-if="!loading")
    template(v-slot:menuDesktop)
      k-menu-desktop
    template(v-slot:menuMobile)
      k-menu-mobile
</template>

<script>
import kAction from 'components/k_action'
import 'mediaelement/build/mediaelementplayer.min.css'
import 'mediaelement/full'

export default {
  name: 'mainLayout',
  components: {kAction},
  data () {
    return {
      loading: true,
      width: 0,
      height: 0,
      me: null,
      player: null
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
    await this.$wait(3000)
  },
  async created () {
    this.$logD('created')
    this.loading = true
    // take token from redirect url
    let token = this.$route.query.token
    let expires = this.$route.query.expires
    if (token) {
      localStorage.setItem('ktoken', token)
      localStorage.setItem('ktokenExpires', expires)
      await this.$router.push('/')
    }
    if (!await this.$store.dispatch('init')) {
      this.$logD('GO LOGIN')
      await this.$router.push('/login')
      return
    }
    if (this.$store.getters.currentUser.profile.tutorial) {
      this.$refs.kTutorialDialog.show()
    } else this.loading = false
  }
 }
</script>
