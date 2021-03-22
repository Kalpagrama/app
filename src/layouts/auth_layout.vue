<template lang="pug">
router-view
</template>

<script>
import { AuthApi } from 'src/api/auth'

export default {
  name: 'authLayout',
  // meta () {
  //   return this.$t('Kalpagrama - Authentication', 'Кальпаграма - Авторизация')
  // },
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
          // this.$log({loginType, userId, userExist, needInvite, needConfirm, token})
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
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
