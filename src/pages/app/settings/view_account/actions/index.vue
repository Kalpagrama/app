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
      @click="showKalpaWelcome()"
      flat color="grey-6" no-caps
      :style=`{
        height: '50px',
      }`
      ).full-width.b-40.q-mb-md
      span Показать обучение
    q-btn(
      @click="refresh()"
      flat color="grey-6" no-caps
      :style=`{
        height: '50px',
      }`
      ).full-width.b-40.q-mb-md
      span Очистить кэш
    q-btn(
      @click="logout()"
      outline color="red" no-caps
      :style=`{
        height: '50px',
      }`
      ).full-width.q-myb-md
      span Выйти
</template>

<script>
import { AuthApi } from 'src/api/auth'

export default {
  name: 'actions',
  data () {
    return {
      feedbackOpened: false,
    }
  },
  methods: {
    showKalpaWelcome () {
      this.$log('showKalpaWelcome')
      this.$store.commit('ui/stateSet', ['kalpaWelcome', {mode: 'slides-only'}])
    },
    async logout () {
      await AuthApi.logout()
      await this.$router.replace('/auth')
    },
    async refresh () {
      await this.$systemUtils.vibrate(200)
      await this.$systemUtils.reset()
    },
  }
}
</script>
