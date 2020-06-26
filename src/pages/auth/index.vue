<style lang="sass" scoped>
input
  outline: none
</style>

<template lang="pug">
.row.full-width.items-start.content-start.justify-center
  //- wrapper
  div(
    :style=`{
      minHeight: $q.screen.xs ? $q.screen.height+'px' : '600px',
      marginTop: $q.screen.xs ? 0 : ($q.screen.height-600)/2+'px',
      maxWidth: 600+'px',
      borderRadius: $q.screen.width > 600 ? '10px' : '0px'
    }`
    ).row.full-width.items-center.content-center.justify-center.b-70
    div().row.full-width.justify-center.q-my-md
      q-icon(name="blur_on" color="white" size="100px" @click="$router.replace('/auth').catch(e => e)").cursor-pointer
      .row.full-width.justify-center
        span(:style=`{fontSize: '24px'}`).text-bold.text-white Kalpagramma
    //- form
    div(:style=`{maxWidth: '350px'}`).row.full-width.justify-center.q-pa-sm
      div(:style=`{borderRadius: $store.state.ui.borderRadius+'px', oveflow: 'hidden'}`).row.fit.items-end.q-pa-sm.q-mb-sm
        //- get started
        div(v-if="!userIdentified").row.full-width.items-end.content-end.justify-center
          span(:style=`{fontSize: '18px'}`).text-white.q-mr-sm Welcome, identify yourself
          //- span(:style=`{fontSize: '20px'}`).text-green Kalpa
      //- socials
      with-socials(v-if="!userIdentified")
      //- NOT identified
      div(v-if="!userIdentified").row.full-width
        q-input(
          v-model="login"
          dark color="green" filled label="Enter username / email / phone"
          @keyup.enter="userIdentify()"
          :style=`{
            fontSize: '20px',
            borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden',
            transform: 'translate3d(0,0,0)',
          }`).full-width.q-mb-sm.bg-grey-9
        q-btn(
          push no-caps color="green" @click="userIdentify()"
          :loading="userIdentifying" :disable="login.length < 4"
          :style=`{height: '60px', borderRadius: $store.state.ui.borderRadius+'px'}`).full-width.q-my-sm
            span.text-bold.text-white Continue
      //- IDENTIFIED
      div(v-if="userIdentified").row.full-width
        //- userExist & needInvite
        div(v-if="needInvite").row.full-width
          .row.full-width.justify-start.q-py-sm.q-px-md
            span.text-grey-3 {{$t('Need invite code (beta testing in progress...)')}}
          q-input(
            v-model="inviteCode" dark color="green" filled label="Enter invite code" autofocus
            :style=`{borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden', transform: 'translate3d(0,0,0)'}`
            ).full-width.q-mb-sm.bg-grey-9
        //- email
        div(v-if="loginType && loginType === 'EMAIL'").row.full-width
          //- .row.full-width.justify-center
          //-   q-btn(flat round color="grey-2" no-caps icon="keyboard_arrow_left")
          div(:style=`{}`).row.full-width.justify-center
            input(
              v-model="password"
              type="tel" maxlength="4"
              placeholder="0000" autofocus
              :style=`{
                height: '110px',
                fontSize: '90px',
                letterSpacing: '10px',
                background: 'none',
                maxWidth: '240px',
                margin: 0,
                padding: 0,
                border: 'none'
              }`).text-bold.text-white
          .row.full-width.items-center.content-center.justify-center.q-py-sm.q-px-md
            //- q-btn(round flat color="white" icon="keyboard_arrow_left" @click="reset()")
            span(:style=`{fontSize: '14px'}`).text-grey-2 Enter confirmation code, we sent you to:
          .row.full-width.justify-center
            span(:style=`{fontSize: '14px'}`).text-white.text-bold {{ login }}
          //- q-input(
          //-   v-model="password" autofocus dark color="green" filled label="Enter code" type="tel"
          //-   @keyup.enter="userAuthenticate()"
          //-   :style=`{borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden'}`).full-width.q-mb-sm.bg-grey-9
        //- phone
        div(v-if="loginType && loginType === 'PHONE'").row.full-width
          .row.full-width.justify-start.q-py-sm.q-px-md
            q-btn(round flat color="white" icon="keyboard_arrow_left" @click="reset()")
            span(:style=`{fontSize: '20px'}`).text-white.q-mr-sm Enter code, we sent you to:
            span(:style=`{fontSize: '20px'}`).text-green {{ login }}
          q-input(
            v-model="password" autofocus dark color="green" filled label="Enter code" type="tel"
            @keyup.enter="userAuthenticate()"
            :style=`{borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden', transform: 'translate3d(0,0,0)'}`).full-width.q-mb-sm.bg-grey-9
        //- password
        div(v-if="loginType && loginType === 'USERNAME'").row.full-width
          div(:style=`{height: '60px'}`
            ).row.full-width.items-center.content-center.text-center.justify-start.q-py-sm
            q-btn(round flat color="white" icon="keyboard_arrow_left" @click="reset()")
            span.text-grey-3.text-bold Enter with login:
            span.text-grey-3.text-bold.q-ml-sm {{login}}
          q-input(
            v-model="password" autofocus dark color="green" filled label="Enter password"
            :type="passwordShow ? 'text' : 'password'"
            @keyup.enter="userAuthenticate()"
            :style=`{borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden', transform: 'translate3d(0,0,0)'}`).full-width.q-mb-sm.bg-grey-9
            template(v-slot:append)
              q-icon(
                size="22px" color="white" @click="passwordShow = !passwordShow"
                :name="passwordShow ? 'visibility' : 'visibility_off'")
          q-input(
            v-if="!userExist"
            v-model="passwordSecond" dark color="green" filled label="Confirm password"
            :type="passwordSecondShow ? 'text' : 'password'"
            @keyup.enter="userAuthenticate()"
            :style=`{borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden', transform: 'translate3d(0,0,0)'}`).full-width.q-mb-sm.bg-grey-9
            template(v-slot:append)
              q-icon(
                size="22px" color="white" @click="passwordSecondShow = !passwordSecondShow"
                :name="passwordSecondShow ? 'visibility' : 'visibility_off'")
        //- confirm
        q-btn(
          push no-caps color="green" @click="userAuthenticate()" label="Enter kalpa"
          :disable="loginType === 'USERNAME' && !userExist ? password !== passwordSecond : false"
          :loading="userAuthenticating"
          :style=`{height: '60px', borderRadius: $store.state.ui.borderRadius+'px'}`).full-width.q-my-md
      //- help/policy
      .row.full-width.justify-center.q-pb-sm.q-px-md.text-center
        //- router-link(to="/help/policy")
        small.text-grey-8.text-center By clicking "Continue", you agree to the terms of the Privacy Policy.
</template>

<script>
import withSocials from './with_socials'
import { AuthApi } from 'src/api/auth'

export default {
  name: 'pageAuth-index',
  meta: {
    title: 'Kalpagramma - Auth'
  },
  components: {withSocials},
  data () {
    return {
      login: '',
      password: '',
      passwordShow: false,
      passwordSecond: '',
      passwordSecondShow: false,
      inviteCode: '',
      loading: false,
      userIdentifying: false,
      userIdentified: false,
      userExist: null,
      loginType: null,
      needInvite: null,
      userAuthenticating: false,
      userAuthenticated: false
    }
  },
  watch: {
    login (newVal) {
      this.$set(this, 'login', newVal.replace(/[^0-9a-zA-Z-_.@]/g, ''))
    },
    password: {
      handler (to, from) {
        this.$log('password CHANGED', to)
        if (this.loginType && this.loginType === 'USERNAME') return
        if (to) {
          if (to.length === 4) {
            this.userAuthenticate()
          }
        }
      }
    },
    '$route.query.token': {
      immediate: true,
      async handler (to, from) {
        this.$log('$route.query.token CHANGED', to)
        if (to) {
          this.$log('GOT TOKEN', to)
          // this.$q.notify('GOT TOKEN' + JSON.stringify(this.$route.query))
          let q = this.$route.query
          this.$log('q=', q)
          localStorage.setItem('k_token', q.token)
          localStorage.setItem('ktokenExpires', q.expires)
          // await this.$wait(200)
          this.userIdentifying = false
          this.userIdentified = true
          this.login = q.userId
          this.loginType = q.loginType
          this.userExist = q.userExist === 'true' ? true : false
          this.needInvite = q.needInvite === 'true' ? true : false
          this.$log('this.needInvite = ', this.needInvite)
          // if userExist and !needInvite... this.userAuthenticate()
          // this.$router.replace('/auth')
        }
      }
    }
  },
  methods: {
    async userIdentify () {
      try {
        this.$log('userIdentify start')
        if (this.login.length < 3) throw new Error('Short login/email/phone!')
        this.userIdentifying = true
        await this.$wait(500)
        let res = await AuthApi.userIdentify(this.login)
        this.$log('userIdentify done', res)
        this.userIdentifying = false
        this.userIdentified = true
        this.userExist = res.userExist
        this.login = res.userId
        this.loginType = res.loginType
        this.needInvite = res.needInvite
      }
      catch (e) {
        this.$log('userIdentify error', e)
        this.$q.notify({message: e, color: 'red', textColor: 'white', multiLine: true})
        this.userIdentifying = false
      }
    },
    async userAuthenticate () {
      try {
        this.$log('userAuthenticate start')
        this.userAuthenticating = true
        await this.$wait(500)
        if (this.loginType === 'USERNAME') {
          if (this.userExist === false) {
            if (this.password !== this.passwordSecond) {
              this.passwordShow = true
              this.passwordSecond = ''
              throw new Error('Password dont match!')
            }
          }
        }
        // alert('userAuthenticate', this.password, this.inviteCode)
        this.$q.notify('userAuthenticate' + this.password + '/' + this.inviteCode)
        this.$log('userAuthenticate password', this.password)
        this.$log('userAuthenticate inviteCode', this.inviteCode)
        let res = await AuthApi.userAuthenticate(this.password, this.inviteCode)
        // let res = await this.$store.dispatch('auth/userAuthenticate', {password: this.password, inviteCode: this.inviteCode})
        this.$log('userAuthenticate done', res)
        this.userAuthenticating = false
        this.userAuthenticated = true
        if (res.result === false) {
          this.$q.notify({message: res.failReason, color: 'red', textColor: 'white'})
          // this.reset()
          this.password = ''
          this.passwordShow = false
          this.passwordSecond = ''
          this.passwordSecondShow = false
        }
        else {
          this.$router.replace('/')
        }
      }
      catch (e) {
        this.$log('userAuthenticate error', e)
        this.$q.notify({message: e, color: 'red', textColor: 'white', multiLine: true})
        this.inviteCode = ''
        this.login = ''
        this.password = ''
        this.passwordSecond = ''
        this.passwordShow = false
        this.passwordSecondShow = false
        this.userAuthenticating = false
      }
    },
    reset () {
      this.$log('reset')
      this.password = ''
      this.passwordSecond = ''
      this.userExist = null
      this.needInvite = null
      this.loginType = null
      this.userIdentifying = false
      this.userIdentified = false
      this.userAuthenticating = false
      this.userAuthenticated = false
    },
    passwordCheck () {
      if (this.password.length < 3) throw new Error('Wrong password!')
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
