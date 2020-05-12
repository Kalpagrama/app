<style lang="sass">
.menu-item
  &:hover
    background: #888
</style>

<template lang="pug">
.column.fit
  //- header
  div(
    :style=`{height: '60px'}`
    ).row.full-width.items-center.content-center
    div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
      q-btn(round flat color="white" :style=`{borderRadius: '50%'}`)
        q-icon(name="blur_on" size="36px" color="white")
    .col
      .row.fit.items-center.content-center
        span(:style=`{fontSize: '18px'}`).text-white.text-bold Kalpagramma
        .row.full-width
          small.text-white Up the essence!
  //- body
  div(:style=`{overflowX: 'hidden'}`).col.full-width.q-pt-sm
    div(
      :style=`{
        borderRadius: '10px', overflow: 'hidden', background: 'rgb(54,54,54)'
      }`
      ).column.full-width
        router-link(
          v-if="$store.getters.currentUser"
          :to="'/user/'+$store.getters.currentUser.oid"
          :style=`{height: '70px'}`
          ).row.full-width.items-center.content-center
          div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
            kalpa-avatar(:url="$store.getters.currentUser.profile.photoUrl" :width="40" :height="40")
          .col.full-height
            .row.fit.items-center.content-center
              span(:style=`{lineHeight: 1.1}`).text-white.text-bold {{$store.getters.currentUser.name}}
              small.text-white.full-width {{ '@'+$store.getters.currentUser.name }}
        router-link(
          v-for="(p,pi) in pages" :key="p.id"
          :to="{name: p.id}"
          :class=`{
            'bg-grey-7': $route.name === p.id
          }`
          :style=`{
            height: '60px'
          }`
          ).row.full-width.items-center.menu-item
          div(:style=`{height: '50px', width: '60px'}`).row.items-center.content-center.justify-center
            q-btn(round dense flat :icon="p.icon" color="white")
          span.text-white {{ p.name }}
        //- refresh
        div(
          :style=`{height: '50px'}` @click="refresh()"
          ).row.full-width.items-center.content-center.menu-item.cursor-pointer
          div(:style=`{height: '50px', width: '60px'}`).row.items-center.content-center.justify-center
            q-btn(round dense flat icon="refresh" color="white" :loading="refreshLoading")
          span(:style=`{userSelect: 'none', pointerEvents: 'none'}`).text-white Refresh
        //- logout
        div(
          :style=`{height: '50px'}` @click="logout()"
          ).row.full-width.items-center.content-center.menu-item.cursor-pointer
          div(:style=`{height: '50px', width: '60px'}`).row.items-center.content-center.justify-center
            q-btn(round dense flat icon="power_off" color="white" :loading="logoutLoading")
          span(:style=`{userSelect: 'none', pointerEvents: 'none'}`).text-white Logout
        //- create node
        div(
          :style=`{}`
          ).row.full-width.items-center.content-center.q-px-md.q-py-sm
          q-btn(
            push color="green" no-caps align="left"
            :style=`{height: '50px'}`).full-width
            span.q-ml-lg Create node
        //- version
        .row.full-width.items-center.q-px-md.q-py-sm
          small(:style=`{marginLeft: '6px'}`).text-grey-6 Version: 0.1.0-12.05.2020
        //- slot(name="footer")
</template>

<script>
export default {
  name: 'kalpaMenu',
  data () {
    return {
      pages: [
        {id: 'home', name: 'Home', icon: 'home'},
        {id: 'trends', name: 'Trends', icon: 'whatshot'},
        {id: 'workspace', name: 'Workspace', icon: 'school'},
        // {id: 'settings', name: 'Settings', icon: 'tune'},
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
      await this.$store.dispatch('cache/clear')
      window.location.reload(true)
      this.refreshLoading = false
    },
    async logout () {
      this.$log('logout')
      if (!confirm('Really logout ?')) return
      this.logoutLoading = true
      await this.$wait(1000)
      await this.$store.dispatch('cache/clear')
      await this.$store.dispatch('auth/logout')
      this.logoutLoading = false
    }
  }
}
</script>
