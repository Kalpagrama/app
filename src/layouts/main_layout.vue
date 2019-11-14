<template lang="pug">
q-layout(view='hHh Lpr fFf')
  //- node action dialog
  k-dialog-bottom(:value="$store.state.ui.fragmentDialogOpened" mode="actions" :options="fragmentDialogOptions"
    @action="fragmentDialogAction" @hide="$store.commit('ui/stateSet', ['fragmentDialogOpened', false])")
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
  //- content, node
  q-drawer(
    side="left" v-model="drawer" show-if-above
    :mini="!drawer || miniState" bordered content-class="bg-grey-3" :width="250" no-swipe-open).gt-sm
    k-menu-vert.bg-primary
    div(style="margin-top: -80px; margin-right: 4px;").row.justify-start
      q-btn(
        dense round unelevated size="20px" :icon="miniState ? 'chevron_right' : 'chevron_left'" @click="toggleMini"
        style=`color: #fff`)
    .row.full-width.justify-start.q-pl-sm
      span.text-grey-3 0.4.0
  q-page-container
    q-page
      q-resize-observer(@resize="onResize")
      router-view(v-if="!loading" :height="height" :width="width")
      div(v-else).row.full-width.window-height.items-center.justify-center
        k-spinner(:width="200" :height="200")
</template>

<script>
import kMenuVert from 'components/k_menu_vert'
import nodeCreator from 'components/node_creator'

export default {
  name: 'mainLayout',
  components: { kMenuVert, nodeCreator },
  data () {
    return {
      loading: true,
      showLeftDrawer: true,
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
    fragmentDialogHeaderName () {
      let fragmentPayload = this.$store.state.ui.fragmentDialogPayload
      if (fragmentPayload) {
        return fragmentPayload.content.name
      } else {
        return ''
      }
    },
    fragmentDialogOptions () {
      return {
        header: true,
        headerName: this.fragmentDialogHeaderName,
        confirm: true,
        confirmName: 'Создать ядро',
        actions: {
          subscribe: {name: 'Follow'},
          contentExplore: {name: 'Explore content'},
          saveToWorkspace: {name: 'Save to workspace'}
        }
      }
    }
  },
  methods: {
    fragmentDialogAction (action) {
      this.$log('fragmentDialogAction', action)
      this.$log('fragmentDialogPayload', this.$store.state.ui.fragmentDialogPayload)
      switch (action) {
        case 'header': {
          this.$router.push(`/app/content/${this.$store.state.ui.fragmentDialogPayload.content.oid}`)
          break
        }
        case 'subscribe': {
          break
        }
        case 'contentExplore': {
          this.$router.push(`/app/content/${this.$store.state.ui.fragmentDialogPayload.content.oid}`)
          break
        }
        case 'saveToWorkspace': {
          break
        }
        case 'confrim': {
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
      // this.height = e.height
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
