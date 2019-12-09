<template lang="pug">
.row.full-width.justify-center
  div(:style=`{maxWidth: 330+'px'}`).row.full-width
    .row.fit.content-center.items-center
      div().row.full-width
        div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).row.full-width.q-mb-sm
          q-input(v-model="login" stack-label label="Login" filled).full-width.bg-white
        div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).row.full-width.q-mb-sm
          q-input(v-model="password" pattern="(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z!@#$%^&*]{6,}" stack-label label="Password" filled :type="isPwd ? 'password' : 'text'").full-width.bg-white
            template(v-slot:append)
              //- q-icon(
              //-   v-if="validPassowrd"
              //-   name="info"
              //-   size="25px"
              //-   color="red")
              q-icon(
                :name="isPwd ? 'visibility_off' : 'visibility'"
                size="25px"
                color="black"
                @click="isPwd = !isPwd")
        q-btn(
          push no-caps color="accent" @click="logining()" :loading="codeSending"
          :style=`{height: '60px', borderRadius: '10px', overflow: 'hidden'}`).full-width.q-mb-sm
          span.text-bold {{$t('Login')}}
        q-btn(
          outline no-caps color="white" @click="$go('/login')"
          :style=`{height: '60px', borderRadius: '10px'}`).full-width
          span {{$t('Back')}}
</template>

<script>
 export default {
  name: 'pageLoginSignIn',
  data () {
    return {
      isPwd: true,
      errors: [],
      password: '',
      login: ''
    }
  },
  computed: {
  },
  methods: {
    checkInput (e) {
      this.errors = [];
      if (!this.password) {
        this.errors.push('Укажите');
      } else if (!this.validEmail(this.password)) {
        this.errors.push('Неверный пароль');
      }
      if (!this.errors.length) {
        return true;
      }
      e.preventDefault();
    },
    validPassowrd (password) {
      const regExp = /(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z!@#$%^&*]{6,}/g
      return regExp.test(password)
    },
    async logining () {
      try {
        this.$log('login start')
        let res = await this.$store.dispatch('auth/loginPassword', {
          login: this.login,
          password: this.password
        })
        await this.$wait(1000)
        this.$go('/app/home')
        this.$log('login done', res)
      } catch (e) {
        this.$log('login ERROR', e)
      }
    },
  },
  mounted () {
   this.$logD('mounted')
  },
  beforeDestroy () {
   this.$logD('beforeDestroy')
  }
 }
</script>
