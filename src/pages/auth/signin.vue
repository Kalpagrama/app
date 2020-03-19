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
      q-input(v-model="login" dark color="green" filled label="Enter login/email/phone"
        :style=`{borderRadius: '10px', overflow: 'hidden'}`).full-width.q-mb-sm.bg-grey-9
      q-input(v-model="password" dark color="green" filled label="Enter password"
        :type="passwordShow ? 'text' : 'password'"
        @keyup.enter="enterKalpa()"
        :style=`{borderRadius: '10px', overflow: 'hidden'}`).full-width.q-mb-sm.bg-grey-9
        template(v-slot:append)
          q-btn(round flat :icon="passwordShow ? 'visibility_off' : 'visibility'" @click="passwordShow = !passwordShow")
      q-btn(push color="green" no-caps @click="enterKalpa()"
        :loading="loading"
        :style=`{height: '60px'}`).full-width.q-my-sm
        span.text-white.text-bold Enter kalpa
      .row.full-width.justify-center.q-pb-sm
        router-link(to="/help/policy")
          small.text-grey-8 By clicking "Enter kalpa", you agree to the terms of the Privacy Policy.
      .row.full-width.justify-center.text-white.text-center.q-py-md
        span.q-mr-sm No account?
        router-link(to="/auth/signup").text-white.text-green.text-bold Create account
</template>

<script>
export default {
  name: 'pageAuthSignin',
  data () {
    return {
      login: '',
      password: '',
      passwordShow: false,
      loading: false
    }
  },
  methods: {
    async enterKalpa () {
      try {
        this.$log('enterKalpa start')
        this.loading = true
        await this.$wait(500)
        this.passwordCheck()
        let { login, loginType, userExist, needInvite, token, expires } = await this.$store.dispatch('auth/userIdentify', this.login)
        this.$log('enterKalpa userIdentify done', { login, loginType, userExist, needInvite, token, expires })
        let { result, role, nextAttemptDate, attempts, failReason } = await this.$store.dispatch('auth/userAuthenticate', {password: this.password, inviteCode: '2018'})
        if (!result) alert('userAuthenticate fails!!! \r\n' + failReason)
        this.$log('enterKalpa userAuthenticate done', { result, role, nextAttemptDate, attempts, failReason })
        // await this.$wait(500)
        this.$log('enterKalpa done')
        this.loading = false
        this.$router.push('/')
      }
      catch (e) {
        this.$log('enterKalpa error', e)
        this.$q.notify({message: e.toString(), color: 'red', textColor: 'white'})
        this.loading = false
      }
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
