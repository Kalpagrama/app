<style lang="stylus">
.codeinput {
  background: none;
  border: none;
  height: 100%;
  &:focus {
    outline: none;
  }
}
</style>

<template lang="pug">
.row.full-width.justify-center
  div(:style=`{maxWidth: 330+'px'}`).row.full-width
    //- h1 shit
    .row.fit.content-center.items-center
      div(v-if="!codeConfirmed && !codeWaiting").row.full-width.q-mb-sm
        div(:style=`{height: '60px', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.content-end.q-mb-sm.bg-white
          input(
            :placeholder="$t('Почта')"
            v-model="email" type="email" filled @keyup.enter="emailSend()"
            :style=`{position: 'relative', padding: '10px', color: 'black'}`
            ).full-width.bg-white.codeinput
        q-btn(
          push no-caps color="green" @click="emailSend()" :loading="emailSending"
          :style=`{height: '60px', borderRadius: '10px', overflow: 'hidden'}`).full-width.q-mb-sm
          span.text-bold {{$t('Next')}}
      div(v-else).row.full-width.q-mb-sm
        div(:style=`{position: 'relative', height: '80px'}`).row.full-width.q-mb-sm
          input(
            type="phone"
            placeholder="1234"
            v-model="code" @keyup.enter="codeSend()"
            :style=`{
              position: 'relatvie', zIndex: 20,
              paddingLeft: '28px',
              color: 'white', fontSize: '80px', letterSpacing: '28px'
            }`
            ).full-width.codeinput.text-bold
        q-btn(
          push no-caps color="green" @click="codeSend" :loading="codeSending"
          :style=`{height: '60px', borderRadius: '10px', overflow: 'hidden'}`).full-width
          span.text-bold {{$t('Sign in', 'Войти')}}
        q-btn(
          outline no-caps color="green" @click="back()"
          :style=`{height: '60px', borderRadius: '10px'}`).full-width.q-mt-sm
          span {{$t('Back')}}
</template>

<script>
import { Notify } from 'quasar'
export default {
  name: 'pageLoginEmail',
  components: { Notify },
  data () {
    return {
      email: '',
      emailSending: false,
      code: '',
      codeFake: '----',
      codeWaiting: false,
      codeSending: false,
      codeConfirmed: false,
    }
  },
  watch: {
    code: {
      immediate: false,
      handler (to, from) {
        this.$log('code CHANGED', to)
        if (to) {
          if (to.length === 4) {
            this.$log('code SEND')
          }
        }
      }
    }
  },
  methods: {
    back () {
      this.codeConfirmed = false
      this.codeWaiting = false
      this.emailSending = false
      this.code = ''
    },
   async emailSend () {
    try {
      this.$log('emailSend start', this.email)
      this.emailSending = true
      if (this.email.length === 0) this.$q.notify({message: 'Wrong email! Enter correct Email!', color: 'white', position: 'bottom', textColor: 'red', icon: 'error'})
      await this.$store.dispatch('auth/loginEmail', this.email)
      this.emailSending = false
      this.codeWaiting = true
      this.$log('emailSend code', this.codeWaiting)
    } catch (error) {
      this.$log('emailSend error', error)
      this.emailSending = false
      if (this.email.length > 0) {
        this.$q.notify({
          message: 'No invite! Need invite!',
          color: 'white',
          position: 'bottom',
          textColor: 'red',
          icon: 'error'
        })
      }
    }
  },
  async codeSend () {
    try {
      this.$log('codeSend start')
      this.codeSending = true
      this.codeConfirmed = false
      if (this.code.length !== 4) throw { message: 'Wrong code!' }
      let { result, nextAttemptDate, attempts, failReason } = await this.$store.dispatch('auth/confirm', this.code)
      this.codeSending = false
      this.codeWaiting = false
      if (result) {
        this.$log('codeSend done', result)
        this.codeConfirmed = true
        await this.$wait(1000)
        this.$router.push('/')
      } else {
        this.$log('codeSend fails', failReason)
        this.$q.notify(this.$t('code send error') + failReason)
      }
      } catch (error) {
      this.$log('codeSend error', error)
      // this.$q.notify(error.message)
      this.codeSending = false
      }
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
