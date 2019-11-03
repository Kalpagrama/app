<template lang="pug">
  .row.fit.items-center.justify-center
    div(style=`maxWidth: 500px; maxHeight: 500px`).column.fit
      .col
        .row.fit.content-center.q-px-md
          .row.full-width.q-mb-sm
            q-input(v-model="email" type="email" outlined label="Введите email того, кого хотите пригласить" @keyup.enter="emailSend" style=`height: 50px`).row.full-width
          .row.full-width.q-mb-sm
            q-btn(label="Пригласить" no-caps color="grey" style=`height: 50px` @click="emailSend" :loading="emailSending").row.full-width
          .row.full-width.q-mb-sm
            q-btn(label="Отмена" no-caps color="grey" style=`height: 50px` @click="$router.go(-2)").row.full-width
</template>

<script>
 export default {
  name: 'pageInvite',
  data () {
   return {
    email: '',
    emailSending: false
   }
  },
  methods: {
   async emailSend () {
    try {
     this.$log('invite emailSend start', this.email)
     if (this.email.length === 0) throw { message: 'Wrong email!' }
     this.emailSending = true
     let { data: { inviteEmail } } = await this.$apollo.mutate({
      mutation: gql`
            mutation inviteEmail ($email: String!){
              inviteEmail(email: $email)
            }
          `,
      variables: {
       email: this.email
      }
     })
     this.$log('emailSend done')
     this.emailSending = false
     this.$router.push('/app/home')
    } catch (error) {
     this.$log('emailSend error', error)
     this.$q.notify(error.message || JSON.stringify(error))
     this.emailSending = false
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

<style scoped>

</style>
