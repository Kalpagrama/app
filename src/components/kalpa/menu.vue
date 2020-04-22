<template lang="pug">
.column.fit
  //- header
  div(
    :style=`{height: '60px'}`
    ).row.full-width.items-center.content-center
    div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
      q-btn(round flat color="white" :style=`{borderRadius: '50%'}`)
        q-icon(name="blur_on" size="36px" color="white")
    span(:style=`{fontSize: '18px'}`).text-white.text-bold Kalpagramma
  //- body
  .col.full-width.q-pt-sm
    div(
      :style=`{
        borderRadius: '10px', overflow: 'hidden'
      }`
      ).column.full-width.bg-grey-8
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
            height: '50px'
          }`
          ).row.full-width.items-center.menu-item
          div(:style=`{height: '50px', width: '60px'}`).row.items-center.content-center.justify-center
            q-btn(round dense flat :icon="p.icon" color="white")
          span.text-white {{ p.name }}
        .row.full-width.items-center.q-px-md.q-py-sm
          small(:style=`{marginLeft: '6px'}`).text-grey-6 1.0
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
        {id: 'settings', name: 'Settings', icon: 'tune'},
        {id: 'report', name: 'Report a bug', icon: 'bug_report'},
        {id: 'refresh', name: 'Refresh', icon: 'refresh'},
        {id: 'logout', name: 'Logout', icon: 'power_off'},
      ]
    }
  },
  computed: {
  },
  methods: {
  }
}
</script>
