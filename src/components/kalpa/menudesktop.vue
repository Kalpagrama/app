<template lang="pug">
div(
  :style=`{position: 'fixed', zIndex: 2000, minHeight: '100vh', width: '100%'}`).row.bg-grey-8
  div(:style=`{position: 'relative', overflow: 'hidden'}`).column.fit
    //- home, kalpagramma
    div(:style=`{height: '60px'}`).row.full-width.cursor-pointer
      div(@click="$router.push('/')").col.row.items-center
        //- mini box: width kalpagramma logo
        div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
          kalpa-spinner(:width="40" :height="40").cursor-pointer
        //- home page name, or kalpagramma name?
        div(v-if="!mini").col.full-height
          .row.fit.items-center
            span.text-bold.text-white {{ $t('Home') }}
            //- span.text-white.text-bold Кальпаграмма 1.0.1 // зачем сломали номер версии? поставил обратно...
      //- div(@click="$router.push('/settings')" :style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
      //-   q-btn(round flat icon="settings" color="white")
    //- user
    router-link(tp="/account" :style=`{height: '60px'}` @click="$router.push(`/user/` + $store.getters.currentUser.oid).catch(e => e)").row.full-width
      div(:style=`{width: '60px', height: '60px'}`).row.items-center.content-center.justify-center
        kalpa-avatar(:url="$store.getters.currentUser.profile.thumbUrl" :width="40" :height="40")
      //- user name, max 50?
      div(v-if="!mini").col.full-height
        .row.fit.items-center
          //- span.text-bold.text-white.cursor-pointer {{ $t($store.getters.currentUser.name) | cut(50) }}
          span.text-bold.text-white.cursor-pointer Account
    //- pages
    .col.full-width.scroll
      .row.full-width.items-start.content-start
        div(
          v-for="(p, pi) in $store.state.workspace.pages" :key="p.id" @click="pageClick(p, pi)"
          :style=`{height: '60px'}`
          ).row.full-width.cursor-pointer
          //- page mini box, icon
          div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
            q-btn(round flat :icon="p.icon" :color="$route.name === p.id ? 'green' : 'white'")
          //- page info, name
          div(v-if="!mini").col.full-height
            .row.fit.items-center
              span.text-white {{ p.name }}
        //- fullscreen
        div(:style=`{}`).row.full-width.justify-start
          div(
            :style=`{width: '60px', height: '60px'}`
            ).row.full-height.items-center.content-center.justify-center
            q-btn(
              round flat  @click="$q.fullscreen.toggle()"
              :color="$q.fullscreen.isActive ? 'green' : 'white'"
              :icon="$q.fullscreen.isActive ? 'fullscreen_exit' : 'fullscreen'")
        //- cache clear
        div(:style=`{}`).row.full-width.justify-start
          div(:style=`{width: '60px', height: '60px'}`).row.items-center.content-center.justify-center
            q-btn(round flat icon="refresh" color="white" :loading="cacheClearing" @click="cacheClear()")
        //- debug
        div(:style=`{}`).row.full-width.justify-start
          div(:style=`{width: '60px', height: '60px'}`).row.items-center.content-center.justify-center
            q-btn(round flat icon="bug_report" :color="$store.state.ui.debug ? 'green' : 'white'" @click="$store.commit('ui/stateSet', ['debug', !$store.state.ui.debug])")
        //- logout
        div(:style=`{}`).row.full-width.justify-start
          div(:style=`{width: '60px', height: '60px'}`).row.items-center.content-center.justify-center
            q-btn(round flat icon="power_off" color="white" :loading="loggingOut" @click="logout()")
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
      //- toggle
      div(v-if="false && $q.screen.gt.xs").row.full-width.justify-end
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
  props: {
    mini: {
      type: Boolean,
      default () {
        return true
      }
    }
  },
  data () {
    return {
      menuShow: true,
      width: 60,
      userAvatarErrored: false,
      cacheClearing: false,
      loggingOut: false
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
  methods: {
    async logout () {
      try {
        this.$log('logout start')
        this.loggingOut = true
        await this.$wait(800)
        if (!confirm('Really logout?')) throw new Error('Changed your mind')
        let res = await this.$store.dispatch('auth/logout')
        this.$log('logout done', res)
        this.loggingOut = false
      }
      catch (e) {
        this.loggingOut = false
        this.$log('logout error', e)
      }
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
          await this.$router.push('/' + p.id).catch(e => e)
      }
      if (this.$q.screen.xs) this.width = 0
      else this.width = 60
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
    async cacheClear () {
      this.$log('cacheClear')
      this.cacheClearing = true
      await this.$wait(500)
      this.$store.dispatch('cache/clear')
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
