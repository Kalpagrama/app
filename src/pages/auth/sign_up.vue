<template lang="pug">
q-page(:style=`{paddingBottom: '200px',}`)
  .row.full-width.items-start.content-start.justify-center
    div(:style=`{maxWidth: '300px'}`).row.full-width.items-start.content-start
      div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).row.full-width.b-40
        .row.full-width.q-pa-md
          .row.full-width.justify-center.q-py-md.q-px-sm
            span().text-white Sign up with username/password
          //- form
          form().full-width.q-py-md
            //- username
            div(
              :style=`{position: 'relative', zIndex: 200, borderRadius: '10px', overflow: 'hidden', transform: 'translate'}`
              ).row.full-width.items-center.content-center.q-mb-xs
              q-input(
                v-model="login"
                placeholder="Username"
                filled dark color="white" name="username"
                type="text" required
                :style=`{}`
                ).full-width
            //- password
            div(
              :style=`{position: 'relative', zIndex: 200, borderRadius: '10px', overflow: 'hidden', transform: 'translate'}`
              ).row.full-width.items-center.content-center.q-mb-xs
              q-input(
                v-model="password"
                placeholder="Create password"
                autocomplete="new-password"
                type="password" required name="password"
                filled dark color="white"
                ).full-width
            //- password again
            div(
              :style=`{position: 'relative', zIndex: 200, borderRadius: '10px', overflow: 'hidden', transform: 'translate'}`
              ).row.full-width.items-center.content-center.q-mb-md
              q-input(
                v-model="passwordAgain"
                placeholder="Confirm password"
                autocomplete="new-password"
                type="password" required name="password"
                filled dark color="white"
                ).full-width
            //- promocode
            .row.full-width
              input(
                v-model="promo"
                type="tel" required
                placeholder="0000"
                maxlength="4" minlength="4"
                :style=`{
                  fontSize: '100px',
                  fontWeight: 'bold',
                  height: '130px',
                  letterSpacing: '6px',
                  color: 'white',
                  padding: '4px',
                  borderRadius: '10px',
                  overflow: 'hidden',
                }`
                @keyup.enter="signUp()"
                ).full-width.b-50
              .row.full-width.justify-center.q-py-xs
                span.text-bold.text-grey-6 Enter invite code
          //- submit
          q-btn(
            @click="signUp()"
            color="green" no-caps
            :loading="loading"
            :style=`{
              height: '60px',
            }`
            ).full-width
            span(:style=`{fontSize: '18px',}`).text-white.text-bold Create account
      .row.full-width.items-center.content-center.q-pa-md
        q-btn(
          color="green" outline dense no-caps
          @click="$router.push('/auth/sign-in')").full-width Sign in
        .row.full-width.justify-center.q-pa-xs
          small.text-green Already got account?
</template>

<script>
import { AuthApi } from 'src/api/auth'

export default {
  name: 'pageAuth__signUp',
  data () {
    return {
      login: '',
      password: '',
      passwordAgain: '',
      promo: '',
      loading: false,
    }
  },
  watch: {
    login (newVal) {
      this.$set(this, 'login', newVal.replace(/[^0-9a-zA-Z-_.@]/g, ''))
    },
  },
  methods: {
    check () {
      this.$log('check')
      if (this.login.length === 0) throw new Error('Login is empty!')
      if (this.password.length === 0) throw new Error('Password is empty!')
      if (this.passwordAgain.length === 0) throw new Error('Password is empty!')
      if (this.password !== this.passwordAgain) throw new Error('Passwords do not match!')
      if (this.promo.length === 0) throw new Error('Invite code is empty!')
      if (this.promo.length !== 4) throw new Error('Invite code is wrong')
    },
    async signUp () {
      try {
        this.$log('signUp start')
        await this.$wait(500)
        this.check()
        this.loading = true
        let {userExist, userId, needInvite, loginType} = await AuthApi.userIdentify(this.login)
        if (userExist) throw new Error('This user already exists')
        if (loginType !== 'USERNAME') throw new Error('Invalid login type!')
        let {result, failReason, oid} = await AuthApi.userAuthenticate(this.password, this.promo)
        if (result === false) throw new Error(`Error: ${failReason}`)
        // await this.$wait(1000)
        this.$log('signUp done', oid)
        this.loading = false
        this.$q.notify({type: 'positive', position: 'top', message: 'Welcome!'})
        this.$router.replace('/')
      }
      catch (e) {
        this.$log('signUp error', e)
        this.$q.notify({type: 'negative', position: 'top', message: e.toString()})
        this.loading = false
      }
    }
  }
}
</script>
