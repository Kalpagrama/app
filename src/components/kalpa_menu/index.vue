<style lang="sass">
.menu-item
  &:hover
    background: rgb(40,40,40)
</style>

<template lang="pug">
.column.full-width
  //- header
  div(
    :style=`{borderRadius: '10px',}`
    ).row.full-width.items-center.content-center
    //- home
    router-link(
      :to="isGuest ? '/trends' : '/feeds/all'"
      :style=`{borderRadius: '10px',}`
      ).row.full-width
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
  div(:style=`{overflowX: 'hidden'}`).col.full-width
    div(
      :style=`{
        borderRadius: '10px', overflow: 'hidden'
      }`
      ).column.full-width.q-pt-sm
        router-link(
          v-for="(p,pi) in pages" :key="p.id"
          v-if="p.id === 'trends' ? true : !isGuest"
          :to="{name: p.id}"
          :class=`{
            'b-40': $route.path.split('/')[1] === p.id
          }`
          :style=`{
            height: $q.screen.width > 600 ? '55px' : '55px',
            borderRadius: '10px', overflow: 'hidden',
            maxWidth: '210px',
          }`
          ).row.full-width.items-center.menu-item.q-mb-md
          div(:style=`{width: '60px'}`).row.full-height.items-center.content-center.justify-center
            q-icon(size="30px" :name="p.icon" :color="p.color || 'white'")
          span(
            v-if="!mini"
            :style=`{fontSize: '18px'}`).text-bold.text-white {{ p.name }}
        //- user
        router-link(
          v-if="!isGuest"
          :to="'/user/'+$store.getters.currentUser().oid"
          :class=`{
            'b-60': $route.path.split('/')[1] === 'user' && $route.params.oid === $store.getters.currentUser().oid
          }`
          :style=`{
            height: '60px', borderRadius: '10px', overflow: 'hidden',
            maxWidth: '210px',
          }`
          ).row.full-width.items-center.content-center.menu-item
          div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
            user-avatar(:url="$store.getters.currentUser().profile.photoUrl" :width="40" :height="40")
          div(v-if="!mini").col.full-height
            .row.fit.items-center.content-center
              span(:style=`{fontSize: '18px', lineHeight: 1.1}`).text-white.text-bold {{$store.getters.currentUser().name}}
              small.text-grey-4.full-width {{ '@'+$store.getters.currentUser().username }}
        //- actions
        .row.full-width
          q-btn(
            icon="more_horiz"
            flat color="white" no-caps
            :align="mini ? 'center' : 'left'"
            :style=`{
              height: '60px',
              paddingLeft: '2px',
              maxWidth: '210px',
            }`
            ).full-width.menu-item
            q-popup-proxy(
              fit anchor="top right" self="bottom right"
              )
              div(:style=`{maxWidth: '210px', borderRadius: '10px',}`).row.full-width.b-40
                q-btn(
                  v-for="(a,akey) in actions" :key="akey"
                  @click="a.cb()"
                  flat color="white" no-caps
                  align="left"
                  :style=`{
                    height: '50px',
                    paddingLeft: '40px',
                  }`
                  ).full-width
                  span(:style=`{fontSize: '14px'}`).text-bold {{a.name}}
            span(
              v-if="!mini"
              :style=`{fontSize: '18px'}`).text-bold.q-ml-md Eще
        //- create node
        .row.full-width.items-center.content-center.q-mt-sm
          q-btn(
            :to="isGuest ? '/auth' : '/workspace/create'"
            color="green" no-caps icon="add" size="md"
            :align="mini ? 'center' : 'left'"
            :style=`{
              height: '50px',
              paddingLeft: '2px',
              maxWidth: '210px',
            }`).full-width.menu-item
            span(
              v-if="!mini"
              :style=`{fontSize: '18px'}`).text-bold.q-ml-md Создать ядро
        //- docs
        kalpa-docs(
          v-if="!mini"
          :style=`{
            maxWidth: '200px',
          }`).q-py-sm
        //- version
        div(v-if="!mini").row.full-width.items-center.q-pa-md
          small(:style=`{userSelect: 'none', marginLeft: '6px'}`).text-grey-8 {{$t('kalpaMenu_version', 'Версия') + ': ' + $store.state.core.version + ' - ' + $store.state.core.buildDate}}
</template>

<script>
import { AuthApi } from 'src/api/auth'

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
    return {
      pages: [
        {id: 'feeds', name: 'Домашняя', icon: 'home'},
        {id: 'trends', name: 'Новое', icon: 'explore'},
        {id: 'workspace', name: 'Закладки', icon: 'bookmark_outline'},
        {id: 'notifications', name: this.$t('pageNotifications_title', 'Уведомления'), icon: 'notifications_none'},
        {id: 'about', name: 'Что это?', icon: 'support'}
      ]
    }
  },
  computed: {
    isGuest () {
      return this.$store.getters.currentUser().profile.role === 'GUEST'
    },
    actions () {
      let res = {
        refresh: {
          name: 'Обновить',
          cb: async () => {
            await this.$systemUtils.vibrate(200)
            await this.$systemUtils.reset()
          }
        }
      }
      if (this.isGuest) {
        res.login = {
          name: 'Войти',
          cb: async () => {
            this.$log('action:login')
            this.$router.push('/auth')
          }
        }
      }
      else {
        res.settings = {
          name: 'Настройки',
          cb: async () => {
            this.$log('action:settings')
            this.$router.push('/settings')
          }
        }
        res.logout = {
          name: 'Выйти',
          cb: async () => {
            this.$log('action:logout')
            await AuthApi.logout()
            await this.$router.replace('/auth')
          }
        }
      }
      return res
    }
  }
}
</script>
