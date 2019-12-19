<template lang="pug">
.row.full-width.justify-center
  div(:style=`{maxWidth: 330+'px'}`).row.full-width
    //- sending code
    div(v-if="!codeWaiting").row.full-width.q-mb-sm
      div(:style=`{position: 'relative', height: '60px', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.items-end.q-mb-sm.bg-white
        q-input(v-model="phone" type="tel" filled :label="$t('Phone')" @keyup.enter="smsSend()").full-width.bg-white
      q-btn(
        push no-caps color="accent" :loading="smsSending" @click="smsSend()"
        :style=`{height: '60px', borderRadius: '10px'}`).full-width.q-mb-sm
        span.text-bold {{$t('Next')}}
      q-btn(
        outline no-caps color="white" @click="$go('/login')"
        :style=`{height: '60px', borderRadius: '10px'}`).full-width
        span.text-bold {{$t('Back')}}
    //- confirming code
    div(v-else).row.full-width
      div(:style=`{position: 'relative', zIndex: 100, height: '60px', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.content-end.q-mb-sm.bg-white
        q-input(v-model="code" filled :label="$t('Code')" @keyup.enter="codeSend()").full-width.q-mb-sm
      q-btn(push color="accent" label="Войти" :loading="codeSending" @click="codeSend()"
        :style=`{height: '60px', borderRadius: '10px'}`).full-width.q-mb-sm
      q-btn(
        outline no-caps color="white" @click="codeWaiting = false"
        :style=`{height: '60px', borderRadius: '10px'}`).full-width
        span.text-bold {{$t('Back')}}
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
     this.$logD('smsSend start', this.phone)
     this.smsSending = true
     if (this.phone.length === 0) throw { message: 'Wrong phone!' }
      await this.$store.dispatch('auth/loginPhone', this.phone)
     // let { data: { loginPhone: { token, expires, role } } } = await this.$apollo.mutate({
     //  client: 'authApollo',
     //  mutation: gql`
     //    mutation loginPhone ($phone: String!, $inviteCode: String){
     //      loginPhone(phone: $phone, inviteCode: $inviteCode){
     //        token
     //        expires
     //        role
     //      }
     //    }
     //  `,
     //  variables: {
     //    phone: this.phone,
     //    inviteCode: localStorage.getItem('ktokenInviteCode')
     //  }
     // })
     // this.$logD('token', token)
     // localStorage.setItem('ktoken', token)
     // localStorage.setItem('ktokenExpires', expires)
     // this.$logD('smsSend done')
     this.smsSending = false
     this.codeWaiting = true
    } catch (error) {
     this.$logD('smsSend error', error)
     this.$q.notify(error.message || JSON.stringify(error))
     this.smsSending = false
    }
   },
   async codeSend () {
    try {
     this.$logD('codeSend start')
     this.codeSending = true
     this.codeConfirmed = false
     if (this.code.length !== 4) throw { message: 'Wrong code!' }
     let { result, nextAttemptDate, attempts, failReason } = await this.$store.dispatch('auth/confirm', this.code)
     // let { data: { confirm: { result, nextAttemptDate, attempts, failReason } } } = await this.$apollo.mutate({
     //  client: 'authApollo',
     //  mutation: gql`
     //        mutation codeConfirmPhone ($code: String!) {
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
