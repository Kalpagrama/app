<style lang="sass">
input:-webkit-autofill,
textarea:-webkit-autofill,
select:-webkit-autofill
  -webkit-box-shadow: 0 0 0 1000px rgb(70,70,70) inset !important
  -webkit-text-fill-color: white !important
</style>

<template lang="pug">
div(
  :style=`{
    position: 'relative',
  }`
  ).row.full-width.items-start.content-start
  //- header
  .row.full-width.q-pb-lg.q-pt-sm
    span(:style=`{fontSize: '22px',}`).text-white.text-bold {{$t('Welcome to kalpagrama')}}
  //- email
  q-input(
    v-model="email"
    borderless dark
    type="email" inputmode="email"
    autocomplete="username" name="username"
    autocorrect="off" autocapitalize="on"
    :placeholder="$t('Enter your email')"
    :input-style=`{
      padding: '16px',
      fontSize: '22px',
      fontWeight: 'bold',
      textAlign: 'center',
      color: 'white',
      background: 'rgb(70,70,70)',
      borderRadius: '10px',
    }`
    @keyup.enter="emailSend()"
    ).full-width
  //- email send btn
  div(
    v-if="!emailSent"
    ).row.full-width.q-pt-lg
    q-btn(
      outline no-caps color="green"
      :disable="!emailIsValid"
      :loading="emailSending"
      :style=`{
        height: '60px',
      }`
      @click="emailSend()"
      ).full-width
      span(:style=`{fontSize: '20px',}`).text-bold {{$t('Next')}}
  //- email sent
  div(
    v-if="emailSent").row.full-width.q-pt-lg
    //- header, description
    .row.full-width.justify-start.q-py-xs.q-px-sm
      span(v-if="needConfirm").text-white {{$t('We sent you one time code, enter it')}}
      span(v-if="hasPermanentPassword").text-white {{$t('Enter your permanent password')}}
    //- password input
    q-input(
      v-model="password"
      borderless dark
      placeholder="Enter password"
      :type="passwordShow ? 'text' : 'password'"
      :autofocus="false"
      :disable="false"
      :input-style=`{
        padding: '16px',
        fontSize: '22px',
        fontWeight: 'bold',
        textAlign: 'center',
        color: 'white',
        background: 'rgb(70,70,70)',
        borderRadius: '10px',
      }`
      @keyup.enter="passwordSend()"
      ).full-width
    //- password helpers
    .row.full-width.q-px-xs.q-pt-xs
      q-btn(flat dense no-caps color="white") {{'Forgot password?'}}
      .col
      q-btn(
        @click="passwordShow = !passwordShow"
        flat dense no-caps color="white") {{ passwordShow ? 'Hide password' : 'Show password' }}
    //- password send
    q-btn(
      v-if="password.length >= 4"
      no-caps color="green"
      :loading="passwordSending"
      :disable="password.length < 5"
      :style=`{
        height: '60px',
      }`
      @click="passwordSend()"
      ).full-width.q-mt-md
      span(:style=`{fontSize: '22px'}`).text-bold {{ $t('Login') }}
    //- reset
    .row.full-width.q-pa-xs
      q-btn(
        v-if="emailSent"
        flat dense no-caps color="red"
        :style=`{
        }`
        @click="reset()")
        span(:style=`{fontSize: '14px'}`) {{ $t('Reset form') }}
</template>

<script>
import { AuthApi } from 'src/api/auth'

export default {
  name: 'authFlow',
  props: ['onSuccess'],
  data () {
    return {
      email: '',
      emailSending: false,
      emailSent: false,
      hasPermanentPassword: false,
      needConfirm: false,
      needInvite: false,
      password: '',
      passwordShow: false,
      passwordSending: false,
      loginType: null,
    }
  },
  computed: {
    emailIsValid () {
      const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      return re.test(String(this.email).toLowerCase())
    }
  },
  methods: {
    reset () {
      this.$log('reset')
      this.email = ''
      this.emailSending = false
      this.emailSent = false
      this.hasPermanentPassword = false
      this.needConfirm = false
      this.needInvite = false
      this.password = ''
      this.passwordShow = false
      this.passwordSending = false
      this.loginType = null
    },
    async emailSend () {
      try {
        this.$log('emailSend start')
        this.emailSending = true
        // await this.$wait(2000)
        let {userExist, userId, needInvite, needConfirm, loginType, hasPermanentPassword} = await AuthApi.userIdentify(this.email)
        // stuff
        this.loginType = loginType
        this.needConfirm = needConfirm
        this.needInvite = needInvite
        this.hasPermanentPassword = hasPermanentPassword
        // done
        this.$log('emailSend done')
        this.emailSending = false
        this.emailSent = true
      }
      catch (e) {
        this.$log('emailSend error', e)
        this.emailSending = false
      }
    },
    async passwordSend () {
      try {
        this.$log('passwordSend start', this.password)
        this.passwordSending = true
        if (this.password.length === 0) throw new Error('Empty password!')
        // this.$tween.to(this.$refs['wrapper-mobile'], 5, {height: 2000})
        let {result, failReason, oid} = await AuthApi.userAuthenticate(this.password, null)
        if (result === false) throw new Error(`Error: ${failReason}`)
        await this.$router.replace('/')
        this.$log('passwordSend done')
        this.passwordSending = false
      }
      catch (e) {
        this.$log('passwordSend error', e)
        this.$q.notify({type: 'negative', position: 'top', message: e.toString()})
        this.passwordSending = false
      }
    },
  },
}
</script>
