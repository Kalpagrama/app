<template lang="pug">
  .column.fit
    .col
      div(v-if="!codeConfirmed").row.fit.content-center.items-center.q-px-md
        div(v-if="!codeWaiting").row.full-width.q-mb-sm
          q-input(v-model="phone" type="tel" outlined label="Телефон" @keyup.enter="smsSend").full-width.q-mb-sm
          q-btn(style=`height: 50px` color="primary" label="Далее" @click="smsSend" :loading="smsSending").full-width
        div(v-else).row.full-width
          q-input(v-model="code" outlined label="Код подтверждения" @keyup.enter="codeSend").full-width.q-mb-sm
          q-btn(style=`height: 50px` color="primary" label="Войти" @click="codeSend" :loading="codeSending").full-width
      div(v-else).row.fit.justify-center.content-center.items-center
        q-icon(name="phone" size="100px" color="primary")
</template>

<script>
 export default {
  name: 'pageLoginPhone',
  data () {
   return {
    phone: '',
    smsSending: false,
    code: '',
    codeFake: 'xxxx',
    codeWaiting: false,
    codeSending: false,
    codeConfirmed: false
   }
  },
  methods: {
   async smsSend () {
    try {
     this.$log('smsSend start', this.phone)
     this.smsSending = true
     if (this.phone.length === 0) throw { message: 'Wrong phone!' }
     let { data: { loginPhone: { token, expires, role } } } = await this.$apollo.mutate({
      client: 'authApollo',
      mutation: gql`
            mutation loginPhone ($phone: String!, $inviteCode: OID){
              loginPhone(phone: $phone, inviteCode: $inviteCode){
                token
                expires
                role
              }
            }
          `,
      variables: {
       phone: this.phone,
       inviteCode: localStorage.getItem('ktokenInviteCode')
      }
     })
     this.$log('token', token)
     localStorage.setItem('ktoken', token)
     localStorage.setItem('ktokenExpires', expires)
     this.$log('smsSend done')
     this.smsSending = false
     this.codeWaiting = true
    } catch (error) {
     this.$log('smsSend error', error)
     this.$q.notify(error.message || JSON.stringify(error))
     this.smsSending = false
    }
   },
   async codeSend () {
    try {
     this.$log('codeSend start')
     this.codeSending = true
     this.codeConfirmed = false
     if (this.code.length !== 4) throw { message: 'Wrong code!' }
     let { data: { confirm: { result, nextAttemptDate, attempts, failReason } } } = await this.$apollo.mutate({
      client: 'authApollo',
      mutation: gql`
            mutation codeConfirmPhone ($code: String!) {
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
      this.$router.push('/app/home')
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
