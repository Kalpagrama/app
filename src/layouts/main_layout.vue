<template lang="pug">
  q-layout(view='hHh Lpr fFf'
    :class=`{'bg-black': $route.name === 'content', 'bg-grey-4': $route.name !== 'content'}`)
    q-page-container
      q-page
        k-menu-vert(:loading="loading").gt-sm
        router-view(v-if="!loading")
        div(v-else).row.full-width.window-height.items-center.justify-center
          q-spinner(size="50px" :thickness="2" color="primary")
    q-footer(reveal :style=`{background: 'none'}`).lt-md
      k-menu-horiz(v-if="$store.state.auth.user")
</template>

<script>
import kMenuVert from 'components/k_menu_vert'
import kMenuHoriz from 'components/k_menu_horiz'

export default {
  name: 'mainLayout',
  components: {kMenuHoriz, kMenuVert},
  data () {
    return {
      loading: true,
      showLeftDrawer: true
    }
  },
  watch: {
    '$store.state.workspace.workspace': {
      deep: true,
      immediate: false,
      async handler (to, from) {
        if (this.loading) return
        this.$log('workspace CHANGED', to)
        let {data: {userWorkspaceUpdate}} = await this.$apollo.mutate({
          mutation: gql`
            mutation userWorkspaceUpdate ($workspace: RawJSON) {
              userWorkspaceUpdate(workspace: $workspace)
            }
          `,
          variables: {
            workspace: to
          }
        })
      }
    }
  },
  async created () {
    try {
      // this.$log('created')
      // console.time('created')
      this.loading = true
      // save last route to state
      // await this.$wait(3000)
      // if (localStorage.getItem('kdebug')) this.d = true
      // check token
      let token = this.$route.query.token
      if (token) localStorage.setItem('ktoken', token)
      // user check
      // this.$log('Checking user...')
      let { data: { userIsAuthorized, userIsConfirmed } } = await this.$apollo.query({
        query: gql`
        query userCheck {
          userIsAuthorized
          userIsConfirmed
          }`
        })
      // this.$log('userIsAuthorized', userIsAuthorized)
      // this.$log('userIsConfirmed', userIsConfirmed)
      // TODO: create with try/catch this...
      if (!userIsAuthorized || !userIsConfirmed) {
        this.$log('GO LOGIN')
        this.$router.push('/login')
        this.$q.notify('Go login')
        throw new Error(`No auth!`)
        // TODO: error code? switch...
      }
      // user
      // this.$log('Getting user...')
      let { data: { user } } = await this.$apollo.query({query: gql`query getCurrentUser { user { oid name thumbUrl(preferWidth: 50) } }`})
      // this.$log('user', user)
      this.$store.commit('auth/state', ['user', user])
      // workspace
      // this.$log('Getting user workspace')
      let { data: { userWorkspace } } = await this.$apollo.query({query: gql`query getUserWorkspace { userWorkspace }`})
      this.$log('userWorkspace', userWorkspace)
      this.$store.commit('workspace/state', ['workspace', userWorkspace])
      // return to path
      // let path = localStorage.getItem('path')
      // this.$log('path', path)
      // if (path) this.$router.push(path)
      // await this.$wait(1000)
      // this.$log('created done')
      // console.timeEnd('created')
      this.loading = false
    } catch (error) {
      this.$log('error', error)
      // this.loading = false
    }
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
