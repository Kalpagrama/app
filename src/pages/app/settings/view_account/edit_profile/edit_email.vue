<template lang="pug">
.row.full-width
  //- .row.full-width
    span.text-bold.text-white Почта и пароль
  .row.full-width.items-center.content-center.q-px-md.q-py-sm
    .row.full-width.q-px-xs
      span(
        :style=`{
          fontSize: '20px',
        }`).text-white.text-bold {{ email || 'user@mail.com' }}
    //- .row.full-width
      q-btn(
        @click="editing = true"
        flat dense color="grey-6" no-caps size="sm") Изменить почту
  .row.full-width
    //- change or create password call to action btns
    div(v-if="!passwordChanging && !passwordCreating").row.full-width.q-px-md
      q-btn(
        v-if="currentUser.settings.hasPermanentPassword"
        @click="passwordChanging = true, passwordCreating = true"
        flat dense color="grey-6" no-caps size="sm") Изменить пароль
      q-btn(
        v-if="!currentUser.settings.hasPermanentPassword"
        @click="passwordCreating = true"
        flat dense color="grey-6" no-caps size="sm") Задать постоянный пароль
    //- change password
    div(v-if="passwordChanging").row.full-width
      q-input(
        v-model="passwordCurrent"
        borderless dark color="white"
        placeholder="Текущий пароль"
        type="password" autocomplete="new-password"
        :input-style=`{
          background: 'rgb(45,45,45)',
          borderRadius: '10px',
          padding: '12px',
        }`
        ).full-width.q-mb-sm
    //- create password
    div(v-if="passwordCreating").row.full-width
      q-input(
        v-model="passwordNew"
        borderless dark color="white"
        placeholder="Новый пароль"
        type="password" autocomplete="new-password"
        :input-style=`{
          background: 'rgb(45,45,45)',
          borderRadius: '10px',
          padding: '12px',
        }`
        ).full-width.q-mb-sm
      q-input(
        v-model="passwordNewConfirm"
        borderless dark color="white"
        placeholder="Подтвердите пароль"
        type="password" autocomplete="new-password"
        :input-style=`{
          background: 'rgb(45,45,45)',
          borderRadius: '10px',
          padding: '12px',
        }`
        @keyup.enter="passwordNewSet()"
        ).full-width.q-mb-sm
      //- confirm and cancel btns
      .row.full-width.justify-between.q-mb-sm
        q-btn(
          @click="clear()"
          flat color="grey-8" no-caps)
          span Отмена
        q-btn(
          @click="passwordNewSet()"
          flat color="green" no-caps
          :loading="passwordNewSetLoading"
          ).col.q-ml-sm
          span Отправить
</template>

<script>
import { AuthApi } from 'src/api/auth'

export default {
  name: 'editEmail',
  props: ['currentUser'],
  data () {
    return {
      editing: true,
      passwordChanging: false,
      passwordCreating: false,
      passwordCurrent: '',
      passwordCurrentCheckLoading: false,
      passwordNew: '',
      passwordNewConfirm: '',
      passwordNewSetLoading: false,
    }
  },
  computed: {
    email () {
      return this.$store.getters.currentUser().profile.email
    }
  },
  methods: {
    async passwordNewSet () {
      try {
        this.$log('passwordNewSet start')
        this.passwordNewSetLoading = true
        if (this.passwordNew.length === 0) {
          throw new Error('Пустой пароль !')
        }
        if (this.passwordNew !== this.passwordNewConfirm) {
          throw new Error('Пароли не совпадают!')
        }
        // do stuff
        let res = await AuthApi.setPermanentPassword(this.passwordCurrent, this.passwordNew)
        if (res === true) {
          this.clear()
          this.$q.notify({type: 'positive', position: 'top', message: 'Пароль установлен!'})
        }
        this.$log('passwordNewSet res', res)
        this.$log('passwordNewSet done')
        this.passwordNewSetLoading = false
      }
      catch (e) {
        this.$log('passwordNewSet error', e)
        this.passwordNewSetLoading = false
        this.$q.notify({type: 'negative', position: 'top', message: e.toString()})
      }
    },
    clear () {
      this.$log('clear')
      this.passwordChanging = false
      this.passwordCreating = false
      this.passwordCurrent = ''
      this.passwordNew = ''
      this.passwordNewConfirm = ''
    }
  }
}
</script>
