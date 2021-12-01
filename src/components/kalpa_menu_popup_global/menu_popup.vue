<template lang="pug">
q-menu(
  anchor="top right" self="bottom right" dark
  :max-height="$q.screen.height+'px'"
  :offset="offset || [0,0]")
  div(:style=`{width: '270px',borderRadius: '20px',}`).row.shadow-20
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
          span(:style=`{fontSize: '18px'}`).text-grey-5.text-bold {{$t('Kalpagrama')}}
          .row.full-width
            small.text-grey-4 {{$t('Connect the dots')}}
    //- body
    div(
      :style=`{
        paddingLeft: '14px',
        paddingRight: '14px',
      }`
      ).row.full-width.items-start.content-start
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
        q-icon(:name="p.icon" size="24px" color="grey-5" :style=`{marginRight: '18px'}`).q-ml-xs
        span(
          :style=`{
            textDecotation: 'none',
          }`
          ).text-grey-5 {{ p.name }}
    //- Create new
    div(
      v-if="!$store.getters.isGuest && $q.screen.height > 570"
      @click="addItemMenuShow = true"
      v-close-popup
      :style=`{
        paddingLeft: '14px',
        paddingRight: '14px',
      }`
    ).row.full-width.items-start.content-start.q-pb-sm
      q-dialog(
        v-model="addItemMenuShow"
        position="standard"
        :maximized="false"
        )
        div(:style=`{background: 'rgb(35,35,35)',borderRadius: '10px'}`).row.full-width.q-pa-md.justify-center
          q-btn(
            outline color="grey-8"
            size="xl"
            align="center"
            :to="''"
            :label="$t('Essence core')"
            icon='adjust'
            round flat no-caps
            ).row.full-width.create-item.q-pa-sm
          q-btn(
            outline color="grey-8"
            align="center"
            size="xl"
            :to="'/workspace/edit?mode=block'"
            :label="$t('Essence block')"
            icon='dashboard_customize'
            round flat no-caps
            ).row.full-width.create-item.q-pa-sm
      div(:style=`{
          height: '50px',
          background: 'rgb(33,33,33)',
          borderRadius: '10px',
        }`
      ).row.full-width.items-center.content-center.q-pa-sm.cursor-pointer
        q-icon(name='add_circle_outline' size="24px" color="grey-5" :style=`{marginRight: '18px'}`).q-ml-xs
        span(
          :style=`{
            textDecotation: 'none',
          }`
        ).text-grey-5 {{$t('Create')}}
    div(
      :style=`{
        paddingLeft: '14px',
        paddingRight: '14px',
      }`
    ).row.full-width.items-start.content-start
      div(
        @click="$go('/about')"
        v-close-popup
        :style=`{
          height: '50px',
          background: 'rgb(33,33,33)',
          borderRadius: '10px',
        }`
      ).row.full-width.items-center.content-center.q-pa-sm.q-mb-sm.cursor-pointer
        q-icon(name='help_outline' size="24px" color="grey-5" :style=`{marginRight: '18px'}`).q-ml-xs
        span.text-grey-5 {{ $t('How to use?') }}
    //- footer GUEST
    div(
      v-if="$store.getters.isGuest"
      v-close-popup
      @click="$store.commit('ui/stateSet', ['authGuard', {message: ''}])"
      :style=`{
        height: '60px',
        borderRadius: '20px',
        overflow: 'hidden'
      }`
      ).row.full-width.items-cener.content-center.menu-item
      div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center.q-ml-sm
        div(
          :style=`{
            height: '40px', width: '40px',
            minWidth: '40px', minHeight: '40px',
            maxWidth: '40px', maxHeight: '40px',
            borderRadius: '50%',
          }`).row.items-center.content-center.justify-center.b-50
          q-icon(name="person" size="26px" color="grey-5")
      div(v-if="!mini").col.full-height
        .row.fit.items-center.content-center
          span(:style=`{fontSize: '18px'}`).text-grey-5.text-bold {{$t('Login')}}
    //- footer USER
    div(
      v-if="!$store.getters.isGuest"
      v-close-popup
      @click="$eventBus.$emit('btn-user-clicked'), $go('/user/'+$store.getters.currentUser.oid)"
      :style=`{
        borderRadius: '20px',
      }`
      ).row.full-width.items-center.content-center.q-pa-sm.menu-item
      div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
        user-avatar(
          :url="$store.getters.currentUser.thumbUrl" :width="40" :height="40")
      .col.full-heigh
        .row.fit.items-center.content-center
          span(
            :style=`{fontSize: '18px', lineHeight: 1.1}`).text-grey-5.text-bold {{$store.getters.currentUser.name}}
          //- small.text-grey-4.full-width @username
</template>

<script>
export default {
  name: 'menuPopup',
  props: ['offset'],
  data () {
    return {
      addItemMenuShow: false,
    }
  },
  computed: {
    pages () {
      return [
        {id: 'home', name: this.$t('Home'), icon: 'home'},
        {id: 'trends', name: this.$t('Search'), icon: 'search'},
        {id: 'workspace', name: this.$t('Workspace'), icon: 'construction'},
        {id: 'notifications', name: this.$t('Activity'), icon: 'notifications_none'},
        {id: 'settings', name: this.$t('Settings'), icon: 'settings'},
      ]
    }
  },
}
</script>
