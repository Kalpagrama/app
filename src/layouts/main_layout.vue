<style lang="stylus">
iframe {
  width: 100%;
  height: 500px;
}
</style>

<template lang="pug">
.row.full-width.items-start.content-start
  k-action
  //- kalpa-tutorial
  div(:style=`{position: 'fixed', zIndex: 10000, left: 0, top: 0}`).row.window-height.bg-grey-8.gt-sm
    kalpa-menu-desktop(v-if="!loading")
  div(:style=`{position: 'fixed', zIndex: 10000, bottom: 0}`).row.full-width.xs
    kalpa-menu-mobile(v-if="!loading")
  div(:style=`{paddingLeft: $q.screen.gt.sm ? '60px' : '0px'}`).col
    router-view(v-if="!loading")
    div(v-else).row.full-width.window-height.items-center.content-center.justify-center.bg-black
      q-spinner(color="green" size="50px")
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
      await this.$router.push('/')
    }
    if (!await this.$store.dispatch('init')) {
      this.$log('GO LOGIN')
      await this.$router.push('/login')
      return
    }
    this.loading = false
    // if (this.$store.getters.currentUser.profile.tutorial) {
    //   this.$refs.kTutorialDialog.show()
    // } else this.loading = false
  }
 }
</script>
