<template lang="pug">
.column.bg-white.fit
  q-input(v-model="nameFirst" stack-label label="First name" filled).full-width
  q-input(v-model="nameSecond" stack-label label="Second name" filled).full-width
  q-select(filled v-model="country" :options="countries" :label="$t('Country')")
  q-select(filled v-model="gender" :options="genders" :label="$t('Gender')")
  q-select(filled v-model="lang" :options="langs" :label="$t('Lang')")
  phoneDialog
  emailDialog
  passwordDialog
  div(:style=`{position: 'absolute', zIndex: 100, bottom: '0px'}`).row.full-width.justify-end.q-px-md
    q-btn(@click="save()" round icon="done" size="lg" color="accent").q-mb-md
</template>

<script>
import emailDialog from './emailDialog'
import passwordDialog from './passwordDialog'
import phoneDialog from './phoneDialog'
export default {
  name: 'pageApp__settings__account',
  components: {passwordDialog, phoneDialog, emailDialog},
  data () {
    return {
      newLang: '',
      model: null,
      lang: null,
      gender: null,
      country: null,
      nameFIrst: null,
      nameSecond: null,
      langs: ['ENG', 'RUS'],
      genders: ['MALE', 'FEMALE'],
      countries: ['Russia']
    }
  },
  computed: {
    currentLang () {
      return this.$store.state.objects.currentUser.profile.lang
    },
    currentGender () {
      return this.$store.state.objects.currentUser.profile.gender
    },
    currentCountry () {
      return this.$store.state.objects.currentUser.profile.country
    },
    currentNameFirst () {
      return this.$store.state.objects.currentUser.profile.nameFirst
    },
    currentNameSecond () {
      return this.$store.state.objects.currentUser.profile.nameSecond
    }
  },
  methods: {
    save () {
      this.changeLanguage()
      this.changeCountry()
      this.changeGender()
      this.changeNameFirst()
      this.changeNameSecond()
    },
    async changeLanguage () {
      if (this.lang !== this.currentLang) {
        try {
          this.$log('changeLanguage start')
          let res = await this.$store.dispatch('objects/setObjectValue', {
            oid: this.$store.state.objects.currentUser.oid,
            path: 'profile.lang',
            value: this.lang
          })
          this.$log('changeLanguage done', res)
          this.$q.notify({message: 'Changed Language', color: 'green', textColor: 'white'})
        } catch (e) {
          this.$log('changeLanguage ERROR', e)
          this.$q.notify({message: 'Cant change Language', color: 'red', textColor: 'white'})
        }
      }
    },
    async changeCountry () {
      if (this.country !== this.currentCountry) {
        try {
          this.$log('changeCountry start')
          let res = await this.$store.dispatch('objects/setObjectValue', {
            oid: this.$store.state.objects.currentUser.oid,
            path: 'profile.country',
            value: this.country
          })
          this.$log('changeCountry done', res)
          this.$q.notify({message: 'Changed Country', color: 'green', textColor: 'white'})
        } catch (e) {
          this.$log('changeCountry ERROR', e)
          this.$q.notify({message: 'Cant change Country', color: 'red', textColor: 'white'})
        }
      }
    },
    async changeGender () {
      if (this.gender !== this.currentGender) {
        try {
          this.$log('changeGender start')
          let res = await this.$store.dispatch('objects/setObjectValue', {
            oid: this.$store.state.objects.currentUser.oid,
            path: 'profile.gender',
            value: this.gender
          })
          this.$log('changeGender done', res)
          this.$q.notify({message: 'Changed Gender', color: 'green', textColor: 'white'})
        } catch (e) {
          this.$log('changeGender ERROR', e)
          this.$q.notify({message: 'Cant change Gender', color: 'red', textColor: 'white'})
        }
      }
    },
    async changeNameFirst () {
      if (this.nameFirst !== this.currentNameFirst) {
        try {
          this.$log('changeNameFirst start')
          let res = await this.$store.dispatch('objects/setObjectValue', {
            oid: this.$store.state.objects.currentUser.oid,
            path: 'profile.nameFirst',
            value: this.nameFirst
          })
          this.$log('changeNameFirst done', res)
          this.$q.notify({message: 'Changed First name', color: 'green', textColor: 'white'})
        } catch (e) {
          this.$log('changeNameFirst ERROR', e)
          this.$q.notify({message: 'Cant change First name', color: 'red', textColor: 'white'})
        }
      }
    },
    async changeNameSecond () {
      if (this.nameSecond !== this.currentNameSecond) {
        try {
          this.$log('changeNameSecond start')
          let res = await this.$store.dispatch('objects/setObjectValue', {
            oid: this.$store.state.objects.currentUser.oid,
            path: 'profile.nameSecond',
            value: this.nameSecond
          })
          this.$log('changeNameSecond done', res)
          this.$q.notify({message: 'Changed Second name', color: 'green', textColor: 'white'})
        } catch (e) {
          this.$log('changeNameSecond ERROR', e)
          this.$q.notify({message: 'Cant change Second name', color: 'red', textColor: 'white'})
        }
      }
    }
  },
  mounted () {
    this.gender = this.$store.state.objects.currentUser.profile.gender
    this.country = this.$store.state.objects.currentUser.profile.country
    this.nameFirst = this.$store.state.objects.currentUser.profile.nameFirst
    this.nameSecond = this.$store.state.objects.currentUser.profile.nameSecond
    this.lang = this.$store.state.objects.currentUser.profile.lang
  },
  created () {
    this.$logD('created')
  }
}
</script>
