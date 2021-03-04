<template lang="pug">
.row.full-width.q-pa-sm
  //- header
  .row.full-width.q-px-sm.q-py-sm
    span.text-white.text-bold Действия
  //- body
  .row.full-width
    //- q-btn(
      @click="feedbackOpened = true"
      flat color="grey-6" no-caps
      :style=`{
        height: '50px',
      }`
      ).full-width.b-40.q-mb-sm
      span Обратная связь
    q-btn(
      @click="refresh()"
      flat color="grey-6" no-caps
      :style=`{
        height: '50px',
      }`
      ).full-width.b-40
      span Очистить кэш
    q-btn(
      @click="setDebugOutput()"
      flat color="grey-6" no-caps
      :style=`{
              height: '50px',
            }`
      ).full-width.b-40.q-my-md
      span(v-if="!$store.state.core.logRocket") сообщить об ошибке
      span(v-if="$store.state.core.logRocket").text-yellow закончить запись ошибки
    q-btn(
      @click="logout()"
      outline color="red" no-caps
      :style=`{
        height: '50px',
      }`
      ).full-width.q-my-md
      span Выйти
</template>

<script>
import { AuthApi } from 'src/api/auth'
import { initLogRocket, window } from 'src/system/log'
import { rxdb } from 'src/system/rxdb/index_browser'

export default {
  name: 'actions',
  data () {
    return {
      feedbackOpened: false,
    }
  },
  methods: {
    async logout () {
      await AuthApi.logout()
      await this.$router.replace('/auth')
    },
    async refresh () {
      this.$wait(300).then(async () => await this.$systemUtils.vibrate(150))
      await this.$systemUtils.reset()
    },
    async setDebugOutput () {
      this.$wait(300).then(async () => await this.$systemUtils.vibrate(150))
      if (!this.$store.state.core.logRocket){
        let description = prompt('Кратко опишите проблему')
        if (description && confirm('Теперь продемонстрируйте ошибку.\nМы запишем ваши действия и сможем понять в чем проблема\nПо окончанию - нажмите на кнопку "закончить запись ошибки"')) {
          this.$store.commit('core/stateSet', ['logRocket', true])
          this.$store.commit('core/stateSet', ['logDbgFilter', 'any'])
          this.$store.commit('core/stateSet', ['logDbgModulesBlackList', []])
          this.$store.commit('core/stateSet', ['logFormat', {time: true, moduleName: true, funcName: true}])
          await initLogRocket(this.$rxdb.getCurrentUser().oid, this.$rxdb.getCurrentUser().username, this.$rxdb.getCurrentUser().profile.email, description, this.$store)
        }
      } else {
        this.$store.commit('core/stateSet', ['logRocket', false])
        if (this.$store.state.core.logRocketSessionUrl) {
          let result = await navigator.permissions.query({name: 'clipboard-write'})
          if (result.state === 'granted' || result.state === 'prompt') {
            await navigator.clipboard.writeText(this.$store.state.core.logRocketSessionUrl)
            alert('Ссылка на проблему скопирована в буфер обмена.\n отправьте ее в телеграм канал поддержки пользователей')
            window.location.reload() // у логрокет нет возможности прервать сессию. приходится перезагружать страницу
          }
        }
      }
    },
  }
}
</script>
