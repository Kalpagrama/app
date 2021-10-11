<style lang="sass">
input:-webkit-autofill,
textarea:-webkit-autofill,
select:-webkit-autofill
  -webkit-box-shadow: 0 0 0 1000px white inset !important
  -webkit-text-fill-color: black !important
</style>

<template lang="pug">
div(
  :style=`{
    position: 'relative',
    marginTop: $q.screen.width > $store.state.ui.pageMinWidthDesktop ? '70px' : '0px'
  }`
  ).row.full-width.items-start.content-start.q-mb-xl.justify-start
  //- header
  .row.full-width.wrap
    span(:style=`{fontSize: '20px',}`).text-white.text-bold.full-width {{$t('Welcome')}}
    span(v-if="!emailSent" :style=`{fontSize: '12px',}`).text-white.text-bold {{$t('Для входа или регистрации введите вашу почту')}}
  //- email
  div(v-if="!emailSent").row.full-width
    .row.full-width.justify-start.q-py-xs.q-px-sm
      //span(:style=`{opacity:email? 1:0}`).text-white {{$t('Enter your email')}}
    q-input(
    v-model="email"
    borderless dark
    type="email" inputmode="email"
    autocomplete="username" name="username"
    autocorrect="off" autocapitalize="on"
    :placeholder="$t('Enter your email')"
    :autofocus="true"
    :disable="emailEnterDisable"
    :input-style=`{
      padding: '16px',
      fontSize: '18px',
      fontWeight: 'bold',
      textAlign: 'center',
      color: 'white',
      background: 'rgba(0,0,0, 0.2)',
      borderRadius: '10px',
      // border: '2px solid rgba(90,90,90,0.6)',
    }`
    @keyup.enter="emailSend()"
    ).full-width
  //- email send btn
  div(
    v-if="!emailSent"
    ).row.full-width.q-pt-lg
    q-btn(
      outline no-caps color="green"
      :label="$t('Next')"
      :disable="!emailIsValid"
      :loading="emailSending"
      size="lg"
      @click="emailSend()"
      ).full-width.text-bold
      //span(:style=`{fontSize: '18px',}`).text-bold {{$t('Next')}}
  //- email sent
  div(
    v-if="emailSent").row.full-width
    //- header, description
    .row.full-width.justify-start.q-py-xs.q-px-sm
      span(v-if="needConfirm" :style=`{fontSize: '12px',}`).text-white.text-bold {{$t('We sent you a one-time code by email, enter it')}}
      span(v-if="hasPermanentPassword").text-white {{$t('Enter your permanent password')}}
    //- password input
    q-input(
      v-model="password"
      borderless dark
      :placeholder="$t('Enter password', 'Введите пароль')"
      :type="passwordShow ? 'text' : 'password'"
      :inputmode="needConfirm ? 'numeric' : 'text'"
      :autofocus="true"
      :disable="false"
      :input-style=`{
        padding: '16px',
        fontSize: '18px',
        fontWeight: 'bold',
        textAlign: 'center',
        color: 'white',
        //- background: 'rgb(70,70,70)',
        //- borderRadius: '10px',
        //- border: '2px solid rgb(50,50,50)',
        background: 'rgba(0,0,0, 0.2)',
        borderRadius: '10px',
        // border: '2px solid rgba(90,90,90,0.6)',
      }`
      @keyup.enter="passwordSend()"
      ).full-width
      //- password helpers
      div(:style=`{position: 'absolute'}`).row.fit.justify-end.content-center.items-center
        q-icon(
          :name="passwordShow ? 'visibility_off' : 'visibility'"
          class="cursor-pointer"
          @click="passwordShow = !passwordShow"
          color="white" size="sm").q-mr-md
    //.row.full-width.q-px-xs.q-pt-xs
    //  //q-btn(flat dense no-caps color="white") {{'Forgot password?'}}
    //- password send
    q-btn(
      outline no-caps color="green"
      :loading="passwordSending"
      :disable="password.length < 4"
      :label="$t('Login')"
      size="lg"
      @click="passwordSend()"
      ).full-width.q-mt-md
      //span(:style=`{fontSize: '18px'}`).text-bold {{ $t('Login') }}
    //- reset
    .row.full-width.q-pa-xs
      q-btn(
        v-if="emailSent"
        flat dense no-caps color="red"
        :style=`{
        }`
        @click="reset()")
        span(:style=`{fontSize: '14px'}`) {{ $t('Reset form') }}
  div(v-if="!emailSent"
    :style=`{fontSize: '10px', marginTop: $q.screen.width > 320 ? '30%' : '0%'}`).row.full-width.q-py-md
    small(:style=`{fontSize: '10px'}`).text-grey {{ $t('If you proceed, you agree with our terms') }}
    kalpa-docs(
      :style=`{fontSize: '12px'}`
      :title="$t('If you proceed, you agree with our terms')"
      docColor="doc-item2")
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
      emailEnterDisable: false,
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
      this.emailEnterDisable = false
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
        this.emailEnterDisable = true
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
        // this.$gsap.to(this.$refs['wrapper-mobile'], 5, {height: 2000})
        let {result, failReason, oid} = await AuthApi.userAuthenticate(this.password, null)
        if (result === false) throw new Error(`Error: ${failReason}`)
        this.$log('passwordSend done')
        this.passwordSending = false
        this.finish()
      }
      catch (e) {
        this.$log('passwordSend error', e)
        this.$q.notify({type: 'negative', position: 'top', message: e.toString()})
        this.passwordSending = false
      }
    },
    async finish () {
      this.$log('finish')
      this.$ym('USER_LOGIN')
      // Call callback if provided...
      if (this.onSuccess) {
        this.onSuccess()
      }
      else {
        await this.$router.replace('/')
      }
    }
  },
}
</script>
