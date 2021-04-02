<style lang="sass">
.menu-item
  cursor: pointer
  &:hover
    background: rgb(40,40,40)
</style>

<template lang="pug">
.column.full-width
  //- header
  div(
    :style=`{borderRadius: '10px',}`
    ).row.full-width.items-center.content-center
    div(
      @click="$go('/about')"
      :style=`{borderRadius: '10px',}`
      ).row.full-width
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
  div(:style=`{overflowX: 'hidden'}`).col.full-width
    div(
      :style=`{
        borderRadius: '10px', overflow: 'hidden'
      }`
      ).column.full-width.q-pt-sm
        //- pages
        div(
          v-for="(p,pi) in pages" :key="p.id"
          @click="$go({name: p.id})"
          :class=`{
            'b-40': $route.path.split('/')[1] === p.id
          }`
          :style=`{
            height: $q.screen.width > 600 ? '60px' : '60px',
            borderRadius: '10px', overflow: 'hidden',
          }`
          ).row.full-width.items-center.menu-item.q-mb-sm
          div(:style=`{width: '60px'}`).row.full-height.items-center.content-center.justify-center
            q-icon(size="30px" :name="p.icon" :color="p.color || 'white'")
          span(
            v-if="!mini"
            :style=`{fontSize: '18px'}`).text-bold.text-white {{ p.name }}
        //- user
        div(
          v-if="!$store.getters.isGuest"
          @click="$go('/user/'+$store.getters.currentUser.oid)"
          :class=`{
            'b-60': $route.path.split('/')[1] === 'user' && $route.params.oid === $store.getters.currentUser.oid
          }`
          :style=`{
            height: '60px',
            borderRadius: '10px',
            overflow: 'hidden',
          }`
          ).row.full-width.items-center.content-center.menu-item.cursor-pointer
          div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
            user-avatar(:url="$store.getters.currentUser.profile.photoUrl" :width="40" :height="40")
          div(v-if="!mini").col.full-height
            .row.fit.items-center.content-center
              span(:style=`{fontSize: '18px', lineHeight: 1.1}`).text-white.text-bold {{$store.getters.currentUser.name}}
              //- small.text-grey-4.full-width {{ '@'+$store.getters.currentUser.username }}
        //- login for GUEST
        div(
          v-if="$store.getters.isGuest"
          @click="$store.commit('ui/stateSet', ['authGuard', {message: ''}])"
          :style=`{
            height: '60px',
            borderRadius: '10px',
            overflow: 'hidden'
          }`
          ).row.full-width.items-cener.content-center.menu-item
          div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
            div(
              :style=`{
                height: '40px', width: '40px',
                minWidth: '40px', minHeight: '40px',
                maxWidth: '40px', maxHeight: '40px',
                borderRadius: '50%',
              }`).row.items-center.content-center.justify-center.b-50
              q-icon(name="person" size="26px" color="grey-8")
          div(v-if="!mini").col.full-height
            .row.fit.items-center.content-center
              span(:style=`{fontSize: '18px'}`).text-white.text-bold {{$t('Login')}}
        //- docs
        .row.full-width.q-mt-sm
          kalpa-docs(
            v-if="!mini"
            :textAlign="'center'"
            :style=`{
              maxWidth: '210px',
            }`).q-py-sm
        //- version
        div(v-if="!mini").row.full-width.items-center.q-pa-sm
          small(
            :style=`{userSelect: 'none', marginLeft: '0px'}`
            ).text-grey-9 {{$t('kalpaMenu_version', 'Версия') + ': ' + $store.state.core.version + ' - ' + $store.state.core.buildDate}}
</template>

<script>
import kalpaDocs from 'components/kalpa_docs/index.vue'

export default {
  name: 'kalpaMenu',
  components: {
    kalpaDocs,
  },
  props: {
    mini: {
      type: Boolean,
      default () {
        return false
      }
    }
  },
  data () {
    return {}
  },
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
  methods: {
  }
}
</script>
