<template lang="pug">
  .row.fit.items-center.justify-center
    div(style=`maxWidth: 300px; maxHeight: 300px`).column.fit
      .col
        .row.fit.content-center.q-px-md
          .row.full-width.q-mb-sm
            q-btn(label="Войти через" icon-right="fab fa-vk" no-caps
            style="background: #45668e; color: white; height: 50px" @click="$router.push({name: 'vk'})").full-width
          .row.full-width.q-mb-sm
            q-btn(no-caps color="blue" style=`height: 50px` @click="$router.push({name: 'phone'})").full-width
              span Войти по номеру телефона
          .row.full-width.q-mb-sm
            q-btn(no-caps color="grey" style=`height: 50px` @click="$router.push({name: 'email'})" ).full-width
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
