<template lang="pug">
.row.full-width.justify-center
  div(:style=`{
    maxWidth: $store.state.ui.maxWidthPage+'px',
    borderRadius: '10px',
    marginBottom: $q.screen.height/2+'px'}`
    ).row.full-width.justify-center.bg-grey-10.q-pb-xl
    div(:style=`{maxWidth: '400px'}`).row.full-width.justify-center.q-py-xl.q-px-sm
      .row.full-width.items-center.content-center.justify-center.text-bold.text-center.q-py-lg
        span(:style=`{fontSize: '20px'}`).text-white.q-mr-sm Get started with
        span(:style=`{fontSize: '20px'}`).text-green Kalpa
      q-input(v-model="inviteCode" dark color="green" filled label="Enter invite code"
        type="tel"
        :style=`{borderRadius: '10px', overflow: 'hidden'}`).full-width.q-mb-sm.bg-grey-9
      q-input(v-model="login" dark color="green" filled label="Enter login/email/phone"
        :style=`{borderRadius: '10px', overflow: 'hidden'}`).full-width.q-mb-sm.bg-grey-9
      q-input(v-model="password" dark color="green" filled label="Enter password"
        :type="passwordShow ? 'text' : 'password'"
        :style=`{borderRadius: '10px', overflow: 'hidden'}`).full-width.q-mb-sm.bg-grey-9
        template(v-slot:append)
          q-btn(round flat :icon="passwordShow ? 'visibility_off' : 'visibility'" @click="passwordShow = !passwordShow")
      q-input(v-model="passwordSecond" dark color="green" filled label="Confirm password"
        :type="passwordSecondShow ? 'text' : 'password'"
        @keyup.enter="createAccount()"
        :style=`{borderRadius: '10px', overflow: 'hidden'}`).full-width.q-mb-sm.bg-grey-9
        template(v-slot:append)
          q-btn(round flat :icon="passwordSecondShow ? 'visibility_off' : 'visibility'" @click="passwordSecondShow = !passwordSecondShow")
      q-btn(push color="green" no-caps @click="createAccount()"
        :style=`{height: '60px'}`).full-width.q-my-sm
        span.text-white.text-bold Create account
      .row.full-width.justify-center.q-pb-sm
        router-link(to="/help/policy")
          small.text-grey-8 By clicking "Create account", you agree to the terms of the Privacy Policy.
      .row.full-width.justify-center.text-white.text-center.q-py-md
        span.q-mr-sm Have account?
        router-link(to="/auth").text-white.text-green.text-bold Sign in
</template>

<script>
export default {
  name: 'pageAuthSignup',
  data () {
    return {
      inviteCode: '',
      login: '',
      password: '',
      passwordShow: false,
      passwordSecond: '',
      passwordSecondShow: false,
      passwordMatched: false,
    }
  },
  methods: {
    async createAccount () {
      try {
        this.$log('createAccount start')
        this.loading = true
        await this.$wait(500)
        this.check()
        let res = await this.$store.dispatch('auth/loginPassword', {password: this.password, login: this.login, inviteCode: this.inviteCode})
        await this.$wait(500)
        this.$log('createAccount done', res)
        this.loading = false
        this.$router.push('/')
      }
      catch (e) {
        this.$log('createAccount error', e)
        this.$q.notify({message: e.toString(), color: 'red', textColor: 'white'})
        this.loading = false
      }
    },
    check () {
      if (this.login.length < 3) throw new Error('Short login')
      if (this.password.length < 3) throw new Error('Short password!')
      if (this.passwordSecond.length < 3) throw new Error('Short password second!')
      if (this.password !== this.passwordSecond) throw new Error('Passwords dont match')
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
