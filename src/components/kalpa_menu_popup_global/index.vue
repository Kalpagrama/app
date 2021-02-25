<style lang="sass">
.menu-item
  &:hover
    background: rgb(40,40,40)
</style>

<template lang="pug">
q-btn(
  flat no-caps
  :round="isRound"
  :color="color"
  :style=`{
    ...styles,
  }`)
  user-avatar(
    :url="$store.getters.currentUser().profile.photoUrl" :width="24" :height="24"
    :style=`{
      borderRadius: '50%',
    }`)
  div(v-if="showLabel").row.full-width.justify-center
    span.text-white Меню
  q-menu(
    anchor="top right" self="bottom right" dark
    :max-height="$q.screen.height+'px'"
    :offset="[0,8]"
    )
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
            span(:style=`{fontSize: '18px'}`).text-white.text-bold {{$t('kalpagrama', 'Кальпаграма')}}
            .row.full-width
              small.text-grey-4 {{$t('kalpaMenu_title', 'Продвигай суть!')}}
      //- body
      .row.full-width.items-start.content-start.q-pa-sm
        router-link(
          v-for="(p,pi) in pages" :key="p"
          :to="'/'+p.id"
          :style=`{
            height: '50px',
            background: 'rgb(33,33,33)',
            borderRadius: '10px',
          }`
          ).row.full-width.items-center.content-center.q-pa-sm.q-mb-sm
          q-icon(:name="p.icon" size="24px" color="white").q-ml-xs.q-mr-sm
          span(
            :style=`{
              textDecotation: 'none',
            }`
            ).text-white {{ p.name }}
      //- footer
      router-link(
        :to="'/user/'+$store.getters.currentUser().oid"
        :style=`{
          borderRadius: '10px',
        }`
        ).row.full-width.items-center.content-center.q-pa-sm.menu-item
        div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
          user-avatar(:url="$store.getters.currentUser().profile.photoUrl" :width="40" :height="40")
        .col.full-heigh
          .row.fit.items-center.content-center
            span(:style=`{fontSize: '18px', lineHeight: 1.1}`).text-white.text-bold {{$store.getters.currentUser().name}}
            //- small.text-grey-4.full-width {{ '@'+$store.getters.currentUser().username }}
</template>

<script>
export default {
  name: 'kalpaMenuPopupGlobal',
  props: {
    color: {
      type: String,
      default: 'grey-7'
    },
    isRound: {
      type: Boolean,
      default: false,
    },
    showLabel: {
      type: Boolean,
      default: true
    },
    styles: {
      type: Object,
      default () {
        return {}
      }
    }
  },
  data () {
    return {
    }
  },
  computed: {
    pages () {
      return [
        {id: 'feeds', name: 'Лента', icon: 'view_agenda'},
        {id: 'trends', name: 'Поиск', icon: 'search'},
        {id: 'workspace', name: 'Мастерская', icon: 'construction'},
        {id: 'notifications', name: this.$t('pageNotifications_title', 'Уведомления'), icon: 'notifications_none'},
        {id: 'settings', name: 'Настройки', icon: 'settings'},
      ]
    }
  }
}
</script>
