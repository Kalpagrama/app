<style lang="stylus">
</style>
<template lang="pug">
.column.bg-white.fit
  .row.full-width.q-px-sm
    span(v-if="role === 'MEMBER'").text-grey {{currentRole}}
    q-input(v-model="nameFirst" stack-label :label="$t('First name')").full-width.q-mt-sm
    q-input(v-model="nameSecond" stack-label :label="$t('Second name')").full-width
    q-select( v-model="country" :options="countries" :label="$t('Country')").full-width
    q-input(v-model="city" stack-label :label="$t('City', 'Город')").full-width
    q-select( v-model="gender" :options="genders" :label="$t('Gender')").full-width
    q-select( v-model="lang" :options="langs" :label="$t('Lang')").full-width
    q-input( v-model="date" mask="date" :label="$t('Date of birth', 'Дата рождения')" :rules="['date']").full-width
      template(v-slot:append)
        q-icon(name="event" class="cursor-pointer")
          q-popup-proxy(ref="qDateProxy" transition-show="scale" transition-hide="scale")
            q-date(v-model="date" @input="() => $refs.qDateProxy.hide()")
    //- phoneDialog
    emailDialog
    //- passwordDialog
  div(:style=`{height: '60px'}`).row.full-width.justify-end.items-center.content-center.q-px-md
    q-btn(@click="save()" push no-caps  :color="buttonColor")
      span.text-bold {{ $t('Save') }}
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
      date: null,
      lang: null,
      gender: null,
      country: null,
      city: null,
      nameFirst: null,
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
    currentCity () {
      return this.$store.state.objects.currentUser.profile.city
    },
    currentDate () {
      return this.$store.state.objects.currentUser.profile.dateBirth
    },
    currentNameFirst () {
      return this.$store.state.objects.currentUser.profile.nameFirst
    },
    currentNameSecond () {
      return this.$store.state.objects.currentUser.profile.nameSecond
    },
    currentNameFull () {
      return this.$store.state.objects.currentUser.profile.nameFull
    },
    currentRole () {
      return this.$store.state.objects.currentUser.profile.role
    },
    nameFull () {
      return this.nameSecond + ' ' + this.nameFirst
    },
    somethingChanged () {
      if (
        this.lang !== this.currentLang ||
        this.country !== this.currentCountry ||
        this.gender !== this.currentGender ||
        this.nameFirst !== this.currentNameFirst ||
        this.nameSecond !== this.currentNameSecond ||
        this.city !== this.currentCity ||
        this.date !== this.currentDate
      ) {
        return true
      } else {
        return false
      }
    },
    buttonColor () {
      if (this.somethingChanged) return 'green'
      else return 'grey'
    }
  },
  methods: {
    save () {
      this.$log('save')
      this.changeLanguage()
      this.changeCountry()
      this.changeGender()
      this.changeNameFirst()
      this.changeNameSecond()
      this.changeCity()
      this.changeDate()
    },
    async cancel () {
      this.$log('cancel')
      // check
      // show switch save, emit || emit
      this.$emit('cancel')
    },
    async changeDate () {
      if (this.date !== this.currentDate) {
        try {
          this.$log('changeDate start')
          let res = await this.$store.dispatch('objects/setObjectValue', {
            oid: this.$store.state.objects.currentUser.oid,
            path: 'profile.dateBirth',
            value: this.date
          })
          this.$log('changeDate done', res)
        } catch (e) {
          this.$log('changeDate ERROR', this.city)
        }
      }
    },
    async changeCity () {
      if (this.city !== this.currentCity) {
        try {
          this.$log('changeCity start')
          let res = await this.$store.dispatch('objects/setObjectValue', {
            oid: this.$store.state.objects.currentUser.oid,
            path: 'profile.city',
            value: this.city
          })
          this.$log('changeCity done', res)
        } catch (e) {
          this.$log('changeCity ERROR', this.city)
        }
      }
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
    this.city = this.$store.state.objects.currentUser.profile.city
    this.date = this.$store.state.objects.currentUser.profile.dateBirth
  },
  created () {
    this.$logD('created')
  }
}
</script>
