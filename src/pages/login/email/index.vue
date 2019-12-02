<template lang="pug">
.row.full-width.justify-center
  div(:style=`{maxWidth: 330+'px'}`).row.full-width
    .row.fit.content-center.items-center
      div(v-if="!codeWaiting").row.full-width.q-mb-sm
        div(:style=`{height: '60px', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.content-end.q-mb-sm.bg-white
          q-input(
            v-model="email" type="email" filled :label="$t('Email')" @keyup.enter="emailSend()"
            ).full-width.bg-white
        q-btn(
          push no-caps color="accent" @click="emailSend()" :loading="emailSending"
          :style=`{height: '60px', borderRadius: '10px', overflow: 'hidden'}`).full-width.q-mb-sm
          span.text-bold {{$t('Next')}}
        q-btn(
          outline no-caps color="white" @click="$go('/login')"
          :style=`{height: '60px', borderRadius: '10px'}`).full-width
          span {{$t('Back')}}
      div(v-else).row.full-width
        div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).row.full-width.q-mb-sm
          q-input(
            v-model="code" filled :label="$t('Code')" @keyup.enter="codeSend()"
            ).full-width.bg-white
        q-btn(
          push no-caps color="accent" @click="codeSend" :loading="codeSending"
          :style=`{height: '60px', borderRadius: '10px', overflow: 'hidden'}`).full-width
          span.text-bold {{$t('Login')}}
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
   async emailSend () {
    try {
     this.$log('emailSend start', this.email)
     this.emailSending = true
     if (this.email.length === 0) throw { message: 'Wrong email!' }
     let { data: { loginEmail: { token, expires, role } } } = await this.$apollo.mutate({
      client: 'authApollo',
      mutation: gql`
        mutation loginEmail ($email: String!, $inviteCode: String){
          loginEmail(email: $email, inviteCode: $inviteCode){
            token
            expires
            role
          }
        }
      `,
      variables: {
        email: this.email,
        inviteCode: localStorage.getItem('ktokenInviteCode')
        // inviteCode: '171145051370487837'
      }
     })
     this.$log('token', token)
     localStorage.setItem('ktoken', token)
     localStorage.setItem('ktokenExpires', expires)
     this.$log('emailSend done')
     this.emailSending = false
     this.codeWaiting = true
    } catch (error) {
     this.$log('emailSend error', error)
     this.$q.notify(error.message || JSON.stringify(error))
     this.emailSending = false
    }
   },
   async codeSend () {
    try {
     this.$log('codeSend start')
     this.codeSending = true
     this.codeConfirmed = false
     if (this.code.length !== 4) throw { message: 'Wrong code!' }
     // await this.$wait(500)
     // if (this.code !== this.codeFake) throw {message: 'Wrong code!'}
     let { data: { confirm: { result, nextAttemptDate, attempts, failReason } } } = await this.$apollo.mutate({
      client: 'authApollo',
      mutation: gql`
            mutation codeConfirmEmail ($code: String!) {
              confirm(code: $code){
                result
                nextAttemptDate
                attempts
                failReason
              }
            }
          `,
      variables: {
       code: this.code
      }
     })
     this.codeSending = false
     this.codeWaiting = false
     if (result) {
      this.$log('codeSend done', result)
      this.codeConfirmed = true
      await this.$wait(1000)
      this.$go('/app/home')
     } else {
      this.$log('codeSend fails', failReason)
      this.$q.notify(this.$t('code send error') + failReason)
     }
    } catch (error) {
     this.$log('codeSend error', error)
     this.$q.notify(error.message || JSON.stringify(error))
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
