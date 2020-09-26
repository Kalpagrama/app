<template lang="pug">
q-page(:style=`{paddingBottom: '200px',}`)
  .row.full-width.items-start.content-start.justify-center
    div(:style=`{maxWidth: '300px'}`).row.full-width.items-start.content-start
      div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).row.full-width.b-40
        .row.full-width.q-pa-md
          .row.full-width.justify-center.q-py-md.q-px-sm
            span().text-white {{$t('auth Sign in with email', 'Войти через почту')}}
          //- form
          .full-width.q-py-md
            //- email
            div(
              :style=`{position: 'relative', zIndex: 200, borderRadius: '10px', overflow: 'hidden', transform: 'translate'}`
              ).row.full-width.items-center.content-center.q-mb-xs
              q-input(
                v-model="login"
                :placeholder="$t('auth_Enter email', 'Введите почту')"
                autocomplete="username"
                filled dark color="white" name="username"
                type="email" required
                :style=`{}`
                @keyup.enter="identify()"
                ).full-width
            //- password
            div(
              v-if="userId && !needConfirm"
              :style=`{position: 'relative', zIndex: 200, borderRadius: '10px', overflow: 'hidden', transform: 'translate'}`
              ).row.full-width.items-center.content-center.q-mb-xs
              q-input(
                v-model="password"
                :placeholder="$t('auth_Enter password', 'Введите пароль')"
                autocomplete="current-password"
                type="password" required name="password"
                filled dark color="white"
                @keyup.enter="signIn()").full-width
            //- code from email...
            div(v-if="userId && needConfirm").row.full-width
              input(
                v-model="password"
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
      .row.full-width.items-center.content-center.q-pa-md
        q-btn(
          color="green" outline dense no-caps
          @click="$router.push('/auth/sign-up')").full-width {{$t('auth__Sign up', 'Регистрация')}}
        .row.full-width.justify-center.q-pa-xs
          small.text-green {{$t('auth_No account ?', 'Нет аккаунта?')}}
</template>

<script>
import { AuthApi } from 'src/api/auth'
import withSocials from './with_socials.vue'

export default {
  name: 'pageAuth__signIn',
  components: {withSocials},
  data () {
    return {
      login: '',
      password: '',
      loading: false,
      userId: null,
      needConfirm: false,
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
        if (this.login.length === 0) throw new Error('Login is empty!')
        let {userExist, userId, needInvite, needConfirm, loginType} = await AuthApi.userIdentify(this.login)
        if (loginType !== 'EMAIL') throw new Error('Only emails...')
        this.userId = userId
        if (needConfirm) {
          this.needConfirm = needConfirm
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
        if (this.password.length === 0) throw new Error('Password is empty!')
        let {result, failReason, oid} = await AuthApi.userAuthenticate(this.password)
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
