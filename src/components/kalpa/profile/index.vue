<template lang="pug">
.column.fit
  //- header
  .row.full-width
  //- body
  .col.full-width.scroll
    .row.full-width.items-start.content-start
      //- avatar
      .col-xs-12.col-sm-4.q-pa-sm
        .row.full-width.justify-center
          input(ref="inputAvatar" type="file" @input="avatarChanged" :style=`{display: 'none',}`)
          div(
            :style=`{width: '200px', height: '200px', borderRadius: '50%', overflow: 'hidden',}`
            ).row.items-center.content-center.justify-center.b-70
            q-btn(
              v-if="!avatarUrl"
              @click="$refs.inputAvatar.click()"
              round flat color="white" icon="attach_file" size="lg"
              :style=`{borderRadius: '50%',}`)
            img(
              v-if="avatarUrl"
              @click="$refs.inputAvatar.click()"
              :src="avatarUrl"
              :style=`{
                width: '100%', height: '100%',
                borderRadius: '50%', overflow: 'hidden',
              }`)
      //- name
      .col-xs-12.col-sm-8.q-pa-sm
        .row.full-width.q-pa-xs
          q-input(
            v-model="name"
            :label="$t('Whats your name?', 'Введите ваше имя')"
            filled dark color="white").full-width
        .row.full-width.q-pa-xs
          q-select(
            filled
            dark color="white" label="Language"
            v-model="lang"
            option-value="value"
            option-label="label"
            :options="langs"
            :style=`{
              borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden',
              minWidth: '300px', zIndex: 2000, transform: 'translate3d(0,0,0)',
            }`).full-width
    //- save
    .row.full-width.q-pa-sm
      .col
      q-btn(
        @click="save()"
        color="green" no-caps
        :disabled="nextDisabled"
        :loading="loading"
        ).q-px-md {{$t('save', 'Сохранить')}}
  slot(name="footer")
</template>

<script>
import { ObjectsApi } from 'src/api/objects'

export default {
  name: 'editProfile',
  data () {
    return {
      loading: false,
      name: '',
      lang: null,
      langs: [
        {value: 'ENG', label: 'English'},
        {value: 'RUS', label: 'Русский'},
      ],
      avatarFile: null,
      avatarUrl: null,
      currentUser: {
        name: '',
      }
    }
  },
  computed: {
  },
  methods: {
    async avatarChanged (e) {
      this.$log('avatarChanged', e)
      this.avatarFile = e.target.files[0]
      this.avatarUrl = URL.createObjectURL(this.avatarFile)
      // this.avatarDataUrl = await ObjectsApi.fileToDataUrl(this.avatarFile)
      // this.$log('avatarFile=', this.avatarFile)
      // this.$log('this.avatarFile instanceof File=', this.avatarFile instanceof File)
    },
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
        let oid = localStorage.getItem('k_user_oid')
        // set avatar,name,lang
        if (this.avatarFile) await ObjectsApi.update(oid, 'profile.photo', this.avatarFile)
        if (this.lang.value && this.lang.value !== this.currentUser.profile.lang) {
          this.$logD('change lang from: ', this.$i18n.i18next.language, 'to: ', this.lang.value)
          this.$i18n.i18next.changeLanguage(this.lang.value).catch(err => this.$logE(err))
          await ObjectsApi.update(oid, 'profile.lang', this.lang.value)
        }
        if (this.name.length > 0 && this.name !== this.currentUser.name) await ObjectsApi.update(oid, 'profile.name', this.name)
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
  async mounted () {
    this.$log('mounted')
    this.currentUser = this.$store.getters.currentUser()
    this.lang = this.langs.find(l => l.value === this.currentUser.profile.lang) //
    this.name = this.currentUser.name
    this.avatarUrl = this.currentUser.thumbUrl
  }
}
</script>
