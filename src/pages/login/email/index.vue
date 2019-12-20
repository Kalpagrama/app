<style lang="stylus">
.kinput {
  border: none;
  height: 100%;
  padding: 10px;
  &:focus {
    outline: none;
  }
}
</style>
<template lang="pug">
.row.full-width.justify-center
  div(:style=`{maxWidth: 330+'px'}`).row.full-width
    .row.fit.content-center.items-center
      div(v-if="!codeConfirmed && !codeWaiting").row.full-width.q-mb-sm
        div(:style=`{height: '60px', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.content-end.q-mb-sm.bg-white
          input(
            :placeholder="$t('Почта')"
            v-model="email" type="email" filled @keyup.enter="emailSend()"
            ).full-width.bg-white.kinput
        q-btn(
          push no-caps color="accent" @click="emailSend()" :loading="emailSending"
          :style=`{height: '60px', borderRadius: '10px', overflow: 'hidden'}`).full-width.q-mb-sm
          span.text-bold {{$t('Next')}}
        //- q-btn(
        //-   outline no-caps color="white" @click="$go('/login')"
        //-   :style=`{height: '60px', borderRadius: '10px'}`).full-width
        //-   span {{$t('Back')}}
      div(v-else).row.full-width
        div(:style=`{height: '60px', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.q-mb-sm
          input(
            :placeholder="$t('Код')"
            v-model="code" filled @keyup.enter="codeSend()"
            ).full-width.bg-white.kinput
        q-btn(
          push no-caps color="accent" @click="codeSend" :loading="codeSending"
          :style=`{height: '60px', borderRadius: '10px', overflow: 'hidden'}`).full-width
          span.text-bold {{$t('Login')}}
        q-btn(
          outline no-caps color="white" @click="back()"
          :style=`{height: '60px', borderRadius: '10px'}`).full-width.q-mt-sm
            span {{$t('Back')}}
</template>

<script>
 export default {
  name: 'pageLoginEmail',
  data () {
   return {
    email: '',
    emailSending: false,
    code: '',
    codeFake: 'xxxx',
    codeWaiting: false,
    codeSending: false,
    codeConfirmed: false
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
     this.$logD('emailSend start', this.email)
     this.emailSending = true
     if (this.email.length === 0) throw { message: 'Wrong email!' }
     await this.$store.dispatch('auth/loginEmail', this.email)
     // let { data: { loginEmail: { token, expires, role } } } = await this.$apollo.mutate({
     //  client: 'authApollo',
     //  mutation: gql`
     //    mutation loginEmail ($email: String!, $inviteCode: String){
     //      loginEmail(email: $email, inviteCode: $inviteCode){
     //        token
     //        expires
     //        role
     //      }
     //    }
     //  `,
     //  variables: {
     //    email: this.email,
     //    inviteCode: localStorage.getItem('ktokenInviteCode')
     //    // inviteCode: '171145051370487837'
     //  }
     // })
     // this.$logD('token', token)
     // localStorage.setItem('ktoken', token)
     // localStorage.setItem('ktokenExpires', expires)
     // this.$logD('emailSend done')
     this.emailSending = false
     this.codeWaiting = true
    } catch (error) {
     this.$logD('emailSend error', error)
     this.$q.notify(error.message || JSON.stringify(error))
     this.emailSending = false
    }
   },
   async codeSend () {
    try {
     this.$logD('codeSend start')
     this.codeSending = true
     this.codeConfirmed = false
     if (this.code.length !== 4) throw { message: 'Wrong code!' }
     // await this.$wait(500)
     // if (this.code !== this.codeFake) throw {message: 'Wrong code!'}
     let { result, nextAttemptDate, attempts, failReason } = await this.$store.dispatch('auth/confirm', this.code)
     //  let { data: { confirm: { result, nextAttemptDate, attempts, failReason } } } = await this.$apollo.mutate({
     //  client: 'authApollo',
     //  mutation: gql`
     //        mutation codeConfirmEmail ($code: String!) {
     //          confirm(code: $code){
     //            result
     //            nextAttemptDate
     //            attempts
     //            failReason
     //          }
     //        }
     //      `,
     //  variables: {
     //   code: this.code
     //  }
     // })
     this.codeSending = false
     this.codeWaiting = false
     if (result) {
      this.$logD('codeSend done', result)
      this.codeConfirmed = true
      await this.$wait(1000)
      this.$go('/')
     } else {
      this.$logD('codeSend fails', failReason)
      this.$q.notify(this.$t('code send error') + failReason)
     }
    } catch (error) {
     this.$logD('codeSend error', error)
     this.$q.notify(error.message || JSON.stringify(error))
     this.codeSending = false
    }
   }
  },
  mounted () {
   this.$logD('mounted')
  },
  beforeDestroy () {
   this.$logD('beforeDestroy')
  }
 }
</script>
