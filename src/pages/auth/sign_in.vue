<template lang="pug">
q-page(
  :style=`{}`)
  .row.full-width.q-pa-lg
    q-input(
      v-model="email"
      borderless dark
      placeholder="Введите почту"
      type="email"
      :input-style=`{
        fontSize: '20px',
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        borderRadius: '10px',
        background: 'rgb(40,40,40)',
        minHeight: '60px',
      }`
      @keyup.enter="emailSend()"
      ).full-width
    //- email send
    div(
      v-if="!emailSended"
      ).row.full-width.justify-center
      q-btn(
        @click="emailSend()"
        color="green" no-caps
        size="lg"
        :loading="emailSending"
        :style=`{
          //- maxWidth: '260px',
          height: '60px',
        }`
        ).full-width.q-my-lg
        span.text-white.text-bold Далее
      .row.full-width.justify-center.q-py-sm
        kalpa-docs(
          title="Продолжая, вы соглашаетесь с:  "
          :styles=`{
            maxWidth: '200px',
          }`)
    //- emai sended, waiting for link to be clicked
    div(
      v-if="emailSended"
      :style=`{}`
      ).row.full-width
      div(:style=`{textAlign: 'center'}`).row.full-width.justify-center.q-pa-lg
        span.text-white Мы отправили вам на почту ссылку, нажмите ее
      .row.full-width.justify-center.q-py-lg
        q-spinner(size="50px" color="green")
      .row.full-width.justify-center
        q-btn(
          @click="emailSended = false, emailSending = false"
          flat dense color="grey-6" no-caps
          ) Отмена
</template>

<script>
import kalpaDocs from 'components/kalpa_docs/index.vue'

export default {
  name: 'pageAuth_signIn',
  components: {
    kalpaDocs,
  },
  data () {
    return {
      email: '',
      emailSending: false,
      emailSended: false
    }
  },
  methods: {
    async emailSend () {
      try {
        this.$log('emailSend start')
        this.emailSending = true
        // check email
        await this.$wait(500)
        // send email
        this.emailSending = false
        this.emailSended = true
      }
      catch (e) {
        this.$log('emailSend error', e)
        this.emailSending = false
      }
    }
  }
}
</script>
