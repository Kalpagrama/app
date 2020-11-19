
<template lang="pug">
q-layout(
  view="hHh lpR fFf"
  :style=`{
    paddingTop: 'env(safe-area-inset-top)',
  }`)
  q-page-container
    q-page(:style=`{}`)
      div(
        @click="$router.replace('/auth').catch(e => e)"
        :style=`{height: '200px', overflow: 'hidden',}`).row.full-width.items-center.content-center.justify-center.b-30
        kalpa-logo(:width="100" :height="100").q-mb-md
        h4.text-white.text-bold.q-ma-xs.q-pa-xs {{$t('kalpagrama', 'Кальпаграма')}}
      router-view(v-if="!$route.query.token")
      div(v-else).row.full-width.justify-center.q-py-xl
        q-spinner(size="50px" color="green")
</template>

<script>
import { AuthApi } from 'src/api/auth'

export default {
  name: 'authLayout',
  // meta () {
  //   return this.$t('Kalpagrama - Authentication', 'Кальпаграма - Авторизация')
  // },
  data () {
    return {
    }
  },
  watch: {
    '$route.query.token': {
      immediate: true,
      async handler (to, from) {
        if (to) {
          // alert('$route.query.token')
          this.$log('$route.query.token TO$route.query.token TO', to)
          let { userId, loginType, userExist, needInvite, needConfirm, token, expires } = await AuthApi.userIdentifyByRoute(this.$route)
          // let { userId, loginType, userExist, needInvite, needConfirm, token, expires } = {
          //   loginType: 'EMAIL',
          //   userId: 'ivanq3w@gmail.com',
          //   userExist: true,
          //   needInvite: true,
          //   needConfirm: false,
          // }
          console.log({loginType, userId, userExist, needInvite, needConfirm, token})
          let code
          if (needInvite) {
            // go to invite code...
            code = prompt('Enter invite code')
          }
          try {
            let {result, failReason, oid} = await AuthApi.userAuthenticate('', code)
            if (result === false) throw new Error(`Error: ${failReason}`)
            await this.$router.replace('/')
          }
          catch (e) {
            this.$q.notify({type: 'negative', position: 'top', message: e.toString()})
          }
        }
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
