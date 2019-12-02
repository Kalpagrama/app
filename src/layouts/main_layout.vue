<template lang="pug">
.row.fit.items-center.justify-center
  q-dialog(ref="tutorialDialog" :maximized="true")
    k-dialog-tutorial
  k-spinner(v-if="loading")
  transition(appear :enter-active-class="$store.state.ui.going ? 'animated slideInRight' : ''")
    router-view(v-if="!loading" :opened="true" :height="$q.screen.height" :width="$q.screen.width")
</template>

<script>
import kDialogTutorial from 'components/k_dialog_tutorial'

export default {
  name: 'mainLayout',
  components: {kDialogTutorial},
  data () {
    return {
      loading: true,
      leftDrawerShow: true,
      leftDrawerWidth: 230,
      radius: 30,
      width: 0,
      height: 0,
      noPointerEvents: true,
      miniState: false,
      drawer: true,
      toggleIcon: ''
    }
  },
  watch: {
    '$q.screen.gt.xs': {
      immediate: true,
      handler (to, from) {
        this.$log('gt.sm CHANGED', to)
        if (to) {
          this.$store.commit('ui/stateSet', ['gtxs', true])
        } else {
          this.$store.commit('ui/stateSet', ['gtxs', false])
        }
        let vh = window.innerHeight
        // if (to) vh = vh * 0.01
        // else vh = (vh - 60) * 0.01
        vh = vh * 0.01
        document.documentElement.style.setProperty('--vh', `${vh}px`)
      }
    }
  },
  computed: {
    fragmentActionDialogHeaderName () {
      let fragmentPayload = this.$store.state.ui.fragment
      if (fragmentPayload) {
        return fragmentPayload.content.name
      } else {
        return ''
      }
    },
    fragmentActionDialogOptions () {
      return {
        header: false,
        headerName: this.fragmentDialogHeaderName,
        confirm: true,
        confirmName: 'Create node',
        actions: {
          // contentSubscribe: {name: 'Подпсаться на контент'},
          nodeBookmark: {name: 'Node bookmark'},
          contentExplore: {name: 'Explore content'},
          fragmentWorkspace: {name: 'Fragment to workspace'}
        }
      }
    }
  },
  methods: {
    fragmentActionDialogAction (action) {
      this.$log('fragmentDialogAction', action)
      this.$log('fragmentDialogPayload', this.$store.state.ui.fragment)
      switch (action) {
        case 'header': {
          this.$router.push(`/app/content/${this.$store.state.ui.fragment.content.oid}`)
          break
        }
        case 'nodeBookmark': {
          this.$store.commit('ui/stateSet', ['bookmarkDialogOpened', true])
          this.$store.commit('ui/stateSet', ['bookmark', {
            type: 'node',
            name: '',
            url: 'qwe'
          }])
          break
        }
        case 'contentSubscribe': {
          this.$store.dispatch('subscriptions/subscribe', this.$store.state.ui.fragment.content.oid)
          break
        }
        case 'contentExplore': {
          this.$router.push(`/app/content/${this.$store.state.ui.fragment.content.oid}`)
          break
        }
        case 'fragmentWorkspace': {
          this.$store.commit('ui/stateSet', ['fragmentDialogOpened', true])
          break
        }
        case 'confrim': {
          // this.$store.commit('ui/s')
          this.$store.commit('ui/nodeCreatorDialogOpened', true)
          break
        }
      }
    },
    toggleMini (miniState) {
      this.miniState = !this.miniState
    },
    onResize (e) {
      // this.$log('onResize', e)
      this.width = e.width
      this.height = this.$q.screen.height
    }
  },
  mounted () {
    this.$log('mounted')
    this.$refs.pageResizeObserver.trigger()
    this.$refs.tutorialDialog.show()
    if (this.$refs.pageResizeObserver) this.$refs.pageResizeObserver.trigger()
  },
  async created () {
    try {
      // this.$log('created')
      // console.time('created')
      // this.$q.notify('Created start')
      this.loading = true
      // await this.$wait(10000)
      // Oauth case. take token from redirect url
      let token = this.$route.query.token
      let expires = this.$route.query.expires
      if (token) {
        localStorage.setItem('ktoken', token)
        localStorage.setItem('ktokenExpires', expires)
        this.$router.push('/app/home')
      }
      // this.$q.notify('token', token)
      // user check
      // this.$log('Checking user...')
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
      // this.$log('userIsAuthorized', userIsAuthorized)
      // this.$log('userIsConfirmed', userIsConfirmed)
      // this.$q.notify('userIsAuthorized', userIsAuthorized)
      // this.$q.notify('userIsConfirmed', userIsConfirmed)
      // TODO: create with try/catch this...
      if (!userIsAuthorized || !userIsConfirmed) {
        this.$log('GO LOGIN')
        this.$router.push('/login')
        this.$q.notify('Go login')
        return
        // throw new Error(`No auth!`)
        // // TODO: error code? switch...
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

<style lang="stylus">
</style>
