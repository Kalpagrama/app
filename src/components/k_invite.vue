<template lang="pug">
.column.fit.bg-white
  div(:style=`{height: '60px'}`).row.full-width
    .col.full-height
      .row.fit.items-center.q-px-md
        span.text-bold Invite friend
    div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
      q-btn(round flat icon="clear" @click="$emit('hide')")
  .col.full-width
    .row.fit.items-center.content-center.justify-center
      div(:style=`{maxWidth: $q.screen.gt.xs ? '330px' : '100%'}`).row.full-width
        //- by email
        .row.full-width.justify-center.q-px-md.q-mb-md
          div(:style=`{borderRadius: '10px', overflow: 'hidden', zIndex: 100}`).row.full-width.q-mb-sm
            q-input(v-model="email" type="email" filled label="Your friend email" @keyup.enter="emailSend()").full-width
              template(v-slot:append)
                q-icon(name="mail")
          q-btn(
            no-caps color="green" :disable="emailSent" :loading="emailSending" @click="emailSend()"
            style=`height: 56px; width: 120px; border-radius: 10px`).full-width
            span.text-bold {{emailSent ? 'Email sent!' : 'Send invite by email'}}
        //- get link
        .row.full-width.justify-center.q-px-md.q-mb-md
          div(
            v-if="link.length > 0"
            :style=`{borderRadius: '10px', overflow: 'hidden', zIndex: 100}`).row.full-width.q-mb-sm
            q-input(v-model="link" filled label="Invite link" @keyup.enter="emailSend").full-width
              template(v-slot:append)
                q-icon(name="link")
          q-btn(
            v-if="link.length === 0"
            label="or get invite link" outline no-caps color="green" :loading="linkGetting" @click="getLink()"
            style=`height: 56px; width: 120px; border-radius: 10px`).full-width
</template>

<script>
export default {
  name: 'kInvite',
  data () {
    return {
      email: '',
      emailSending: false,
      emailSent: false,
      link: '',
      linkGetting: false
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
        this.$log('emailSend done', inviteEmail)
        this.emailSending = false
        this.emailSent = true
        this.email = ''
        this.$q.notify({color: 'green', textColor: 'white', message: 'Invite sent!'})
        // this.$emit('hide')
      } catch (error) {
        this.$log('emailSend error', error)
        this.$q.notify(error.message || JSON.stringify(error))
        this.emailSending = false
      }
    },
    async getLink () {
      try {
        this.$log('invite linkGet start', this.link)
        this.linkGetting = true
        let { data: { inviteUrl } } = await this.$apollo.mutate({
        mutation: gql`
          mutation inviteUrl {
            inviteUrl
          }
        `,
        variables: {
          link: this.link
        }
        })
        this.$log('linkGet done', inviteUrl)
        this.linkGetting = false
        this.link = inviteUrl
        let buffered = await this.inputBuffer(inviteUrl)
        this.$log('buffered', buffered)
        if (buffered) {
          this.$q.notify({color: 'green', textColor: 'white', message: 'Link copied to clipboard!'})
        } else {
          this.$q.notify({color: 'yellow', textColor: 'white', message: 'Copy link manualy!'})
        }
      } catch (error) {
        this.$log('linkGet error', error)
        this.$q.notify(error.message || JSON.stringify(error))
        this.linkGetting = false
      }
    },
    inputBuffer (link) {
      return new Promise((resolve, reject) => {
        this.$log('inputBuffer')
        if (navigator && navigator.clipboard) {
          this.$log('PASTE LINK')
          navigator
            .clipboard
            .writeText(link)
            // .then(() => {
            //   this.$log('PASTE GOOD')
            //   resolve(true)
            // },
            // () => {
            //   this.$log('PASTE BAD')
            //   reject(false)
            // })
        } else {
          this.$log('CANT PASTE LINK')
          resolve(true)
        }
      })
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
