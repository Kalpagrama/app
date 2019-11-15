<template lang="pug">
q-layout(view='hHh Lpr fFf' :class="{'bg-grey-3': $route.path !== '/app/menu'}").bg-primary
  //- node action dialog
  k-dialog-bottom(ref="fragmentActionDialog" :value="$store.state.ui.fragmentActionDialogOpened" mode="actions" :options="fragmentActionDialogOptions"
    @action="fragmentActionDialogAction" @hide="$store.commit('ui/stateSet', ['fragmentActionDialogOpened', false])")
  //- node rate dialog
  q-dialog(ref="nodeRateDialog" :value="$store.state.ui.nodeRateDialogOpened" :maximized="true" transition-show="slide-up" transition-hide="slide-down"
    @hide="$store.commit('ui/stateSet', ['nodeRateDialogOpened', false])")
    node-rate(@hide="$refs.nodeRateDialog.hide()")
  //- node creator dialog
  q-dialog(ref="nodeCreatorDialog" :value="$store.state.ui.nodeCreatorDialogOpened" :maximized="true" transition-show="slide-up" transition-hide="slide-down"
    @hide="$store.commit('ui/stateSet', ['nodeCreatorDialogOpened', false])")
    node-creator(@hide="$refs.nodeCreatorDialog.hide()")
  //- bookmark dialog
  q-dialog(
    ref="bookmarkDialog" :value="$store.state.ui.bookmarkDialogOpened"
    @hide="$store.commit('ui/stateSet', ['bookmarkDialogOpened', false])"
    :maximized="true" transition-show="slide-up" transition-hide="slide-down")
    ws-bookmark(@hide="$refs.bookmarkDialog.hide()")
  //- fragment dialog
  q-dialog(
    ref="fragmentDialog" :value="$store.state.ui.fragmentDialogOpened"
    @hide="$store.commit('ui/stateSet', ['fragmentDialogOpened', false])"
    :maximized="true" transition-show="slide-up" transition-hide="slide-down")
    ws-fragment(@hide="$refs.fragmentDialog.hide()")
  //- content dialog
  q-drawer(v-model="leftDrawerShow" side="left" show-if-above :breakpoint="500" :width="leftDrawerWidth").gt-xs
    k-menu-desktop(v-if="!loading" @width="leftDrawerWidth = $event")
  //- page
  q-page-container
    q-page
      q-resize-observer(@resize="onResize")
      router-view(v-if="!loading" :height="$q.screen.gt.xs ? height : height-60" :width="width")
      div(v-else).row.full-width.window-height.items-center.justify-center
        k-spinner(:width="200" :height="200")
  q-footer(reveal).lt-sm
    k-menu-mobile
</template>

<script>

export default {
  name: 'mainLayout',
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
  // watch: {
  //   '$q.screen.gt.sm': {
  //     immediate: true,
  //     handler (to, from) {
  //       this.$log('gt.sm CHANGED', to)
  //       let vh = window.innerHeight
  //       // if (to) vh = vh * 0.01
  //       // else vh = (vh - 60) * 0.01
  //       vh = vh * 0.01
  //       document.documentElement.style.setProperty('--vh', `${vh}px`)
  //     }
  //   }
  // },
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
        confirmName: 'Создать ядро',
        actions: {
          contentSubscribe: {name: 'Подпсаться на контент'},
          contentExplore: {name: 'Исследовать контент'},
          fragmentWorkspace: {name: 'Фрагмент в мастерскую'}
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
  async created () {
    try {
      // this.$log('created')
      // console.time('created')
      // this.$q.notify('Created start')
      this.loading = true
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
      this.$log('userIsAuthorized', userIsAuthorized)
      this.$log('userIsConfirmed', userIsConfirmed)
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
.q-footer {
  background: none !important
}
</style>
