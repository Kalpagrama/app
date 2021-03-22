<template lang="pug">
div.row.full-width.items-start.content-start.justify-center
  div().row.full-width.justify-center
    kalpa-logo(
      :width="200"
      :height="200").q-mb-md
    q-input(
      v-model="email"
      borderless dark
      placeholder="Введите почту"
      type="email" autocomplete="username" name="username" required
      :input-style=`{
        fontSize: '20px',
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        borderRadius: '10px',
        background: 'rgb(40,40,40)',
        minHeight: '60px',
      }`
      @keyup.enter="emailSend()"
      ).full-width
    //- email send
    div(
      v-if="!emailSended"
      ).row.full-width.justify-center
      q-btn(
        @click="emailSend()"
        color="green" no-caps
        size="lg"
        :loading="emailSending"
        :style=`{
          //- maxWidth: '260px',
          height: '60px',
        }`
        ).full-width.q-my-lg
        span.text-white.text-bold Далее
      .row.full-width.justify-center.q-py-sm
        kalpa-docs(
          title="Продолжая, вы соглашаетесь с:  "
          :styles=`{
            maxWidth: '200px',
          }`)
    //- email sended hasPermanentPassword
    div(
      v-if="emailSended && hasPermanentPassword"
      :style=`{}`
      ).row.full-width.q-mt-sm
      div(:style=`{}`).row.full-width
      q-input(
        v-model="password"
        borderless dark
        type="password" name="password" autocomplete="current-password" required
        :placeholder="'Enter password'"
        :input-style=`{
          fontSize: '20px',
          fontWeight: 'bold',
          color: 'white',
          textAlign: 'center',
          borderRadius: '10px',
          background: 'rgb(40,40,40)',
          minHeight: '60px',
        }`
        :style=`{}`
        @keyup.enter="passwordSend()"
        ).full-width
      .row.full-width.q-py-md
        q-btn(
          @click="passwordSend()"
          color="green" no-caps
          :loading="passwordSending"
          :style=`{
            height: '60px',
          }`
          ).full-width
          span.text-white.text-bold Войти
    //- email sended, waiting for link to be clicked
    div(
      v-if="emailSended && !hasPermanentPassword"
      :style=`{}`
      ).row.full-width
      div(:style=`{textAlign: 'center'}`).row.full-width.justify-center.q-pa-lg
        span.text-white Мы отправили вам на почту ссылку, нажмите ее
      .row.full-width.justify-center.q-py-lg
        q-spinner(size="50px" color="green")
      .row.full-width.justify-center
        q-btn(
          @click="emailSended = false, emailSending = false"
          flat dense color="grey-6" no-caps
          ) Отмена
</template>

<script>
import { AuthApi } from 'src/api/auth'
import kalpaDocs from 'components/kalpa_docs/index.vue'

export default {
  name: 'pageAuth_signIn',
  components: {
    kalpaDocs,
  },
  data () {
    return {
      email: '',
      emailSending: false,
      emailSended: false,
      hasPermanentPassword: false,
      password: '',
      passwordSending: false,
    }
  },
  methods: {
    async emailSend () {
      try {
        this.$log('emailSend start')
        this.emailSending = true
        // check email
        if (this.email.length === 0) throw new Error('Login is empty!')
        let {userExist, userId, needInvite, needConfirm, loginType, hasPermanentPassword} = await AuthApi.userIdentify(this.email)
        // console.log({userExist, userId, needInvite, needConfirm, loginType, hasPermanentPassword})
        // do stuff
        if (hasPermanentPassword) {
          this.hasPermanentPassword = hasPermanentPassword
        }
        else {
          // waiting for the shit
        }
        this.emailSending = false
        this.emailSended = true
        // await this.$wait(500)
        // send email
      }
      catch (e) {
        this.$log('emailSend error', e)
        this.$q.notify({type: 'negative', position: 'top', message: e.toString()})
        this.emailSending = false
      }
    },
    async passwordSend () {
      try {
        this.$log('passwordSend start')
        this.passwordSending = true
        if (this.password.length === 0) throw new Error('Code is empty!')
        let {result, failReason, oid} = await AuthApi.userAuthenticate(this.password, null)
        if (result === false) throw new Error(`Error: ${failReason}`)
        this.$log('passwordSend done')
        this.passwordSending = false
        // TODO: first time login ?
        await this.$router.replace('/')
      }
      catch (e) {
        this.$log('passwordSend error', e)
        this.$q.notify({type: 'negative', position: 'top', message: e.toString()})
        this.passwordSending = false
      }
      this.$log('passwordSend start')
    },
  }
}
</script>
