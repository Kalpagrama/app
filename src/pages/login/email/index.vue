<template lang="pug">
.column.fit
  .col
    div(v-if="!codeConfirmed").row.fit.content-center.items-center.q-px-md
      div(v-if="!codeWaiting").row.full-width.q-mb-sm
        q-input(v-model="email" type="email" outlined label="Почта" @keyup.enter="emailSend").full-width.q-mb-sm
        q-btn(style=`height: 50px` color="primary" label="Далее" @click="emailSend" :loading="emailSending").full-width
      div(v-else).row.full-width
        q-input(v-model="code" outlined label="Код подтверждения" @keyup.enter="codeSend").full-width.q-mb-sm
        q-btn(style=`height: 50px` color="primary" label="Войти" @click="codeSend" :loading="codeSending").full-width
    div(v-else).row.fit.justify-center.content-center.items-center
      q-icon(name="email" size="100px" color="primary")
</template>

<script>
export default {
  name: 'pageLoginEmail',
  data () {
    return {
      email: 'ivanmoto254@gmail.com',
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
        this.$log('emailSend start')
        this.emailSending = true
        if (this.email.length === 0) throw {message: 'Wrong email!'}
        // await this.$wait(500)
        let { data: { loginEmail: { token, expires, role } } } = await this.$apollo.query({
          query: gql`
            query loginEmail ($email: String!){
              loginEmail(email: $email){
                token
                expires
                role
              }
            }
          `,
          variables: {
            email: this.email
          }
        })
        this.$log('token', token)
        localStorage.setItem('ktoken', token)
        localStorage.setItem('ktoken_expires', expires)
        this.$log('role', role)
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
        if (this.code.length !== 4) throw {message: 'Wrong code!'}
        // await this.$wait(500)
        // if (this.code !== this.codeFake) throw {message: 'Wrong code!'}
        let { data: { confirm: { result, attempts } } } = await this.$apollo.query({
          query: gql`
            query codeConfirm ($code: String!) {
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
        this.$log('codeSend done', result)
        this.codeSending = false
        this.codeWaiting = false
        this.codeConfirmed = true
        await this.$wait(1000)
        this.$router.push({name: 'home'})
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
