<template lang="pug">
.row.full-width.justify-center
  div(:style=`{maxWidth: 330+'px'}`).row.full-width
    email
</template>

<script>
import email from './email'

export default {
  name: 'pageLoginIndex',
  components: { email },
  mounted () {
    this.$log('mounted')
    //  localStorage.removeItem('ktoken')
    // localStorage.removeItem('ktokenExpires')
    localStorage.removeItem('ktokenInviteCode')
    let inviteCode = this.$route.query.invite
    this.$log('inviteCode', inviteCode)
    if (inviteCode) localStorage.setItem('ktokenInviteCode', inviteCode)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  },
}
</script>
