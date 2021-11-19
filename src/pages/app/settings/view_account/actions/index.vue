<template lang="pug">
.row.full-width.q-pa-sm
  //- header
  .row.full-width.q-px-sm.q-py-sm
    span.text-white.text-bold {{$t('Actions')}}
  //- body
  .row.full-width
    //- q-btn(
    //  @click="feedbackOpened = true"
    //  flat color="grey-6" no-caps
    //  :style=`{
    //    height: '50px',
    //  }`
    //  ).full-width.b-40.q-mb-sm
    //  span {{$t('Feedback')}}
    //- show main tutorial
    q-btn(
      @click="showKalpaTutorial()"
      flat color="grey-6" no-caps
      :style=`{
        height: '50px',
      }`
      ).full-width.b-40.q-mb-sm
      span {{$t('Show tutorial')}}
    //- cache clear
    q-btn(
      @click="refresh()"
      flat color="grey-6" no-caps
      :loading="refreshing"
      :style=`{
        height: '50px',
      }`
      ).full-width.b-40.q-mb-sm
      span {{$t('Clear cache')}}
    //- toggle debug
    q-btn(
      v-if="$store.getters.currentUser.profile.role.in('MODERATOR', 'ADMIN')"
      @click="$store.commit('ui/stateSet', ['useDebug', !$store.state.ui.useDebug])"
      flat  no-caps
      :color="$store.state.ui.useDebug ? 'red' : 'grey-6'"
      :style=`{
        height: '50px',
      }`
      ).full-width.b-40.q-mb-sm
      span(
        :class=`{
        }`
        ) {{$store.state.ui.useDebug ? $t('Disable debug') : $t('Enable debug') }}
    //- show report?
    //- q-btn(
    //  @click="setDebugOutput()"
    //  flat color="grey-6" no-caps
    //  :style=`{
    //    height: '50px',
    //  }`
    //  ).full-width.b-40.q-mb-md
    //  span(v-if="!$store.state.core.logRocket") {{$t('Report an error')}}
    //  span(v-if="$store.state.core.logRocket").text-yellow {{$t('Stop error logging')}}
    ////- chat
    //q-btn(
    //  @click="toggleChat()"
    //  outline color="green" no-caps
    //  :style=`{
    //    height: '50px',
    //  }`).full-width.q-mb-md
    //  span {{$t('Chat with us')}}
    //- logout
    q-btn(
      @click="logout()"
      outline color="red" no-caps
      :loading="loggingOut"
      :style=`{
        height: '50px',
      }`
      ).full-width.q-myb-md
      span {{$t('Logout')}}
</template>

<script>
import { AuthApi } from 'src/api/auth'
import { initLogRocket, LogLevelEnum, getLogFunctions, LogSystemModulesEnum, performance } from 'src/boot/log'
import { rxdb } from 'src/system/rxdb'
import { ObjectApi } from 'src/api/object'
import { ObjectCreateApi } from 'src/api/object_create'
import {UserRoleEnum} from '../../../../../api/user';

export default {
  name: 'accountActions',
  data () {
    return {
      feedbackOpened: false,
      loggingOut: false,
      refreshing: false,
    }
  },
  methods: {
    // async toggleChat () {
    //   this.$log('toggleChat')
    //   // window.Chatra()
    //   // if (!window.Chatra) return
    //   // window.ChatraSetup = {
    //   //     disabledOnMobile: true,
    //   //     // startHidden: false
    //   // }
    //   // await this.$wait(500)
    //   let el = document.getElementById('chatra')
    //   el.style.display = 'block'
    //   window.Chatra('openChat', true)
    // },
    showKalpaTutorial () {
      this.$log('showKalpaTutorial TODO!')
    },
    async logout () {
      this.$log('logout')
      this.$ym('USER_LOGOUT')
      this.loggingOut = true
      await AuthApi.logout()
      await this.$router.replace('/')
    },
    async refresh () {
      // let comment = await ObjectApi.commentCreate('100958595302072330', 'Комммент')
      // this.$logW('comment=', comment)
      this.$log('refresh')
      this.refreshing = true
      this.$wait(300).then(async () => await this.$systemUtils.vibrate(150))
      await this.$systemUtils.reset()
      this.refreshing = false
    },
    async setDebugOutput () {
      this.$wait(300).then(async () => await this.$systemUtils.vibrate(150))
      if (!this.$store.state.core.logRocket){
        let description = prompt('Кратко опишите проблему')
        if (description && confirm('Теперь продемонстрируйте ошибку.\nМы запишем ваши действия и сможем понять в чем проблема\nПо окончанию - нажмите на кнопку "закончить запись ошибки"')) {
          this.$store.commit('core/stateSet', ['logRocket', true])
          this.$store.commit('core/stateSet', ['logDbgFilter', 'any'])
          this.$store.commit('core/stateSet', ['logModulesFilter', {}])
          this.$store.commit('core/stateSet', ['logFormat', {time: true, moduleName: true, funcName: true}])
          this.$store.commit('core/stateSet', ['logLevel', LogLevelEnum.DEBUG])
          await initLogRocket(this.$rxdb.getCurrentUser().oid, this.$rxdb.getCurrentUser().username, this.$rxdb.getCurrentUser().profile.email, description, this.$store)
        }
      } else {
        this.$store.commit('core/stateSet', ['logRocket', false])
        if (this.$store.state.core.logRocketSessionUrl) {
          let result = await navigator.permissions.query({name: 'clipboard-write'})
          if (result.state === 'granted' || result.state === 'prompt') {
            await navigator.clipboard.writeText(this.$store.state.core.logRocketSessionUrl)
            alert('Ссылка на проблему скопирована в буфер обмена.\n отправьте ее в телеграм канал поддержки пользователей')
            this.$logW('before reload')
            window.location.reload() // у логрокет нет возможности прервать сессию. приходится перезагружать страницу
          }
        }
      }
    },
  },
  mounted () {
    this.$log('mounted')
  },
  beforeUnmount () {
    this.$log('beforeDestroy')
    // window.ChatraSetup = {
    //     disabledOnMobile: true
    // }
  }
}
</script>
