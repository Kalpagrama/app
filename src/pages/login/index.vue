<template lang="pug">
.row.full-width.justify-center
  div(:style=`{maxWidth: 330+'px'}`).row.full-width
    email
    //- .row.full-width.q-mb-sm
    //-   q-btn(
    //-     push :label="$t('Sign in by', 'Войти через')" icon-right="fab fa-vk" no-caps @click="$go({name: 'vk'})"
    //-     :style=`{background: '#45668e', color: 'white', height: '60px', borderRadius: '10px'}`).full-width
    //- .row.full-width.q-mb-sm
    //-   q-btn(
    //-     push no-caps color="blue" @click="$go({name: 'phone'})"
    //-     :style=`{height: '60px', borderRadius: '10px'}`).full-width
    //-     span {{$t('Войти по номеру телефона')}}
    //- .row.full-width.q-mb-sm
    //-   q-btn(
    //-     push no-caps color="grey" @click="$go({name: 'email'})"
    //-     :style=`{height: '60px', borderRadius: '10px'}`).full-width
    //-     span {{$t('Войти через почту')}}
    //- .row.full-width.q-mb-sm
    //-   q-btn(
    //-     push no-caps @click="$go({name: 'signIn'})"
    //-     :style=`{height: '60px', backgroundColor: '#474747', borderRadius: '10px'}`).full-width
    //-     span.text-white {{$t('Sign in')}}
    //- .row.full-width.q-mb-sm
      q-btn(
        push no-caps color="accent" @click="$go({name: 'signUp'})"
        :style=`{height: '60px', borderRadius: '10px'}`).full-width
        span {{$t(Sign up)}}
</template>

<script>
import email from './email'
export default {
  name: 'pageLogin__index',
  components: {email},
  mounted () {
    this.$logD('mounted')
    //  localStorage.removeItem('ktoken')
    localStorage.removeItem('ktokenExpires')
    localStorage.removeItem('ktokenInviteCode')
    let inviteCode = this.$route.query.invite
    if (inviteCode) localStorage.setItem('ktokenInviteCode', inviteCode)
  },
  beforeDestroy () {
    this.$logD('beforeDestroy')
  },
}
</script>
