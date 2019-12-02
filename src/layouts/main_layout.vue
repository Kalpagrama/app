<style lang="stylus">
</style>

<template lang="pug">
.row.fit.items-center.justify-center
  q-dialog(ref="tutorialDialog" :maximized="true")
    k-dialog-tutorial
  k-spinner(v-if="loading")
  q-resize-observer(@resize="onResize")
  transition(appear :enter-active-class="$store.state.ui.going ? 'animated slideInRight' : ''")
    router-view(v-if="!loading" :opened="true" :height="$q.screen.height" :width="$q.screen.width")
</template>

<script>
export default {
  name: 'mainLayout',
  components: {},
  data () {
    return {
      loading: true,
      width: 0,
      height: 0
    }
  },
  computed: {
  },
  watch: {
    '$q.screen.gt.xs': {
      immediate: true,
      handler (to, from) {
        this.$log('gt.sm CHANGED', to)
        this.$store.commit('ui/stateSet', ['gtxs', to])
      }
    }
  },
  methods: {
    onResize (e) {
      this.$log('onResize', e)
      this.width = e.width
      let vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty('--vh', `${vh}px`)
      this.height = vh
    }
  },
  async created () {
    try {
      this.$log('created')
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
        this.$log('GO LOGIN')
        this.$router.push('/login')
        this.$q.notify('Go login')
        return
      }
      await this.$store.dispatch('init')
      this.loading = false
    } catch (error) {
      this.$log('error', error)
      // this.loading = false
    }
  }
 }
</script>
