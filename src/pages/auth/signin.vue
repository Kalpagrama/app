<template lang="pug">
.row.full-width.items-start.content-start.justify-center.q-pa-xs
  //- wrapper
  div(
    :style=`{
      minHeight: $q.screen.xs ? $q.screen.height-8+'px' : '600px',
      marginTop: $q.screen.xs ? 0 : ($q.screen.height-600)/2+'px',
      marginBottom: $q.screen.height+'px',
      maxWidth: 600+'px',
      borderRadius: '10px'
    }`
    ).row.full-width.items-start.content-start.justify-center.bg-grey-10.q-pb-xl
    //- header
    .row.full-width.items-center.q-pa-md
      div(:style=`{width: '50px', height: '50px'}`).row
        kalpa-spinner(:width="50" :height="50")
      .col.full-height
        .row.fit.items-center.content-center.q-px-sm
          span(:style=`{fontSize: '20px'}`).text-white.text-bold.q-mb-sm Kalpa
    //- form
    div(:style=`{maxWidth: '400px'}`).row.full-width.justify-center.q-py-xl.q-px-sm
      //- get started
      div(v-if="!userIdentified").row.full-width.items-center.content-center.justify-center.text-bold.text-center.q-py-lg
        span(:style=`{fontSize: '20px'}`).text-white.q-mr-sm Get started with
        span(:style=`{fontSize: '20px'}`).text-green Kalpa
      //- socials
      div(:style=`{height: '60px'}`).row.full-width.items-center.content-center
        div(v-if="!userIdentified").row.full-width.justify-between.q-py-md
          div(
            v-for="n in 8" :key="n"
            :style=`{width: '40px', height: '40px', borderRadius: '50%'}`
            ).row.items-center.content-center.justify-center.bg-grey-8.cursor-pointer
            span.text-white.text-bold {{n}}
      //- NOT identified
      div(v-if="!userIdentified").row.full-width
        q-input(
          v-model="login"
          dark color="green" filled label="Enter your login/email/phone"
          @keyup.enter="userIdentify()"
          :style=`{borderRadius: '10px', overflow: 'hidden'}`).full-width.q-mb-sm.bg-grey-9
        q-btn(
          push no-caps color="green" @click="userIdentify()"
          :loading="userIdentifying" :disable="login.length < 4"
          :style=`{height: '60px', borderRadius: '10px'}`).full-width.q-mb-sm
            span.text-bold.text-white Continue
      //- IDENTIFIED
      div(v-else).row.full-width
        //- userExist & needInvite
        div(v-if="needInvite === true && userExist === false").row.full-width
          .row.full-width.justify-start.q-py-sm.q-px-md
            span.text-grey-3 New users need invite code
          q-input(
            v-model="inviteCode" dark color="green" filled label="Enter invite code"
            :style=`{borderRadius: '10px', overflow: 'hidden'}`
            ).full-width.q-mb-sm.bg-grey-9
        //- email
        div(v-if="loginType && loginType === 'EMAIL'").row.full-width
          .row.full-width.items-center.content-center.justify-start.q-py-sm.q-px-md
            q-btn(round flat color="white" icon="keyboard_arrow_left" @click="reset()")
            span(:style=`{fontSize: '20px'}`).text-white.q-mr-sm Enter code, we sent you to:
            span(:style=`{fontSize: '20px'}`).text-green {{ login }}
          q-input(
            v-model="password" autofocus dark color="green" filled label="Enter code" type="tel"
            @keyup.enter="userAuthenticate()"
            :style=`{borderRadius: '10px', overflow: 'hidden'}`).full-width.q-mb-sm.bg-grey-9
        //- phone
        div(v-if="loginType && loginType === 'PHONE'").row.full-width
          .row.full-width.justify-start.q-py-sm.q-px-md
            q-btn(round flat color="white" icon="keyboard_arrow_left" @click="reset()")
            span(:style=`{fontSize: '20px'}`).text-white.q-mr-sm Enter code, we sent you to:
            span(:style=`{fontSize: '20px'}`).text-green {{ login }}
          q-input(
            v-model="password" autofocus dark color="green" filled label="Enter code" type="tel"
            @keyup.enter="userAuthenticate()"
            :style=`{borderRadius: '10px', overflow: 'hidden'}`).full-width.q-mb-sm.bg-grey-9
        //- password
        div(v-if="loginType && loginType === 'PASSWORD'").row.full-width
          div(:style=`{height: '60px'}`
            ).row.full-width.items-center.content-center.text-center.justify-start.q-py-sm
            q-btn(round flat color="white" icon="keyboard_arrow_left" @click="reset()")
            span.text-grey-3.text-bold Enter with login:
            span.text-grey-3.text-bold.q-ml-sm {{login}}
          q-input(
            v-model="password" autofocus dark color="green" filled label="Enter password"
            :type="passwordShow ? 'text' : 'password'"
            @keyup.enter="userAuthenticate()"
            :style=`{borderRadius: '10px', overflow: 'hidden'}`).full-width.q-mb-sm.bg-grey-9
            template(v-slot:append)
              q-icon(
                size="22px" color="white" @click="passwordShow = !passwordShow"
                :name="passwordShow ? 'visibility' : 'visibility_off'")
          q-input(
            v-if="!userExist"
            v-model="passwordSecond" dark color="green" filled label="Confirm password"
            :type="passwordSecondShow ? 'text' : 'password'"
            @keyup.enter="userAuthenticate()"
            :style=`{borderRadius: '10px', overflow: 'hidden'}`).full-width.q-mb-sm.bg-grey-9
            template(v-slot:append)
              q-icon(
                size="22px" color="white" @click="passwordSecondShow = !passwordSecondShow"
                :name="passwordSecondShow ? 'visibility' : 'visibility_off'")
        //- confirm
        q-btn(
          push no-caps color="green" @click="userAuthenticate()" label="Enter kalpa"
          :disable="loginType === 'PASSWORD' && !userExist ? password !== passwordSecond : false"
          :loading="userAuthenticating"
          :style=`{height: '60px', borderRadius: '10px'}`).full-width.q-my-md
      //- help/policy
      .row.full-width.justify-center.q-pb-sm.q-px-md.text-center
        router-link(to="/help/policy")
          small.text-grey-8.text-center By clicking "Enter kalpa", you agree to the terms of the Privacy Policy.
</template>

<script>
export default {
  name: 'pageAuthSignin',
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
    }
  },
  methods: {
    async userIdentify () {
      try {
        this.$log('userIdentify start')
        if (this.login.length < 3) throw new Error('Short login/email/phone!')
        this.userIdentifying = true
        await this.$wait(500)
        let res = await this.$store.dispatch('auth/userIdentify', this.login)
        this.$log('userIdentify done', res)
        this.userIdentifying = false
        this.userIdentified = true
        this.userExist = res.userExist
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
        if (this.loginType === 'PASSWORD') {
          if (this.userExist === false) {
            if (this.password !== this.passwordSecond) {
              this.passwordShow = true
              this.passwordSecond = ''
              throw new Error('Password dont match!')
            }
          }
        }
        let res = await this.$store.dispatch('auth/userAuthenticate', {password: this.password, inviteCode: this.inviteCode})
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
