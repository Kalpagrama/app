<style lang="sass">
.menu-item
  &:hover
    background: rgb(70,70,70)
</style>

<template lang="pug">
div(
  :style=`{
    width: width+'px',
    borderRadius: $store.state.ui.borderRadius+'px',
    overflow: 'hidden',
  }`).column.full-height.b-50
  //- header
  div(
    :style=`{height: '90px'}`
    ).row.full-width.items-center.content-center
    div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
      kalpa-logo(:width="40" :height="40")
    .col
      .row.fit.items-center.content-center
        span(:style=`{fontSize: '18px'}`).text-white.text-bold Kalpagramma
        .row.full-width
          small.text-white Up the essence!
  //- body
  div(:style=`{overflowX: 'hidden'}`).col.full-width.q-pt-sm
    div(
      :style=`{
        borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden'
      }`
      ).column.full-width.b-50
        router-link(
          v-if="$store.getters.currentUser()"
          :to="'/user/'+$store.getters.currentUser().oid"
          :class=`{
            'b-100': $route.name === 'user'
          }`
          :style=`{height: '60px', borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden'}`
          ).row.full-width.items-center.content-center.menu-item
          div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
            kalpa-avatar(:url="$store.getters.currentUser().profile.photoUrl" :width="40" :height="40")
          .col.full-height
            .row.fit.items-center.content-center
              span(:style=`{lineHeight: 1.1}`).text-white.text-bold {{$store.getters.currentUser().name}}
              small.text-white.full-width {{ '@'+$store.getters.currentUser().name }}
        router-link(
          v-for="(p,pi) in pages" :key="p.id"
          :to="{name: p.id}"
          :class=`{
            'b-100': $route.name === p.id
          }`
          :style=`{
            height: '60px', borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden'
          }`
          ).row.full-width.items-center.menu-item
          div(:style=`{height: '50px', width: '60px'}`).row.items-center.content-center.justify-center
            q-btn(round dense flat :icon="p.icon" color="white")
          span(:style=`{fontSize: '18px'}`).text-white {{ p.name }}
        //- refresh
        div(
          :style=`{height: '60px', borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden'}` @click="refresh()"
          ).row.full-width.items-center.content-center.menu-item.cursor-pointer
          div(:style=`{height: '50px', width: '60px'}`).row.items-center.content-center.justify-center
            q-btn(round dense flat icon="refresh" color="white" :loading="refreshLoading")
          span(:style=`{fontSize: '18px', userSelect: 'none', pointerEvents: 'none'}`).text-white Refresh
        //- logout
        div(
          :style=`{height: '60px', borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden'}` @click="logout()"
          ).row.full-width.items-center.content-center.menu-item.cursor-pointer
          div(:style=`{height: '50px', width: '60px'}`).row.items-center.content-center.justify-center
            q-btn(round dense flat icon="power_off" color="white" :loading="logoutLoading")
          span(:style=`{fontSize: '18px', userSelect: 'none', pointerEvents: 'none'}`).text-white Logout
        //- create node
        div(
          v-if="false"
          :style=`{}`
          ).row.full-width.items-center.content-center.q-px-md.q-py-sm
          q-btn(
            push color="green" no-caps align="left"
            :style=`{height: '50px'}`)
            span(:style=`{fontSize: '18px'}`).q-mx-lg Create node
        //- version
        .row.full-width.items-center.q-px-md.q-py-sm
          small(:style=`{marginLeft: '6px'}`).text-grey-6 Version: 0.9.9-24.06.2020
        //- slot(name="footer")
</template>

<script>
  import { AuthApi } from 'src/api/auth'

export default {
  name: 'kalpaMenu',
  data () {
    return {
      width: 300,
      pages: [
        {id: 'home', name: 'Home', icon: 'home'},
        {id: 'trends', name: 'Trends', icon: 'whatshot'},
        {id: 'workspace', name: 'Workspace', icon: 'school'},
        {id: 'settings', name: 'Settings', icon: 'tune'},
        // {id: 'report', name: 'Report a bug', icon: 'bug_report'}
      ],
      refreshLoading: false,
      logoutLoading: false
    }
  },
  computed: {
  },
  methods: {
    async refresh () {
      this.$log('refresh')
      this.refreshLoading = true
      await this.$wait(1000)
      await this.$rxdb.clearAll()
      // await this.$store.dispatch('cache/clear')
      // window.location.reload(true)
      this.refreshLoading = false
    },
    async logout () {
      this.$log('logout')
      if (!confirm('Really logout ?')) return
      this.logoutLoading = true
      await this.$wait(500)
      await AuthApi.logout()
      this.logoutLoading = false
    }
  }
}
</script>
