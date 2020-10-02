<template lang="pug">
q-page(:style=`{paddingBottom: '200px',}`)
  .row.full-width.items-start.content-start.justify-center
    div(:style=`{maxWidth: '300px'}`).row.full-width.items-start.content-start
      div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).row.full-width.b-40
        .row.full-width.q-pa-md
          .row.full-width.justify-center.q-py-md.q-px-sm
            span(:style=`{fontSize: '18px'}`).text-bold.text-white {{$t('auth Sign in with email', 'Войти через почту')}}
          //- form
          .full-width.q-py-md
            //- email
            div(
              :style=`{position: 'relative', zIndex: 200, borderRadius: '10px', overflow: 'hidden', transform: 'translate'}`
              ).row.full-width.items-center.content-center.q-mb-xs
              q-input(
                v-model="email"
                :placeholder="$t('auth_Enter email', 'Введите почту')"
                autocomplete="username"
                filled dark color="white" name="username"
                type="email" required
                :style=`{}`
                @keyup.enter="identify()"
                ).full-width
            //- password
            div(
              v-if="passwordShow"
              :style=`{position: 'relative', zIndex: 200, borderRadius: '10px', overflow: 'hidden', transform: 'translate'}`
              ).row.full-width.items-center.content-center.q-mb-xs
              q-input(
                v-model="password"
                :placeholder="$t('auth_Enter password', 'Введите пароль')"
                autocomplete="current-password"
                type="password" required name="password"
                filled dark color="white"
                @keyup.enter="signIn()").full-width
            //- email code
            div(v-if="emailCodeShow").row.full-width
              input(
                v-model="emailCode"
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
                @keyup.enter="signIn()"
                ).full-width.b-50
              .row.full-width.justify-center.q-py-xs
                span.text-bold.text-grey-6 Введите код с почты
            //- invite code
            div(v-if="inviteCodeShow").row.full-width
              input(
                v-model="inviteCode"
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
                @keyup.enter="signIn()"
                ).full-width.b-50
              .row.full-width.justify-center.q-py-xs
                span.text-bold.text-grey-6 Введите промокод
          //- identify
          q-btn(
            v-if="!userId"
            @click="identify()"
            color="green" no-caps
            :loading="loading"
            :style=`{
              height: '60px',
            }`
            ).full-width
            span(:style=`{fontSize: '18px',}`).text-white.text-bold Далее
          //- signIn
          q-btn(
            v-if="userId"
            @click="signIn()"
            color="green" no-caps
            :loading="loading"
            :style=`{
              height: '60px',
            }`
            ).full-width
            span(:style=`{fontSize: '18px',}`).text-white.text-bold {{$t('auth_Sign in', 'Войти')}}
      .row.full-width.q-px-sm
        with-socials(:title="$t('auth_Sign in with Google!', 'Войти через Google')")
</template>

<script>
import { AuthApi } from 'src/api/auth'
import withSocials from './with_socials.vue'

export default {
  name: 'pageAuth__signIn',
  components: {withSocials},
  data () {
    return {
      userId: null,
      email: '',
      emailShow: true,
      emailCode: '',
      emailCodeShow: false,
      password: '',
      passwordShow: false,
      inviteCodeShow: false,
      inviteCode: ''
    }
  },
  watch: {
    login (newVal) {
      this.$set(this, 'login', newVal.replace(/[^0-9a-zA-Z-_.@]/g, ''))
    },
  },
  methods: {
    async identify () {
      try {
        this.$log('identify start')
        this.loading = true
        if (this.email.length === 0) throw new Error('Login is empty!')
        let {userExist, userId, needInvite, needConfirm, loginType, hasPermanentPassword} = await AuthApi.userIdentify(this.email)
        // let {userExist, userId, needInvite, needConfirm, loginType, hasPermanentPassword} = {
        //   userExist: false,
        //   userId: 'ivanq3w@gmail.com',
        //   needInvite: true,
        //   needConfirm: true,
        //   loginType: 'EMAIL',
        //   hasPermanentPassword: true,
        // }
        console.log({userExist, userId, needInvite, needConfirm, loginType, hasPermanentPassword})
        if (loginType !== 'EMAIL') throw new Error('Only emails...')
        this.userId = userId
        if (hasPermanentPassword) {
          this.passwordShow = true
        }
        if (needInvite) {
          this.inviteCodeShow = true
        }
        if (needConfirm) {
          this.emailCodeShow = true
        }
        this.$log('identify done')
        this.loading = false
      }
      catch (e) {
        this.$log('identify error', e)
        this.$q.notify({type: 'negative', position: 'top', message: e.toString()})
        this.loading = false
      }
    },
    async signIn () {
      try {
        this.$log('signIn start')
        this.loading = true
        let password
        if (this.passwordShow) {
          password = this.password
        }
        if (this.emailCodeShow) {
          password = this.emailCode
        }
        if (password.length === 0) throw new Error('Code is empty!')
        let {result, failReason, oid} = await AuthApi.userAuthenticate(password, this.inviteCode)
        // let {result, failReason, oid} = {result: false, failReason: 'fuck u', oid: null}
        if (result === false) throw new Error(`Error: ${failReason}`)
        this.$log('signIn done', oid)
        this.loading = false
        this.$q.notify({type: 'positive', position: 'top', message: 'Welcome!'})
        await this.$router.replace('/')
      }
      catch (e) {
        this.$log('signIn error', e)
        this.$q.notify({type: 'negative', position: 'top', message: e.toString()})
        this.loading = false
      }
    }
  }
}
</script>
