<style lang="stylus">
</style>

<template lang="pug">
.row.fit.items-center.justify-center
  q-dialog(ref="kTutorialDialog" :maximized="true" transition-show="slide-up" transition-hide="slide-down")
    k-dialog-tutorial(@hide="$refs.kTutorialDialog.hide()")
  k-spinner(v-if="loading")
  q-resize-observer(@resize="onResize")
  transition(appear :enter-active-class="$store.state.ui.going ? 'animated slideInRight' : ''")
    router-view(v-if="!loading" :opened="true" :height="$q.screen.height" :width="$q.screen.width")
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
  mounted () {
    // this.log('mounted')
    this.$refs.kTutorialDialog.show()
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
  async created () {
    try {
      this.$logD('created')
      this.loading = true
      // take token from redirect url
      let token = this.$route.query.token
      let expires = this.$route.query.expires
      if (token) {
        localStorage.setItem('ktoken', token)
        localStorage.setItem('ktokenExpires', expires)
        this.$router.push('/app/home')
      }
      // check user
      let { data: { userIsAuthorized, userIsConfirmed } } = await this.$apollo.query({
        client: 'authApollo',
        query: gql`
          query userCheck {
            userIsAuthorized
            userIsConfirmed
          }
        `,
        fetchPolicy: 'network-only'
      })
      if (!userIsAuthorized || !userIsConfirmed) {
        this.$logD('GO LOGIN')
        this.$router.push('/login')
        this.$q.notify('Go login')
        return
      }
      await this.$store.dispatch('init')
      this.loading = false
    } catch (error) {
      this.$logD('error', error)
      // this.loading = false
    }
  }
 }
</script>
