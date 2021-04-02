<template lang="pug">
q-menu(
  anchor="top right" self="bottom right" dark
  :max-height="$q.screen.height+'px'"
  :offset="offset || [0,0]")
  div(:style=`{width: '300px',borderRadius: '20px',}`).row.shadow-20
    //- header
    div(
      @click="$go('/about')"
      v-close-popup
      :style=`{borderRadius: '20px',}`
      ).row.full-width.items-center.content-center.q-pa-sm.menu-item.cursor-pointer
      div(
        :style=`{zIndex: 100, height: '60px', width: '60px', cursor: 'pointer !important'}`
        ).row.items-center.content-center.justify-center.cursor-pointer
        kalpa-logo(:width="40" :height="40" :style=`{pointEvents: 'none'}`)
      div(v-if="!mini").col
        div(
          ).row.fit.items-center.content-center.cursor-pointer
          span(:style=`{fontSize: '18px'}`).text-white.text-bold {{$t('Kalpagrama')}}
          .row.full-width
            small.text-grey-4 {{$t('Connect the dots')}}
    //- body
    div(
      :style=`{
        paddingLeft: '14px',
        paddingRight: '14px',
      }`
      ).row.full-width.items-start.content-start.q-py-sm
      div(
        @click="$go('/'+p.id)"
        v-for="(p,pi) in pages" :key="p"
        v-close-popup
        :style=`{
          height: '50px',
          background: 'rgb(33,33,33)',
          borderRadius: '10px',
        }`
        ).row.full-width.items-center.content-center.q-pa-sm.q-mb-sm.cursor-pointer
        q-icon(:name="p.icon" size="24px" color="white" :style=`{marginRight: '18px'}`).q-ml-xs
        span(
          :style=`{
            textDecotation: 'none',
          }`
          ).text-white {{ p.name }}
    //- footer GUEST
    div(
      v-if="$store.getters.isGuest()"
      v-close-popup
      @click="$store.commit('ui/stateSet', ['authGuard', {message: ''}])"
      :style=`{
        height: '60px',
        borderRadius: '10px',
        overflow: 'hidden'
      }`
      ).row.full-width.items-cener.content-center.menu-item.q-mb-sm
      div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center.q-ml-sm
        div(
          :style=`{
            height: '40px', width: '40px',
            minWidth: '40px', minHeight: '40px',
            maxWidth: '40px', maxHeight: '40px',
            borderRadius: '50%',
          }`).row.b-50
      div(v-if="!mini").col.full-height
        .row.fit.items-center.content-center
          span(:style=`{fontSize: '18px'}`).text-white.text-bold {{$t('Login')}}
    //- footer USER
    div(
      v-if="!$store.getters.isGuest()"
      v-close-popup
      @click="$go('/user/'+$store.getters.currentUser.oid)"
      :style=`{
        borderRadius: '10px',
      }`
      ).row.full-width.items-center.content-center.q-pa-sm.menu-item
      div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
        user-avatar(
          :url="$store.getters.currentUser.profile.photoUrl" :width="40" :height="40")
      .col.full-heigh
        .row.fit.items-center.content-center
          span(
            :style=`{fontSize: '18px', lineHeight: 1.1}`).text-white.text-bold {{$store.getters.currentUser.name}}
          //- small.text-grey-4.full-width @username
</template>

<script>
export default {
  name: 'menuPopup',
  props: ['offset'],
  computed: {
    pages () {
      return [
        {id: 'feeds', name: this.$t('Feed'), icon: 'view_agenda'},
        {id: 'trends', name: this.$t('Search'), icon: 'search'},
        {id: 'workspace', name: this.$t('Workspace'), icon: 'construction'},
        {id: 'notifications', name: this.$t('Activity'), icon: 'notifications_none'},
        {id: 'settings', name: this.$t('Settings'), icon: 'settings'},
      ]
    }
  },
}
</script>
