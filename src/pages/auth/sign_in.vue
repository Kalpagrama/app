<template lang="pug">
q-page(:style=`{paddingBottom: '200px',}`)
  .row.full-width.items-start.content-start.justify-center
    div(:style=`{maxWidth: '300px'}`).row.full-width.items-start.content-start
      div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).row.full-width.b-40
        .row.full-width.q-pa-md
          .row.full-width.justify-center.q-py-md.q-px-sm
            span().text-white {{$t('auth_Sign in with email/password', 'Войти с почтой и паролем')}}
          //- form
          form().full-width.q-py-md
            //- username
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
                ).full-width
            //- password
            div(
              :style=`{position: 'relative', zIndex: 200, borderRadius: '10px', overflow: 'hidden', transform: 'translate'}`
              ).row.full-width.items-center.content-center.q-mb-xs
              q-input(
                v-model="password"
                :placeholder="$t('auth_Enter password', 'Введите пароль')"
                autocomplete="current-password"
                type="password" required name="password"
                filled dark color="white"
                @keyup.enter="signIn()").full-width
          //- submit
          q-btn(
            @click="signIn()"
            color="green" no-caps
            :loading="loading"
            :style=`{
              height: '60px',
            }`
            ).full-width
            span(:style=`{fontSize: '18px',}`).text-white.text-bold {{$t('auth_Sign in', 'Войти')}}
      .row.full-width.q-px-sm
        with-socials
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
    }
  },
  watch: {
    '$route.query.token': {
      immediate: true,
      async handler (to, from) {
        this.$log('$route.query.token CHANGED', to)
        if (to) {
          this.$log('GOT TOKEN', to)
          // this.$q.notify('GOT TOKEN' + JSON.stringify(this.$route.query))
          let { userId, loginType, userExist, needInvite, needConfirm, token, expires } = await AuthApi.userIdentifyByRoute(this.$route)
          // await this.$wait(200)
          this.userIdentifying = false
          this.userIdentified = true
          this.login = userId
          this.loginType = loginType
          this.userExist = userExist === 'true' ? true : false
          this.needInvite = needInvite === 'true' ? true : false
          this.$log('this.needInvite = ', this.needInvite)
          if (this.needInvite){
            // TODO  Ваня? Нужно показать окно ввода инвайт-кода!!!
          }
          await AuthApi.userAuthenticate('', '8888')
          await this.$router.replace('/')
          // if userExist and !needInvite... this.userAuthenticate()
          // this.$router.replace('/auth')
        }
      }
    }
  },
  methods: {
    check () {
      this.$log('check')
      if (this.login.length === 0) throw new Error('Login is empty!')
      if (this.password.length === 0) throw new Error('Password is empty!')
    },
    async signIn () {
      try {
        this.$log('signIn start')
        // await this.$wait(500)
        this.check()
        this.loading = true
        // await this.$wait(1000)
        let {userExist, userId, needInvite, loginType} = await AuthApi.userIdentify(this.login)
        if (!userExist) throw new Error('No such user!')
        if (loginType !== 'USERNAME') throw new Error('Invalid login type!')
        let {result, failReason, oid} = await AuthApi.userAuthenticate(this.password)
        if (result === false) throw new Error(`Error: ${failReason}`)
        this.$log('signIn done', oid)
        this.loading = false
        this.$q.notify({type: 'positive', position: 'top', message: 'Welcome!'})
        await this.$router.replace('/')
        // window.location.reload() // TODO раскомментировать! иначе не обновляется юзер (при входе без логина - фейковый юзер)
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
