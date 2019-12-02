<template lang="pug">
.row.full-width.justify-center
  div(:style=`{maxWidth: 330+'px'}`).row.full-width
    .row.full-width.q-mb-sm
      q-btn(
        push label="Войти через" icon-right="fab fa-vk" no-caps @click="$go({name: 'vk'})"
        :style=`{background: '#45668e', color: 'white', height: '60px', borderRadius: '10px'}`).full-width
    .row.full-width.q-mb-sm
      q-btn(
        push no-caps color="blue" @click="$go({name: 'phone'})"
        :style=`{height: '60px', borderRadius: '10px'}`).full-width
        span Войти по номеру телефона
    .row.full-width.q-mb-sm
      q-btn(
        push no-caps color="grey" @click="$go({name: 'email'})"
        :style=`{height: '60px', borderRadius: '10px'}`).full-width
        span Войти через почту
</template>

<script>
 export default {
  name: 'pageLogin__index',
  mounted () {
    this.$log('mounted')
    //  localStorage.removeItem('ktoken')
    localStorage.removeItem('ktokenExpires')
    localStorage.removeItem('ktokenInviteCode')
    let inviteCode = this.$route.query.invite
    if (inviteCode) localStorage.setItem('ktokenInviteCode', inviteCode)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
 }
</script>
