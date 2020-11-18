<style lang="sass">
.menu-item
  &:hover
    background: rgb(40,40,40)
</style>

<template lang="pug">
div(
  :style=`{
    //- maxWidth: mini ? '60px' : '100%',
  }`).column.full-width
  //- $q.platform.is.capacitor paddingTop 20px ?
  //- header
  div(
    :style=`{borderRadius: '10px',}`
    ).row.full-width.items-center.content-center
    //- home
    router-link(
      :to="$store.getters.currentUser().profile.role === 'GUEST' ? '/trends' : '/'"
      :style=`{borderRadius: '10px',}`
      ).row.full-width
      div(
        :style=`{zIndex: 100, height: '60px', width: '60px', cursor: 'pointer !important'}`
        ).row.items-center.content-center.justify-center.cursor-pointer
        kalpa-logo(:width="40" :height="40" :style=`{pointEvents: 'none'}`)
      div(v-if="!mini").col
        div(
          @click="$router.push($store.getters.currentUser().profile.role === 'GUEST' ? '/trends' : '/').catch(e => e)"
          ).row.fit.items-center.content-center.cursor-pointer
          span(:style=`{fontSize: '18px'}`).text-white.text-bold {{$t('kalpaMenu_kalpagrama', 'Кальпаграма')}}
          .row.full-width
            small.text-white {{$t('kalpaMenu_title', 'Продвигай суть!')}}
    //- user
    router-link(
      v-if="$store.getters.currentUser().profile.role !== 'GUEST'"
      :to="'/user/'+$store.getters.currentUser().oid"
      :class=`{
        //- 'b-60': $route.path.split('/')[1] === 'user'
      }`
      :style=`{height: '60px', borderRadius: '10px', overflow: 'hidden'}`
      ).row.full-width.items-center.content-center.menu-item
      div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
        user-avatar(:url="$store.getters.currentUser().profile.photoUrl" :width="40" :height="40")
      div(v-if="!mini").col.full-height
        .row.fit.items-center.content-center
          span(:style=`{lineHeight: 1.1}`).text-white.text-bold {{$store.getters.currentUser().name}}
          small.text-white.full-width {{ '@'+$store.getters.currentUser().username }}
  //- body
  div(:style=`{overflowX: 'hidden'}`).col.full-width
    div(
      :style=`{
        borderRadius: '10px', overflow: 'hidden'
      }`
      ).column.full-width.q-pt-sm
        router-link(
          v-for="(p,pi) in pages" :key="p.id"
          v-if="p.id === 'trends' ? true : $store.getters.currentUser().profile.role !== 'GUEST'"
          :to="{name: p.id}"
          :class=`{
            'b-40': $route.path.split('/')[1] === p.id
          }`
          :style=`{
            height: $q.screen.width > 600 ? '55px' : '55px',
            borderRadius: '10px', overflow: 'hidden'
          }`
          ).row.full-width.items-center.menu-item
          div(:style=`{width: '60px'}`).row.full-height.items-center.content-center.justify-center
            q-icon(size="22px" :name="p.icon" :color="p.color || 'white'")
          span(
            v-if="!mini"
            :style=`{fontSize: '16px'}`).text-white {{ p.name }}
        //- refresh
        div(
          :style=`{height: '60px', borderRadius: '10px', overflow: 'hidden'}` @click="refresh()"
          ).row.full-width.items-center.content-center.menu-item.cursor-pointer
          div(:style=`{height: '50px', width: '60px'}`).row.items-center.content-center.justify-center
            q-btn(round dense flat icon="refresh" color="white" :loading="refreshLoading")
          span(
            v-if="!mini"
            :style=`{fontSize: '16px', userSelect: 'none', pointerEvents: 'none'}`).text-white {{$t('kalpaMenu_refresh', 'Обновить')}}
        //- logout
        div(
          v-if="$store.getters.currentUser().profile.role !== 'GUEST'"
          :style=`{height: '60px', borderRadius: '10px', overflow: 'hidden'}` @click="logout()"
          ).row.full-width.items-center.content-center.menu-item.cursor-pointer
          div(:style=`{height: '50px', width: '60px'}`).row.items-center.content-center.justify-center
            q-btn(round dense flat icon="power_off" color="white" :loading="logoutLoading")
          span(
            v-if="!mini"
            :style=`{fontSize: '16x', userSelect: 'none', pointerEvents: 'none'}`).text-white {{$t('kalpaMenu_logout', 'Выйти')}}
        //- login
        div(
          v-if="$store.getters.currentUser().profile.role === 'GUEST'"
          :style=`{height: '60px', borderRadius: '10px', overflow: 'hidden'}` @click="login()"
          ).row.full-width.items-center.content-center.menu-item.cursor-pointer
          div(:style=`{height: '50px', width: '60px'}`).row.items-center.content-center.justify-center
            q-btn(round dense flat icon="power" color="white" :loading="loginLoading")
          span(
            v-if="!mini"
            :style=`{fontSize: '16x', userSelect: 'none', pointerEvents: 'none'}`).text-white {{$t('kalpaMenu_login', 'Войти')}}
        //- create joint
        //- div(
          v-if="$store.getters.currentUser().profile.role !== 'GUEST'"
          ).row.full-width.items-center.content-center.justify-center
          q-btn(
            :to="'/workspace/joint/new'"
            flat color="green" no-caps icon="link" size="md"
            :align="mini ? 'center' : 'left'"
            :style=`{height: '60px', paddingLeft: '0px'}`).full-width.menu-item
            span(
              v-if="!mini"
              :style=`{fontSize: '16px'}`).text-bold.q-ml-md {{$t('Create joint', 'Создать связь')}}
        //- create node
        div(
          v-if="$store.getters.currentUser().profile.role !== 'GUEST'"
          ).row.full-width.items-center.content-center
          q-btn(
            :to="'/workspace/create'"
            flat color="green" no-caps icon="add" size="md"
            :align="mini ? 'center' : 'left'"
            :style=`{height: '60px', paddingLeft: '2px'}`).full-width.menu-item
            span(
              v-if="!mini"
              :style=`{fontSize: '16px'}`).text-bold.q-ml-md {{$t('Create node', 'Создать')}}
        //- version
        div(v-if="!mini").row.full-width.items-center.q-pa-md
          small(:style=`{userSelect: 'none', marginLeft: '6px'}`).text-grey-8 {{$t('kalpaMenu_version', 'Версия') + ': ' + $store.state.core.version + ' - ' + $store.state.core.buildDate}}
</template>

<script>
import { AuthApi } from 'src/api/auth'

export default {
  name: 'kalpaMenu',
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
        {id: 'feeds', name: 'Ленты', icon: 'view_week'},
        {id: 'trends', name: 'Новое', icon: 'explore'},
        {id: 'workspace', name: this.$t('pageWorkspace_title', 'Мастерская'), icon: 'school'},
        {id: 'notifications', name: this.$t('pageNotifications_title', 'Уведомления'), icon: 'notifications_none'},
        // {id: 'messages', name: 'Сообщения', icon: 'mail_outline'},
        {id: 'settings', name: this.$t('pageSettings_title', 'Настройки'), icon: 'tune'},
      ],
      refreshLoading: false,
      logoutLoading: false,
      loginLoading: false,
      loginButtonShow: true
    }
  },
  computed: {
  },
  methods: {
    async refresh () {
      this.$log('refresh')
      this.refreshLoading = true
      // await this.$wait(300)
      await this.$systemUtils.vibrate(200)
      await this.$systemUtils.reset()
      // await this.$systemUtils.openUrl()
      // await this.$systemUtils.openUrl('https://kalpagrama.com/', true)
      // await this.$systemUtils.hapticsImpact()
      this.refreshLoading = false
    },
    async logout () {
      this.$log('logout')
      if (!confirm('Really logout ?')) return
      this.logoutLoading = true
      await this.$wait(300)
      await AuthApi.logout()
      this.$log('AuthApi.logout() complete')
      await this.$router.replace('/auth')
      this.$log('this.$router.replace auth complete')
      this.logoutLoading = false
    },
    async login () {
      this.$log('login')
      this.loginLoading = true
      await this.$wait(300)
      await this.$router.push('/auth')
      this.loginLoading = false
    }
  },
}
</script>
