<style>
/* Change the white to any color */
input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus, input:-webkit-autofill:active
{
 box-shadow: 0 0 0 30px white inset !important;
}
</style>

<template lang="pug">
kalpa-layout().b-30
  template(v-slot:body=`{scrollTop}`)
    div(
      v-if="$q.screen.width > 768"
      :style=`{
        position: 'relative',
      }`).row.fit.items-center.content-center.justify-center.q-px-lg
      div(
        :style=`{
          position: 'relative',
          maxWidth: '800px',
          borderRadius: '30px',
          overflow: 'hidden',
        }`
        ).row.full-width
        div(:style=`{width: 'calc(50% + 15px)'}`).row
          div(:style=`{position: 'relative', paddingBottom: '100%',}`).row.full-width
            div(:style=`{position: 'absolute',}`).row.fit.items-center.content-center
              img(
                draggable="false"
                :src="'/images/space.png'"
                :style=`{
                  objectFit: 'cover',
                  //- maxHeight: '50vh'
                }`
                ).fit
              //- logo
              div(
                :style=`{
                  position: 'absolute', zIndex: 3, top: '0px',
                  //- maxHeight: '55vh',
                }`
                ).row.fit.row.fit.items-center.content-center.justify-center
                kalpa-logo(
                  :width="200"
                  :height="200").q-mb-md
                .row.full-width.justify-center
                  span(:style=`{fontSize: '30px',}`).text-white КАЛЬПАГРАМА
              //- tint
              div(
                :style=`{
                  position: 'absolute', zIndex: 2, top: '0px',
                  background: 'rgba(0,0,0,0.5)',
                  //- maxHeight: '100vh',
                }`
                ).row.fit.items-center.content-center.justify-center
        div(:style=`{width: 'calc(50% + 15px)', position: 'absolute', zIndex: 100, top: '0px', right: '0px',}`)
          div(:style=`{position: 'relative', paddingBottom: '100%'}`).row.full-width
            div(:style=`{position: 'absolute',borderRadius: '30px',}`).row.fit.b-80
    div(
      v-if="$q.screen.width <= 768"
      :style=`{position: 'relative',}`).row.full-width.items-start.content-start
      div(
        :style=`{
          position: 'fixed',  zIndex: 1, top: '0px',
        }`
        ).row.full-width
        img(
          draggable="false"
          :src="'/images/space.png'"
          :style=`{
            objectFit: 'cover',
            maxHeight: '50vh'
          }`
          ).fit
        img(
          draggable="false"
          :src="'/images/space.png'"
          :style=`{
            objectFit: 'cover',
            maxHeight: '50vh',
            transform: 'scaleY(-1)',
          }`
          ).fit
      //- logo
      div(
        :style=`{
          position: 'fixed', zIndex: 3, top: '0px',
          maxHeight: '55vh',
        }`
        ).row.fit.row.fit.items-center.content-center.justify-center
        kalpa-logo(
          :width="300"
          :height="300").q-mb-md
        .row.full-width.justify-center
          span(:style=`{fontSize: '30px',}`).text-white КАЛЬПАГРАМА
      //- tint
      div(
        :style=`{
          position: 'fixed', zIndex: 2, top: '0px',
          background: 'rgba(0,0,0,0.6)',
          maxHeight: '100vh',
        }`
        ).row.fit.items-center.content-center.justify-center
      //- tong
      div(
        :style=`{
          position: 'relative', zIndex: 100, transform: 'translate3d(0,0,0)',
          marginTop: '50vh',
          borderRadius: getRadius(scrollTop, scrollHeight),
          height: '1000px',
        }`
        ).row.full-width.items-start.content-start.b-80.q-pt-lg.q-px-md
        //- .row.full-width.justify-center
          small.text-white {{ 1-(scrollTop/($q.screen.height/2)) }}
        //- email
        q-input(
          v-model="email"
          borderless dark
          placeholder="Enter your email !"
          type="email"
          :autofocus="false"
          :disable="emailSending || emailSent"
          :error-message="emailIsValid ? '' : $tt('Wrong email!')"
          :input-style=`{
            padding: '16px',
            fontSize: '30px',
            fontWeight: 'bold',
            textAlign: 'center',
            color: 'white'
          }`
          @keyup.enter="emailSend()"
          ).full-width
        //- recieve code
        div(
          v-if="!emailSent"
          ).row.full-width.q-py-xl
          transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
            q-btn(
              v-if="emailIsValid"
              outline no-caps color="green"
              :loading="emailSending"
              :style=`{
                height: '60px',
              }`
              @click="emailSend()"
              ).full-width
              span(:style=`{fontSize: '20px',}`).text-bold Next
        //- email sent
        div(
          v-if="emailSent").row.full-width
          //- otp
          div(
            v-if="needConfirm"
            ).row.full-width
            q-input(
              v-model="password"
              borderless dark
              placeholder="Enter password"
              type="password"
              :autofocus="false"
              :disable="false"
              :input-style=`{
                padding: '16px',
                fontSize: '30px',
                fontWeight: 'bold',
                textAlign: 'center',
                color: 'white'
              }`
              @keyup.enter="() => {}"
              ).full-width
            q-btn(
              :loading="passwordSending"
              :style=`{
                height: '50px',
              }`
              @click="passwordSend")
          //- password
          div(
            v-if="hasPermanentPassword"
            ).row.full-width
            q-input(
              v-model="password"
              borderless dark
              placeholder="Enter password"
              type="password"
              :autofocus="false"
              :disable="false"
              :input-style=`{
                padding: '16px',
                fontSize: '30px',
                fontWeight: 'bold',
                textAlign: 'center',
                color: 'white'
              }`
              @keyup.enter="() => {}"
              ).full-width
</template>

<script>
import { AuthApi } from 'src/api/auth'

export default {
  name: 'pageAuth_home',
  props: ['onSuccess'],
  data () {
    return {
      email: '',
      emailSending: false,
      emailSent: false,
      hasPermanentPassword: false,
      needConfirm: false,
      password: '',
      passwordSending: false,
    }
  },
  computed: {
    emailIsValid () {
      const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      return re.test(String(this.email).toLowerCase())
    }
  },
  methods: {
    getRadius (scrollTop, scrollHeight) {
      let r = 30 * (1 - (scrollTop / (this.$q.screen.height / 2)))
      return `${r}px ${r}px 0 0`
    },
    async emailSend () {
      try {
        this.$log('emailSend start')
        this.emailSending = true
        // await this.$wait(2000)
        let {userExist, userId, needInvite, needConfirm, loginType, hasPermanentPassword} = await AuthApi.userIdentify(this.email)
        this.emailSent = true
        this.hasPermanentPassword = hasPermanentPassword
        // stuff
        // done
        this.$log('emailSend done')
        this.emailSending = false
      }
      catch (e) {
        this.$log('emailSend error', e)
        this.emailSending = false
      }
    },
    async passwordSend () {
      try {
        this.$log('passwordSend start')
        this.passwordSending = true
        let {result, failReason, oid} = await AuthApi.userAuthenticate('', this.password)
        if (result === false) throw new Error(`Error: ${failReason}`)
        await this.$router.replace('/')
        this.$log('passwordSend done')
        this.passwordSending = false
      }
      catch (e) {
        this.$log('passwordSend error', e)
        this.$q.notify({type: 'negative', message: e.toString()})
        this.passwordSending = false
      }
    },
  }
}
</script>
