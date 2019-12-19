<style lang="stylus">
</style>

<template lang="pug">
.row.fit.items-center.justify-center.bg-primary
  q-dialog(ref="kTutorialDialog" :maximized="true" transition-show="slide-up" transition-hide="slide-down")
   k-dialog-tutorial(@hide="$refs.kTutorialDialog.hide()")
  //- k-spinner(v-if="loading")
  //- q-resize-observer(@resize="onResize")
  //- transition(appear :enter-active-class="$store.state.ui.going ? 'animated slideInRight' : ''")
  transition(appear enter-active-class="animated fadeIn")
    router-view(v-if="!loading")
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
    }
  },
  mounted () {
    this.$log('mounted.')
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
    this.loading = false
    if (this.$store.state.events.notice) this.$refs.kTutorialDialog.show()
  }
 }
</script>
