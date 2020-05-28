<template lang="pug">
div(
  :style=`{position: 'relative', zIndex: 200,
  height: ($q.screen.width/4)*2+'px',
  maxWidth: $store.state.ui.maxWidthPage+'px',
  borderRadius: '10px'}`
  ).row.full-width.bg-grey-8
  //- home
  div(
    :style=`{width: $q.screen.width/4+'px', height: $q.screen.width/4+'px'}`).row.items-center.content-center.justify-center
    kalpa-spinner(:width="40" :height="40" @click.native="homeClick()").cursor-pointer.q-mt-sm
    .row.full-width.justify-center
      small.text-white.q-mt-sm Home
  //- pages
  div(
    v-for="(p, pi) in pages" :key="p.id"
    :style=`{position: 'relative', zIndex: 2000, width: $q.screen.width/4+'px', height: $q.screen.width/4+'px'}`).row.items-center.content-center.justify-center
    q-btn(
      round flat @click="pageClick(p)"
      :loading="p.id === pageLoading"
      :color="$route.name === p.id ? 'green' : 'white'" :icon="p.icon"
      :size="$route.name === p.id ? 'xl' : 'lg'"
      :style=`{position: 'relative', zIndex: 2000}`)
    .row.full-width.justify-center
      small(
        :class=`{
          'text-bold': $route.name === p.id,
          'text-green': $route.name === p.id,
          'text-white': $route.name !== p.id
        }`).text-white {{ p.name }}
</template>

<script>
  import { logoutSession } from 'src/system/auth'

export default {
  name: 'kalpaMenuXs',
  data () {
    return {
      pages: [
        {id: 'trends', name: 'Trends', icon: 'whatshot'},
        {id: 'workspace', name: 'Workspace', icon: 'school'},
        {id: 'settings', name: 'Settings', icon: 'settings'},
        {id: 'account', name: 'Account', icon: 'perm_identity'},
        {id: 'refresh', name: 'Refresh', icon: 'refresh'},
        {id: 'debug', name: 'Debug', icon: 'bug_report'},
        {id: 'logout', name: 'Logout', icon: 'power_off'}
      ],
      pageLoading: null,
      cacheClearing: false
    }
  },
  methods: {
    homeClick () {
      this.$log('homeClick')
      this.$router.push('/').catch(e => e)
    },
    async pageClick (p) {
      this.$log('pageClick', p)
      switch (p.id) {
        case 'trends':
        case 'workspace':
        case 'settings':
        case 'account': {
          this.$router.push('/' + p.id).catch(e => e)
          break
        }
        case 'logout': {
          try {
            this.$log('logout start')
            this.pageLoading = 'logout'
            if (!confirm('Really logout?')) throw new Error('User changed mind')
            this.$wait(1500).then(() => {
              this.pageLoading = null
            })
            let res = await logoutSession()
            this.$log('logout done', res)
            break
          }
          catch (e) {
            this.$log('logout error', e)
            this.pageLoading = null
            break
          }
        }
        case 'debug': {
          this.$store.commit('ui/stateSet', ['debug', !this.$store.state.ui.debug])
          this.$emit('close')
          break
        }
        case 'refresh': {
          this.$log('cacheClear')
          this.pageLoading = 'refresh'
          await this.$wait(1500)
          this.pageLoading = null
          this.$store.dispatch('cache/clear')
          window.location.reload()
          break
        }
      }
    },
    helpClick () {
      this.$log('helpClick')
      this.$router.push('/help').catch(e => e)
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
