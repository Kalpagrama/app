<template lang="pug">
div(
  :style=`{position: 'relative', minHeight: '100vh', width: width+'px'}`).row
  //- //- toggle menu
  //- div(
  //-   v-if="false"
  //-   :style=`{
  //-     position: 'absolute', top: 0, right: '-72px', zIndex: 1000,
  //-     width: '72px', height: '72px'}`
  //-   ).row.items-center.justify-center
  //-   q-btn(
  //-     flat color="green" icon="menu" @click="menuShow = !menuShow"
  //-     :style=`{width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255, 0.3)'}`)
  //- dialogs
  //- q-dialog(ref="inviteDialog" :maximized="true" transition-show="slide-left" transition-hide="slide-right")
  //-   k-invite(@hide="$refs.inviteDialog.hide()")
  //- k-dialog-bottom(ref="logoutDialog" mode="actions" :options="logoutDialogOptions" @action="logoutDialogAction")
  //- borderRight: '1px solid #4caf50'
  div(:style=`{position: 'relative', overflow: 'hidden'}`).column.fit
    //- home, kalpagramma
    div(:style=`{height: '60px'}`).row.full-width.cursor-pointer
      div(@click="$router.push('/')").col.row.items-center
        //- mini box: width kalpagramma logo
        div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
          k-logo(:width="40" :height="40")
        //- home page name, or kalpagramma name?
        div(v-if="width > 60").col.full-height
          .row.fit.items-center
            span.text-bold.text-white {{ $t('Home') }}
            //- span.text-white.text-bold Кальпаграмма 1.0.1 // зачем сломали номер версии? поставил обратно...
      //- div(@click="$router.push('/settings')" :style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
      //-   q-btn(round flat icon="settings" color="white")
    //- user
    div(:style=`{height: '60px'}` @click="$router.push(`/user/` + $store.getters.currentUser.oid)").row.full-width
      //- mini box with user avatar
      div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
        img(
          v-show="!userAvatarErrored"
          @error="userAvatarError"
          :src="$store.getters.currentUser.profile.thumbUrl"
          :style=`{width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden'}`)
        div(
          v-if="userAvatarErrored"
          :style=`{width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden'}`
          ).row.bg-grey-3
      //- user name, max 50?
      div(v-if="width > 60").col.full-height
        .row.fit.items-center
          span.text-bold.text-white.cursor-pointer {{ $t($store.getters.currentUser.name) | cut(50) }}
    //- pages
    .col.full-width.scroll
      .row.full-width.items-start.content-start
        div(
          v-for="(p, pi) in pages" :key="p.id" @click="pageClick(p, pi)"
          :style=`{height: '60px'}`
          ).row.full-width.cursor-pointer
          //- page mini box, icon
          div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
            q-btn(round flat :icon="p.icon" :color="$route.name === p.id ? 'green' : 'white'")
          //- page info, name
          div(v-if="width > 60").col.full-height
            .row.fit.items-center
              span.text-white {{ $t(p.name) }}
      //- invite
      //- div(:class="{'q-px-md': !mini}").row.full-width.items-center.justify-center.q-my-sm
      //-   q-btn(
      //-     :round="mini" push color="accent" no-caps icon="person_add" @click="$router.push('/invite')"
      //-     :style=`mini ? {} : {height: '60px', borderRadius: '10px'}`).full-width
      //-     span(v-if="width === 230").text-bold.q-ml-md {{ $t('Invite friend') }}
      //- update
      //- div(v-if="!this.$store.state.core.installPrompt || true" :class="{'q-px-md': !mini}").row.full-width.items-center.justify-center.q-my-sm
      //-   q-btn(
      //-     :round="mini" outline color="accent" no-caps
      //-     :icon="this.$store.state.core.newVersionAvailable ? 'system_update' : 'cloud_download'"
      //-     @click="update"
      //-     :style=`mini ? {} : {height: '50px', borderRadius: '10px'}`).full-width
      //-     span(v-if="width === 230" :style=`{whiteSpace: 'nowrap'}`).text-bold.q-ml-md {{$store.state.core.newVersionAvailable ? $t('Update app!') : $t('Check for updates') }}
      //- install app
      //- div(v-if="this.$store.state.core.installPrompt" :class="{'q-px-md': !mini}").row.full-width.items-center.justify-center.q-my-sm
      //-   q-btn(
      //-     :round="mini" push color="accent" no-caps icon="save_alt" @click="install"
      //-     :style=`mini ? {} : {height: '50px', borderRadius: '10px'}`)
      //-     span(v-if="width === 230" :style=`{whiteSpace: 'nowrap'}`).text-bold.q-ml-md {{ $t('install_app') }}
      //- refresh
      //- div(:style=`{marginBottom: '70px'}`).row.full-width.q-px-md
      //-   q-btn(
      //-     outline color="accent" no-caps @click="appRefresh()"
      //-     :style=`{borderRadius: '10px', whiteSpace: 'nowrap'}` ).full-width {{$t('Refresh')}}
      //- toggle
      div(:style=`{}`).row.full-width.justify-end
        div(:style=`{width: '60px', height: '60px'}`).row.items-center.justify-center
          q-btn(
            round flat color="green" @click="menuShow = !menuShow"
            :icon="width > 60 ? 'keyboard_arrow_left' : 'keyboard_arrow_right'")
</template>

<script>
import { checkUpdate, update } from 'src/system/service_worker'
// img:statics/icons/anvil.svg
export default {
  name: 'kalpaMenuDesktop',
  props: [],
  data () {
    return {
      menuShow: false,
      width: 60,
      pages: [
        { id: 'trends', name: 'Trends', icon: 'whatshot' },
        { id: 'workspace', name: 'Workspace', icon: 'school' },
        { id: 'settings', name: 'Settings', icon: 'settings' }
      ],
      userAvatarErrored: false
    }
  },
  computed: {
    logoutDialogOptions () {
      return {
        header: false,
        headerName: '',
        actions: {
          stay: { name: 'Отмена' }
        },
        confirm: true,
        confirmName: 'Выйти'
      }
    }
  },
  watch: {
    menuShow: {
      immediate: true,
      handler (to, from) {
        this.$log('menuShow CHANGED', to)
        this.$tween.to(this, 0.5, {width: to ? 260 : 60})
      }
    }
  },
  methods: {
    async logout (mytoken) {
      // this.tokenString = token
      this.$log('logout start')
      let res = await this.$store.dispatch('auth/logout', mytoken)
      this.$log('logout done', res)
    },
    userAvatarError (e) {
      this.$log('userAvatarError', e)
      this.userAvatarErrored = true
    },
    async logoutDialogAction (action) {
      this.$logD('logoutDialogAction', action)
      switch (action) {
        case 'confirm': {
          await this.logout(localStorage.getItem('ktoken'))
        }
      }
    },
    async pageClick (p, pi) {
      this.$log('pageClick', p, pi)
      switch (p.path) {
        case '/logout':
          this.$logD('LOGOUT')
          this.$refs.logoutDialog.show()
          break
        default:
          await this.$router.push('/' + p.id)
      }
    },
    async update () {
      if (this.$store.state.core.newVersionAvailable) {
        this.$store.commit('core/stateSet', ['newVersionAvailable', false])
        this.$logD('updating ...')
        await update()
      } else {
        this.$logD('checkUpdate...')
        await checkUpdate()
      }
    },
    async install () {
      let installPrompt = this.$store.state.core.installPrompt
      this.$logD('installPrompt=', installPrompt)
      if (installPrompt) installPrompt.prompt()
    },
    appRefresh () {
      this.$log('appRefresh')
      window.location.reload(true)
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
