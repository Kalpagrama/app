<template lang="pug">
q-page(:style=`{paddingBottom: '200px',}`)
  .row.full-width.items-start.content-start.justify-center
    div(:style=`{maxWidth: '300px'}`).row.full-width.items-start.content-start
      div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).row.full-width.b-40
        .row.full-width.q-pa-md
          .row.full-width.justify-center.q-py-md.q-px-sm
            span().text-white Создать аккаунт через почту
          //- form
          form().full-width.q-py-md
            //- email
            div(
              :style=`{position: 'relative', zIndex: 200, borderRadius: '10px', overflow: 'hidden', transform: 'translate'}`
              ).row.full-width.items-center.content-center.q-mb-xs
              q-input(
                v-model="login"
                placeholder="Введите почту"
                filled dark color="white" name="username"
                type="email" required
                :style=`{}`
                ).full-width
            //- password
            //- div(
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
            //- div(
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
            .row.full-width.q-mt-lg
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
                @keyup.enter="identify()"
                ).full-width.b-50
              .row.full-width.justify-center.q-py-xs
                span.text-bold.text-grey-6 Введите инвайт код
            //- confirm EMAIL with code
            div(v-if="userId && needConfirmEmail").row.full-width
              input(
                v-model="code"
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
                span.text-bold.text-grey-6 Введите код с почты
          //- submit
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
          q-btn(
            v-else
            @click="signUp()"
            color="green" no-caps
            :loading="confirming"
            :style=`{
              height: '60px',
            }`
            ).full-width
            span(:style=`{fontSize: '18px',}`).text-white.text-bold Создать аккаунт
      .row.full-width.q-px-sm
        with-socials(:title="$t('auth_Sign in with Google!', 'Войти через Google')")
      .row.full-width.items-center.content-center.q-pa-md
        q-btn(
          color="green" outline dense no-caps
          @click="$router.push('/auth/sign-in')").full-width Войти
        .row.full-width.justify-center.q-pa-xs
          small.text-green Уже есть аккаунт?
</template>

<script>
import { AuthApi } from 'src/api/auth'
import withSocials from './with_socials.vue'

export default {
  name: 'pageAuth__signUp',
  components: {withSocials},
  data () {
    return {
      login: '',
      password: '',
      passwordAgain: '',
      promo: '',
      code: '',
      userId: '',
      needConfirmEmail: false,
      confirming: false,
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
      if (this.login.length === 0) throw new Error('Почта пуста')
      // if (this.password.length === 0) throw new Error('Password is empty!')
      // if (this.passwordAgain.length === 0) throw new Error('Password is empty!')
      // if (this.password !== this.passwordAgain) throw new Error('Passwords do not match!')
      if (this.promo.length === 0) throw new Error('Введите инвайт код!')
      if (this.promo.length !== 4) throw new Error('Инвайт код это 4 цифры!')
    },
    async identify () {
      try {
        this.$log('identify start')
        this.loading = true
        this.check()
        let {userExist, userId, needInvite, needConfirm, loginType} = await AuthApi.userIdentify(this.login)
        this.$log(userExist, userId, needInvite, needConfirm, loginType)
        if (userExist) throw new Error('Ой, такая почта уже испольуется')
        if (loginType === 'EMAIL' && needConfirm) {
          this.userId = userId
          this.needConfirmEmail = true
        }
        this.$log('identify done')
      }
      catch (e) {
        this.$log('identify error', e)
        this.$q.notify({type: 'negative', position: 'top', message: e.toString()})
        this.loading = false
      }
    },
    async signUp () {
      try {
        this.$log('signUp start')
        this.confirming = true
        this.check()
        if (this.code.length === 0) throw new Error('Введите код с почты!')
        if (this.code.length !== 4) throw new Error('Код с почты это 4 цифры')
        let {result, failReason, oid} = await AuthApi.userAuthenticate(this.code, this.promo)
        if (result === false) throw new Error(`Error: ${failReason}`)
        await this.$router.replace('/')
        this.$log('signUp done')
        this.confirming = false
      }
      catch (e) {
        this.$log('signUp error', e)
        this.$q.notify({type: 'negative', position: 'top', message: e.toString()})
        this.confirming = false
      }
    }
  }
}
</script>
