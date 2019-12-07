<template lang="pug">
.column.fit.bg-white
  //- Phone
  q-dialog(ref="changePhone" :maximized="true" transition-show="slide-left" transition-hide="slide-right").bg-secondary
    div(style=`height: 60px`).row.items-center.bg-primary
      div(style=`height: 60px; width: 60px`).row.justify-center.items-center
        q-btn(round flat icon="arrow_back" color="white" @click="$refs.changePhone.toggle()")
      .col.row.justify-start.items-center.q-px-sm
        span.text-bold.text-white {{$t('Changing phone number')}}
    .column.bg-white.q-px-md
      .row.full-width.justify-left.q-my-md
        span {{$t('You can attach your personal phone number to the page. This will protect your page.')}}
      div(style=`border-radius: 10px;`).row.content-start.justify-center
        q-input(v-if="currentPhone" v-model="currentPhone" readonly disable stack-label label="Current number" filled).full-width.q-mb-md
        q-input(v-model="newPhone" unmasked-value mask="(###)-###-##-##" stack-label label="New number" prefix="+7" filled).full-width.q-mb-md
        q-btn(
          push no-caps dense color="accent" @click="changePhone()"
          :style=`{height: '60px', borderRadius: '10px'}`).full-width.q-mb-sm {{ $t('Get code') }}
        .row.full-width.justify-start
          small.text-grey {{ $t('Example for Russia')}} +7 (921)-000-00-07
  //- Email
  q-dialog(ref="changeEmail" :maximized="true" transition-show="slide-left" transition-hide="slide-right").bg-secondary
    div(style=`height: 60px`).row.items-center.bg-primary
      div(style=`height: 60px; width: 60px`).row.justify-center.items-center
        q-btn(round flat icon="arrow_back" color="white" @click="$refs.changeEmail.toggle()")
      .col.row.justify-start.items-center.q-px-sm
        span.text-bold.text-white {{$t('Changing email')}}
    .column.bg-white.q-px-md
      .row.content-start.justify-center
        q-input(v-model="$store.state.objects.currentUser.settings.general.email" standout disable readonly stack-label label="Current email").full-width.q-my-md.text-black
        q-input(v-model="newEmail" stack-label label="New email" filled).full-width.q-mb-md
        q-btn(
          push no-caps dense color="accent" @click="changeEmail()"
          :style=`{height: '60px', borderRadius: '10px'}`).full-width.q-mb-sm {{ $t('Save email') }}
  //- Password
  q-dialog(ref="changePassword" :maximized="true" transition-show="slide-left" transition-hide="slide-right").bg-secondary
    div(style=`height: 60px`).row.items-center.bg-primary
      div(style=`height: 60px; width: 60px`).row.justify-center.items-center
        q-btn(round flat icon="arrow_back" color="white" @click="$refs.changePassword.toggle()")
      .col.row.justify-start.items-center.q-px-sm
        span.text-bold.text-white {{$t('Changing password')}}
        .col
      div(style=`height: 60px; width: 60px`).row.items-center.justify-center
        q-icon(
          :name="isPwd ? 'visibility_off' : 'visibility'"
          size="25px"
          color="white"
          @click="isPwd = !isPwd")
    .column.bg-white.q-px-md
      .row.content-start.justify-center
        //- q-input(v-model="currentPas" stack-label label="Current password" filled).full-width.q-my-md
        q-input(v-model="newPas" stack-label label="New password" filled :type="isPwd ? 'password' : 'text'").full-width.q-my-md
        q-input(v-model="repPas" stack-label label="New password" lazy-rules filled :type="isPwd ? 'password' : 'text'" :rules="[val => !!val || '* Required', val => val === newPas || 'Please enter correct password',]").full-width
        q-btn(
          v-if="newPas === repPas && newPas"
          push no-caps dense color="accent" @click="changePassword()"
          :style=`{height: '60px', borderRadius: '10px'}`).full-width.q-mb-sm {{ $t('Change password') }}
  //- Nickname
  q-dialog(ref="changeNickname" :maximized="true" transition-show="slide-left" transition-hide="slide-right").bg-secondary
    div(style=`height: 60px`).row.items-center.bg-primary
      div(style=`height: 60px; width: 60px`).row.justify-center.items-center
        q-btn(round flat icon="arrow_back" color="white" @click="$refs.changeNickname.toggle()")
      .col.row.justify-start.items-center.q-px-sm
        span.text-bold.text-white {{$t('Changing nickname')}}
    .column.bg-white.q-px-md
      .row.content-start.justify-center
        q-input(v-model="newNickname" stack-label label="New nickname" filled).full-width.q-my-md
        q-btn(
          push no-caps dense color="accent" @click=""
          :style=`{height: '60px', borderRadius: '10px'}`).full-width.q-mb-sm {{ $t('Change nickname') }}
  //- Language
  q-dialog(ref="changeLanguage" :maximized="true" transition-show="slide-left" transition-hide="slide-right").bg-secondary
    div(style=`height: 60px`).row.items-center.bg-primary
      div(style=`height: 60px; width: 60px`).row.justify-center.items-center
        q-btn(round flat icon="arrow_back" color="white" @click="$refs.changeLanguage.toggle()")
      .col.row.justify-start.items-center.q-px-sm
        span.text-bold.text-white {{$t('Changing language')}}
    .column.bg-white.q-px-md
      .row.content-start.justify-center
        q-input(v-model="newLanguage" stack-label label="Language" filled).full-width.q-my-md
        q-btn(
          push no-caps dense color="accent" @click="changeLanguage()"
          :style=`{height: '60px', borderRadius: '10px'}`).full-width.q-mb-sm {{ $t('Change language') }}
  div(:style=`{height: '60px', borderBottom: '1px solid #eee'}` @click="$refs.changePhone.show()").row.justify-left.items-center.q-py-sm.q-px-md.cursor-pointer.hr
    .row.full-width
      span {{$t("Phone number")}}
    .row.full-width
      small.text-grey  {{ currentPhone }}
      div(v-if="!currentPhone").row.full-width.items-center
        small.text-grey {{$t('Add your phone number')}}
        q-icon(name="warning" color="accent" size="20px").q-ml-xs
  div(:style=`{height: '60px', borderBottom: '1px solid #eee'}` @click="$refs.changeEmail.show()").row.justify-left.items-center.q-py-sm.q-px-md.cursor-pointer.hr
    .row.full-width
      span {{$t('Email')}}
    .row.full-width
      small.text-grey {{ currentEmail }}
      div(v-if="!currentEmail").row.full-width.items-center
        small.text-grey {{$t('Add your email')}}
        q-icon(name="warning" color="accent" size="20px").q-ml-xs
  div(:style=`{height: '60px', borderBottom: '1px solid #eee'}` @click="$refs.changePassword.show()").row.justify-left.items-center.q-py-sm.q-px-md.cursor-pointer.hr
    .row.full-width
      span {{$t('Change password')}}
      div(v-if="!currentPassword").row.full-width.items-center
        small.text-grey {{$t('Add password')}}
        q-icon(name="warning" color="accent" size="20px").q-ml-xs
  div(:style=`{height: '60px', borderBottom: '1px solid #eee'}` @click="$refs.changeNickname.show()").row.justify-left.items-center.q-py-sm.q-px-md.cursor-pointer.hr
    .row.full-width
      span {{$t('Nickname')}}
    .row.full-width
      small.text-grey  {{ settings.general.nickname }}
  div(:style=`{height: '60px', borderBottom: '1px solid #eee'}` @click="$refs.changeLanguage.show()").row.justify-left.items-center.q-py-sm.q-px-md.cursor-pointer.hr
    .row.full-width
      span {{$t('Language')}}
    .row.full-width
      small.text-grey  {{ $store.state.objects.currentUser.settings.general.language }}
</template>

<script>
export default {
  name: 'pageApp__settings__account',
  data () {
    return {
      isPwd: true,
      newPhone: '',
      newEmail: '',
      newpassword: '',
      newPas: '',
      currentPas: '',
      repPas: '',
      newNickname: '',
      settings: {
        general: {
          language: 'Russian',
          phone: '+7 *** *** ** 99',
          email: 'ro***@mail.ru',
          nickname: 'terminator3000'
        }
      }
    }
  },
  computed: {
    currentPhone () {
      return this.$store.state.objects.currentUser.settings.general.phone
    },
    currentEmail () {
      return this.$store.state.objects.currentUser.settings.general.email
    },
    currentPassword () {
      return this.$store.state.objects.currentUser.settings.general.password
    }
  },
  methods: {
    async changePhone () {
      try {
        this.$log('changePhone start')
        let res = await this.$store.dispatch('objects/setObjectValue', {
          oid: this.$store.state.objects.currentUser.oid,
          path: 'settings.general.phone',
          value: '+7 ' + this.newPhone
        })
        this.$log('changePhone done', res)
        this.$q.notify({message: 'Changed PHONE', color: 'green', textColor: 'white'})
      } catch (e) {
        this.$log('changePhone ERROR', e)
        this.$q.notify({message: 'Cant change PHONE', color: 'red', textColor: 'white'})
      }
    },
    async changeEmail () {
      try {
        this.$log('changeEmail start')
        let res = await this.$store.dispatch('objects/setObjectValue', {
          oid: this.$store.state.objects.currentUser.oid,
          path: 'settings.general.email',
          value: this.newEmail
        })
        this.$log('changeEmail done', res)
        this.$q.notify({message: 'Changed EMAIL', color: 'green', textColor: 'white'})
      } catch (e) {
        this.$log('changeEmail ERROR', e)
        this.$q.notify({message: 'Cant change EMAIL', color: 'red', textColor: 'white'})
      }
    },
    async changePassword () {
      try {
        this.$log('changePassword start')
        let res = await this.$store.dispatch('objects/setObjectValue', {
          oid: this.$store.state.objects.currentUser.oid,
          path: 'settings.general.password',
          value: this.newPas
        })
        this.$log('changePassword done', res)
        this.$q.notify({message: 'Cant change PASSWORD', color: 'green', textColor: 'white'})
      } catch (e) {
        this.$log('changePassword ERROR', e)
        this.$q.notify({message: 'Cant change PASSWORD', color: 'red', textColor: 'white'})
      }
    },
    async changeNickname () {
      try {
        this.$log('changeNickname start')
        let res = await this.$store.dispatch('objects/setObjectValue', {
          oid: this.$store.state.objects.currentUser.oid,
          path: 'settings.general.nickname',
          value: this.newPhone
          })
        this.$log('changeNickname done', res)
        this.$q.notify({message: 'Cant change NICKNAME', color: 'green', textColor: 'white'})
      } catch (e) {
        this.$log('changeNickname ERROR', e)
        this.$q.notify({message: 'Cant change NICKNAME', color: 'red', textColor: 'white'})
      }
    },
    async changeLanguage () {
      try {
        this.$log('changeLanguage start')
        let res = await this.$store.dispatch('objects/setObjectValue', {
          oid: this.$store.state.objects.currentUser.oid,
          path: 'settings.general.language',
          value: this.newLanguage
        })
        this.$log('changeLanguage done', res)
        this.$q.notify({message: 'Cant change LANGUAGE', color: 'green', textColor: 'white'})
      } catch (e) {
        this.$log('changeLanguage ERROR', e)
        this.$q.notify({message: 'Cant change LANGUAGE', color: 'red', textColor: 'white'})
      }
    }
  }
}
</script>
