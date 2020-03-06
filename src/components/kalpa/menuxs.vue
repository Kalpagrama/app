<template lang="pug">
div(
  :style=`{position: 'relative', zIndex: 200,
  height: $q.screen.width+'px',
  borderRadius: '30px 30px 0 0'}`
  ).row.full-width.bg-grey-8
  //- home
  div(
    :style=`{width: $q.screen.width/3+'px', height: $q.screen.width/3+'px'}`).row.items-center.content-center.justify-center
    kalpa-spinner(:width="40" :height="40" @click.native="homeClick()").cursor-pointer.q-mt-sm
    .row.full-width.justify-center
      small.text-white.q-mt-sm Home
  //- pages
  div(
    v-for="(p, pi) in pages" :key="p.id"
    :style=`{position: 'relative', zIndex: 2000, width: $q.screen.width/3+'px', height: $q.screen.width/3+'px'}`).row.items-center.content-center.justify-center
    q-btn(
      round flat @click="pageClick(p)"
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
  //- help
  //- div(
  //-   :style=`{width: $q.screen.width/3+'px', height: $q.screen.width/3+'px'}`).row.items-center.content-center.justify-center
  //-   div(:style=`{width: '60px', height: '60px'}` @click="helpClick()").row.items-center.content-center.justify-center
  //-     small(
  //-       :class=`{
  //-         'text-bold': $route.name === 'help',
  //-         'text-green': $route.name === 'help',
  //-         'text-white': $route.name !== 'help'
  //-       }`
  //-       :style=`{fontSize: '40px',}`) ?
  //-   .row.full-width.justify-center
  //-     small.text-white Help
  //- logout
  //- div(
  //-   :style=`{width: $q.screen.width/3+'px', height: $q.screen.width/3+'px'}`).row.items-center.content-center.justify-center
  //-   div(:style=`{width: '60px', height: '60px'}` @click="helpClick()").row.items-center.content-center.justify-center
  //-     q-btn(round flat icon="power_off" color="white" size="lg" @click="pageCli")
  //-   .row.full-width.justify-center
  //-     small.text-white
  //- help
  div(
    :style=`{width: $q.screen.width/3+'px', height: $q.screen.width/3+'px'}`).row.items-center.content-center.justify-center
    div(:style=`{width: '60px', height: '60px'}`).row.items-center.content-center.justify-center
      q-btn(round flat icon="clear" color="red" size="lg" @click="$emit('close')")
    .row.full-width.justify-center
      small.text-white
</template>

<script>
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
          this.$log('logout start')
          // this.loggingOut = true
          // await this.$wait(800)
          let res = await this.$store.dispatch('auth/logout')
          this.$log('logout done', res)
          // this.loggingOut = false
          break
        }
        case 'debug': {
          this.$store.commit('ui/stateSet', ['debug', !this.$store.state.ui.debug])
          this.$emit('close')
          break
        }
        case 'refresh': {
          this.$log('cacheClear')
          this.cacheClearing = true
          await this.$wait(800)
          this.cacheClearing = false
          this.$store.dispatch('cache/clear')
          window.location.reload(true)
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
