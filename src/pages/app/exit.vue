<template lang="pug">
.row.fit.justify-center.bg-grey-2
  .row.full-width
    div(:style=`{height: '50px'}`).row.full-width.items-center.justify-end.q-pl-md
      .row
        span.text-bold Выход
      .col.row.justify-end
        q-btn(round flat icon="clear" @click="$emit('hide')")
  .row.full-width.justify-center.content-start
    .row.full-width.justify-center.q-mb-md
      span.text-bold Вы точно хотите выйти?
    .row.full-width.justify-center.q-px-md.q-mb-sm
      q-btn(@click="logout()" no-caps dense color="primary" style=`width: 120px; border-radius: 10px` label="Выйти").row.full-width
    .row.full-width.justify-center.q-px-md
      q-btn(@click="$emit('hide')" no-caps dense color="primary" style=`width: 120px; border-radius: 10px` label="Отмена").row.full-width
</template>
<script>
export default {
  name: 'pageExit',
  data () {
    return {
    }
  },
  methods: {
    async logout () {
    this.$log('logout')
    await this.$apollo.mutate({
     mutation: gql`
          mutation logout {
            logout
          }
        `
    })
    localStorage.removeItem('ktoken')
    localStorage.removeItem('ktokenExpires')
    localStorage.removeItem('ktokenInviteCode')
    this.$router.push('/login')
    }
  }
}
</script>
