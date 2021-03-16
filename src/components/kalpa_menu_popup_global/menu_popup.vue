<template lang="pug">
q-menu(
  anchor="top right" self="bottom right" dark
  :max-height="$q.screen.height+'px'"
  :offset="[0,8]")
  //- :offset="[16,16]"
  div(:style=`{width: '300px',}`).row.shadow-20
    //- header
    router-link(
      :to="'/about'"
      :style=`{borderRadius: '10px',}`
      ).row.full-width.items-center.content-center.q-pa-sm.menu-item
      div(
        :style=`{zIndex: 100, height: '60px', width: '60px', cursor: 'pointer !important'}`
        ).row.items-center.content-center.justify-center.cursor-pointer
        kalpa-logo(:width="40" :height="40" :style=`{pointEvents: 'none'}`)
      div(v-if="!mini").col
        div(
          ).row.fit.items-center.content-center.cursor-pointer
          span(:style=`{fontSize: '18px'}`).text-white.text-bold {{$tt('Kalpagrama')}}
          .row.full-width
            small.text-grey-4 {{$tt('Connect the dots')}}
    //- body
    div(
      :style=`{
        paddingLeft: '14px',
        paddingRight: '14px',
      }`
      ).row.full-width.items-start.content-start.q-py-sm
      router-link(
        v-for="(p,pi) in pages" :key="p"
        :to="'/'+p.id"
        :style=`{
          height: '50px',
          background: 'rgb(33,33,33)',
          borderRadius: '10px',
        }`
        ).row.full-width.items-center.content-center.q-pa-sm.q-mb-sm
        q-icon(:name="p.icon" size="24px" color="white" :style=`{marginRight: '18px'}`).q-ml-xs
        span(
          :style=`{
            textDecotation: 'none',
          }`
          ).text-white {{ p.name }}
    //- footer GUEST
    router-link(
      v-if="$store.getters.currentUser().profile.role === 'GUEST'"
      @click="footerClick"
      :to="'/auth/sign-in'"
      :style=`{
        borderRadius: '10px',
      }`
      ).row.full-width.items-center.content-center.q-pa-sm.menu-item
      div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
        q-icon(name="login" color="white" size="40px")
      .col
        .row.fit.items-center.content-center
          span(:style=`{fontSize: '18px', lineHeight: 1.1}`).text-white.text-bold Войти
    //- footer USER
    router-link(
      v-if="$store.getters.currentUser().profile.role !== 'GUEST'"
      v-close-popup
      @click="footerClick"
      :to="'/user/'+$store.getters.currentUser().oid"
      :style=`{
        borderRadius: '10px',
      }`
      ).row.full-width.items-center.content-center.q-pa-sm.menu-item
      div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
        user-avatar(
          v-if="$store.getters.currentUser().profile.role !== 'GUEST'"
          :url="$store.getters.currentUser().profile.photoUrl" :width="40" :height="40")
        div(
          v-else
          :style=`{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
          }`
          ).b-60
      .col.full-heigh
        .row.fit.items-center.content-center
          span(
            v-if="$store.getters.currentUser().profile.role !== 'GUEST'"
            :style=`{fontSize: '18px', lineHeight: 1.1}`).text-white.text-bold {{$store.getters.currentUser().name}}
          div(
            v-else
            :style=`{
              height: '24px',
              borderRadius: '10px'
            }`
            ).full-width.b-60
          small.text-grey-4.full-width @username
</template>

<script>
export default {
  name: 'menuPopup',
  computed: {
    pages () {
      return [
        {id: 'feeds', name: this.$tt('Feed'), icon: 'view_agenda'},
        {id: 'trends', name: this.$tt('Search'), icon: 'search'},
        {id: 'workspace', name: this.$tt('Workspace'), icon: 'construction'},
        {id: 'notifications', name: this.$tt('Activity'), icon: 'notifications_none'},
        {id: 'settings', name: this.$tt('Settings'), icon: 'settings'},
      ]
    }
  },
}
</script>
