<template lang="pug">
.row.full-width
  //- header
  .row.full-width.q-px-md
    span.text-white.text-bold {{ $t('Profile', 'Профиль') }}
  //- status
  edit-status(:currentUser="currentUser")
  //- username
  edit-username(:currentUser="currentUser")
  .row.full-width.q-pa-xs
    div(:style=`{position: 'relative', zIndex: 100, borderRadius: '10px', overflow: 'hidden'}`).row.full-width
      q-input(
        v-model="username"
        :label="$t('Whats your username?', 'Введите ник')"
        filled dark color="white").full-width
  //- name
  .row.full-width.q-pa-xs
    div(:style=`{position: 'relative', zIndex: 100, borderRadius: '10px', overflow: 'hidden'}`).row.full-width
      q-input(
        v-model="name"
        :label="$t('Whats your name?', 'Введите ваше имя')"
        filled dark color="white").full-width
  //- lang
  .row.full-width.q-pa-xs
    q-select(
      filled
      dark color="white"
      :label="$t('Pick your language', 'Выберите язык')"
      v-model="lang"
      option-value="value"
      option-label="label"
      :options="langs"
      :style=`{
        borderRadius: '10px', overflow: 'hidden',
        minWidth: '300px', zIndex: 2000, transform: 'translate3d(0,0,0)',
      }`).full-width
  //- password
  edit-email(:currentUser="currentUser")
  //- edit-password(:currentUser="currentUser")
  //- save
  //- .row.full-width.justify-start.q-py-md.q-px-sm
    //- .col
    q-btn(
      @click="save()"
      color="green" no-caps size="lg"
      :disabled="nextDisabled"
      :loading="loading"
      ).full-width.q-px-md {{$t('save', 'Сохранить')}}
</template>

<script>
import { ObjectApi } from 'src/api/object'
import { rxdb } from 'src/system/rxdb'

export default {
  name: 'editProfile',
  props: ['currentUser'],
  components: {
    editStatus: () => import('./edit_status.vue'),
    editUsername: () => import('./edit_username.vue'),
    editEmail: () => import('./edit_email.vue'),
    editPassword: () => import('./edit_password.vue'),
  },
  data () {
    return {
      loading: false,
      username: '',
      name: '',
      lang: '',
      langs: [
        {value: 'ENG', label: 'English'},
        {value: 'RUS', label: 'Русский'},
      ],
      form: {
        username: '',
        name: '',
        lang: '',
        email: ''
      }
    }
  },
  methods: {
    langSelected (l) {
      this.$log('langSelected', l)
      this.lang = l.value
    },
    langLabel (lang) {
      return this.langs.find(l => l.value === lang)[0].label
    },
    async save () {
      this.$log('save1: ', this.name, this.lang.value)
      this.$log('save2: ', this.currentUser.profile.lang)
      this.$log('save3: ', this.currentUser.name)
      try {
        this.loading = true
        await this.$wait(1000)
        let oid = this.$rxdb.getCurrentUser().oid
        // set avatar,name,lang
        // if (this.avatarFile) await ObjectApi.update(oid, 'profile.photo', this.avatarFile)
        if (this.lang.value && this.lang.value !== this.currentUser.profile.lang) {
          this.$logD('change lang from: ', this.$i18n.i18next.language, 'to: ', this.lang.value)
          this.$i18n.i18next.changeLanguage(this.lang.value).catch(err => this.$logE(err))
          await ObjectApi.update(oid, 'profile.lang', this.lang.value)
        }
        if (this.name.length > 0 && this.name !== this.currentUser.name) await ObjectApi.update(oid, 'profile.name', this.name)
        // done
        this.loading = false
        this.$emit('next')
      }
      catch (e) {
        this.$log('save e', e)
        this.loading = false
      }
    }
  },
  mounted () {
    this.$log('mounted')
    this.lang = this.langs.find(l => l.value === this.currentUser.profile.lang)
    this.name = this.currentUser.name
    this.avatarUrl = this.currentUser.thumbUrl
  }
}
</script>
