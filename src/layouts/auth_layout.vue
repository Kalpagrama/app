
<template lang="pug">
q-layout(view="hHh lpR fFf").b-30
  q-page-container
    div(
      @click="$router.replace('/auth').catch(e => e)"
      :style=`{height: '200px', overflow: 'hidden',}`).row.full-width.items-center.content-center.justify-center.b-30
      kalpa-logo(:width="100" :height="100").q-mb-md
      h5.text-white.text-bold.q-ma-xs.q-pa-xs Кальпаграма
    router-view
</template>

<script>
import { AuthApi } from 'src/api/auth'

export default {
  name: 'authLayout',
  meta () {
    return this.$t('Kalpagrama - Authentication', 'Кальпаграма - Авторизация')
  },
  data () {
    return {
    }
  },
  watch: {
    '$route.query.token': {
      immediate: true,
      async handler (to, from) {
        if (to) {
          this.$log('$route.query.token TO', to)
          let { userId, loginType, userExist, needInvite, needConfirm, token, expires } = await AuthApi.userIdentifyByRoute(this.$route)
          this.$log('userId', userId)
          this.$log('loginType', loginType)
          this.$log('needInvite', needInvite)
          this.$log('needConfirm', needConfirm)
          let code
          if (needInvite) {
            // go to invite code...
            code = prompt('Enter invite code...')
          }
          try {
            let {result, failReason, oid} = await AuthApi.userAuthenticate('', code)
            if (result === false) throw new Error(`Error: ${failReason}`)
            await this.$router.replace('/')
          }
          catch (e) {
            this.$log('needInvite error', e)
            this.$q.notify({type: 'negative', position: 'top', message: e.toString()})
          }
        }
        // if (to) {
        //   this.$log('GOT TOKEN', to)
        //   // this.$q.notify('GOT TOKEN' + JSON.stringify(this.$route.query))
        //   let q = this.$route.query
        //   this.$log('q=', q)
        //   localStorage.setItem('k_token', q.token)
        //   localStorage.setItem('k_token_expires', q.expires)
        //   // await this.$wait(200)
        //   // this.userIdentifying = false
        //   // this.userIdentified = true
        //   // this.login = q.userId
        //   // this.loginType = q.loginType
        //   // this.userExist = q.userExist === 'true' ? true : false
        //   // this.needInvite = q.needInvite === 'true' ? true : false
        //   // this.$log('this.needInvite = ', this.needInvite)
        //   // if userExist and !needInvite... this.userAuthenticate()
        //   // this.$router.replace('/auth')
        // }
      }
    }
  },
  mounted () {
    this.$log('mounted', true, 'true', false, 'false')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
