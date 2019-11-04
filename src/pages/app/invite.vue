<template lang="pug">
  .row.items-center.justify-center.bg-grey-2
    div(style=`maxWidth: 600px; border-radius: 10px`).column
      div(:style=`{height: '50px', width: '60px'}`).row.full-width.items-center.justify-end.q-pl-md
        .row
          span.text-h6 Пригласить
        .col.row.justify-end
          q-btn(round flat icon="clear" @click="$emit('hide')")
      .row.full-width.justify-center
        span.text-h5
      .col
        .row.fit.content-center.q-px-md
          .row.full-width.justify-center
            q-input(v-model="email" type="email" bottom-slots outlined label="Email" @keyup.enter="emailSend" style=`maxWidth: 500px`).row.full-width.items-center
              template(v-slot:before)
                q-icon(name="mail")
              template(v-slot:after)
                q-btn(label="Пригласить" no-caps color="primary" style=`height: 40px; width: 120px;` @click="emailSend" :loading="emailSending").row.
          .row.full-width.justify-center
            q-input(outlined disable color="primary" id="myInput" style=`maxWidth: 500px` bottom-slots v-model="inviteLink").row.full-width
              template(v-slot:before)
                q-icon(name="link")
              template(v-slot:after)
                q-btn(label="Копировать" no-caps color="primary" style=`height: 40px; width: 120px;` @click="").row
          //- .row.full-width.justify-center
            q-input(outlined disable color="primary" style=`maxWidth: 500px` bottom-slots v-model="inviteLink").row.full-width
              template(v-slot:before)
                q-icon(name="code")
              template(v-slot:after)
                q-btn(label="Копировать" no-caps color="primary" style=`height: 40px; width: 120px;` @click="").row
</template>

<script>
 export default {
  name: 'pageInvite',
  data () {
   return {
    email: '',
    emailSending: false,
    inviteLink: '/https'
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
   },
   async getLink () {
    try {
     this.$log('invite linkGet start', this.link)
     if (this.link.length === 0) throw { message: 'Wrong getting link!' }
     this.linkGetting = true
     let { data: { inviteUrl } } = await this.$apollo.mutate({
      mutation: gql`
            mutation inviteUrl {
              inviteUrl
            }
          `,
      variables: {
       email: this.link
      }
     })
     this.$log('linkGet done')
     this.linkGetting = false
     this.$router.push('/app/home')
    } catch (error) {
     this.$log('linkGet error', error)
     this.$q.notify(error.message || JSON.stringify(error))
     this.linkGetting = false
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
