<template lang="pug">
.column.fit.bg-white
  div(:style=`{height: '60px'}`).row.full-width
    div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
      q-btn(round flat icon="keyboard_arrow_left" @click="$router.back()")
    .col.full-height
      .row.fit.items-center
        span.text-bold {{$t('Пригласить друга')}}
  .col.full-width
    .row.fit.items-center.content-center.justify-center
      div(:style=`{maxWidth: $q.screen.gt.xs ? '330px' : '100%'}`).row.full-width
        //- by email
        .row.full-width.justify-center.q-px-md.q-mb-md
          div(:style=`{borderRadius: '10px', overflow: 'hidden', zIndex: 100}`).row.full-width.q-mb-sm
            q-input(v-model="email" type="email" filled :label="$t('Email')" @keyup.enter="emailSend()").full-width
              template(v-slot:append)
                q-icon(name="mail")
          q-btn(
            push no-caps color="accent" :disable="emailSent" :loading="emailSending" @click="emailSend()"
            style=`height: 56px; width: 120px; border-radius: 10px`).full-width
            span.text-bold {{$t(emailSent ? 'Приглашение отправлено!' : 'Отправить приглашение')}}
        //- get link
        .row.full-width.justify-center.q-px-md.q-mb-md
          div(
            v-if="link.length > 0"
            :style=`{borderRadius: '10px', overflow: 'hidden', zIndex: 100}`).row.full-width.q-mb-sm
            q-input(v-model="link" filled :label="$t('Send invite')" @keyup.enter="emailSend").full-width
              template(v-slot:append)
                q-icon(name="link")
          q-btn(
            v-if="link.length === 0"
            label="или скопировать ссылку" outline no-caps color="accent" :loading="linkGetting" @click="getLink()"
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
        this.$logD('invite emailSend start', this.email)
        if (this.email.length === 0) throw { message: 'Не верная почта' }
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
        this.$logD('emailSend done', inviteEmail)
        this.emailSending = false
        this.emailSent = true
        this.email = ''
        this.$q.notify({color: 'green', textColor: 'white', message: 'Приглашение отправлено!'})
        // this.$emit('hide')
      } catch (error) {
        this.$logD('emailSend error', error)
        this.$q.notify(error.message || JSON.stringify(error))
        this.emailSending = false
      }
    },
    async getLink () {
      try {
        this.$logD('invite linkGet start', this.link)
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
        this.$logD('linkGet done', inviteUrl)
        this.linkGetting = false
        this.link = inviteUrl
        let buffered = await this.inputBuffer(inviteUrl)
        this.$logD('buffered', buffered)
        if (buffered) {
          this.$q.notify({color: 'green', textColor: 'white', message: 'Ссылка успешно скопирована!'})
        } else {
          this.$q.notify({color: 'yellow', textColor: 'white', message: 'Скопируйте в ручную'})
        }
      } catch (error) {
        this.$logD('linkGet error', error)
        this.$q.notify(error.message || JSON.stringify(error))
        this.linkGetting = false
      }
    },
    inputBuffer (link) {
      return new Promise((resolve, reject) => {
        this.$logD('inputBuffer')
        if (navigator && navigator.clipboard) {
          this.$logD('PASTE LINK')
          navigator
            .clipboard
            .writeText(link)
            // .then(() => {
            //   this.$logD('PASTE GOOD')
            //   resolve(true)
            // },
            // () => {
            //   this.$logD('PASTE BAD')
            //   reject(false)
            // })
        } else {
          this.$logD('CANT PASTE LINK')
          resolve(true)
        }
      })
    }
  },
  mounted () {
    this.$logD('mounted')
  },
  beforeDestroy () {
    this.$logD('beforeDestroy')
  }
}
</script>
