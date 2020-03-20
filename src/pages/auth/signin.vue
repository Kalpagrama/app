<template lang="pug">
.row.full-width.justify-center
  div(:style=`{
    maxWidth: $store.state.ui.maxWidthPage+'px',
    borderRadius: '10px',
    marginBottom: $q.screen.height/2+'px'}`
    ).row.full-width.justify-center.bg-grey-10.q-pb-xl
    .row.full-width.q-pa-md
      div(:style=`{width: '50px', height: '50px'}`).row
        kalpa-spinner(:width="50" :height="50")
      .col.full-height
        .row.fit.items-center.content-center.q-px-md
          span(:style=`{fontSize: '20px'}`).text-white.text-bold Kalpa
    div(:style=`{maxWidth: '400px'}`).row.full-width.justify-center.q-py-xl.q-px-sm
      .row.full-width.items-center.content-center.justify-center.text-bold.text-center.q-py-lg
        span(:style=`{fontSize: '20px'}`).text-white.q-mr-sm Get started with
        span(:style=`{fontSize: '20px'}`).text-green Kalpa
      //- NOT identified
      div(v-if="!userIdentified").row.full-width
        q-input(v-model="login" dark color="green" filled label="Enter your login/email/phone"
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
          .row.full-width.q-pa-sm.q-px-md
            span.text-grey-3 New users need invite code
          q-input(
            v-model="inviteCode" dark color="green" filled label="Enter invite code"
            :style=`{borderRadius: '10px', overflow: 'hidden'}`
            ).full-width.q-mb-sm.bg-grey-9
        //- email
        div(v-if="loginType && loginType === 'EMAIL'").row.full-width
          .row.full-width.justify-center.q-pa-sm
            span.text-grey-3 We sent code to your email: {{login}}.
          q-input(
            v-model="password" dark color="green" filled label="Enter code" type="tel"
            @keyup.enter="userAuthenticate()"
            :style=`{borderRadius: '10px', overflow: 'hidden'}`).full-width.q-mb-sm.bg-grey-9
        //- phone
        div(v-if="loginType && loginType === 'PHONE'").row.full-width
          .row.full-width.justify-center.q-pa-sm
            span.text-grey-3 We sent sms to your phone: {{login}}.
        //- password
        div(v-if="loginType && loginType === 'PASSWORD'").row.full-width
          q-input(
            v-model="password" dark color="green" filled label="Enter password"
            @keyup.enter="userAuthenticate()"
            :style=`{borderRadius: '10px', overflow: 'hidden'}`).full-width.q-mb-sm.bg-grey-9
        //- confirm
        q-btn(push no-caps color="green" @click="userAuthenticate()" label="Enter kalpa"
          :loading="userAuthenticating"
          :style=`{height: '60px', borderRadius: '10px'}`).full-width.q-my-md
      .row.full-width.justify-center.q-pb-sm
        router-link(to="/help/policy")
          small.text-grey-8 By clicking "Enter kalpa", you agree to the terms of the Privacy Policy.
</template>

<script>
export default {
  name: 'pageAuthSignin',
  data () {
    return {
      login: '',
      password: '',
      passwordSecond: '',
      inviteCode: '',
      passwordShow: false,
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
        this.$q.notify({message: e, color: 'red', textColor: 'white'})
        this.userIdentifying = false
      }
    },
    async userAuthenticate () {
      try {
        this.$log('userAuthenticate start')
        this.userAuthenticating = true
        await this.$wait(500)
        let res = await this.$store.dispatch('auth/userAuthenticate', {password: this.password, inviteCode: this.inviteCode})
        this.$log('userAuthenticate done', res)
        this.userAuthenticating = false
        this.userAuthenticated = true
        if (res.result === false) {
          this.$q.notify({message: res.failReason, color: 'red', textColor: 'white'})
          this.reset()
        }
        else {
          this.$router.push('/')
        }
      }
      catch (e) {
        this.$log('userAuthenticate error', e)
        this.$q.notify({message: e, color: 'red', textColor: 'white'})
        this.userAuthenticating = false
      }
    },
    reset () {
      this.$log('reset')
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
