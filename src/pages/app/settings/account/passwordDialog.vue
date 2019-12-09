<template lang="pug">
.row.full-width
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
        q-input(v-model="newPas" @submit="checkForm" stack-label label="New password" filled :type="isPwd ? 'password' : 'text'").full-width.q-my-md
        q-input(v-model="repPas" stack-label label="Repeat password" lazy-rules filled :type="isPwd ? 'password' : 'text'" :rules="[val => !!val || '* Required', val => val === newPas || 'Please enter correct password',]").full-width
        span {{validPassword}}
        span {{newPas}}
        q-btn(
          v-if="newPas === repPas && newPas"
          push no-caps dense color="accent" @click="changePassword()"
          :style=`{height: '60px', borderRadius: '10px'}`).full-width.q-mt-md {{ $t('Change password') }}
  div(:style=`{height: '60px', borderBottom: '1px solid #eee'}` @click="$refs.changePassword.show()").row.full-width.justify-left.items-center.q-py-sm.q-px-md.cursor-pointer.hr
    .row.full-width
      span {{$t('Change password')}}
      div(v-if="!currentPassword").row.full-width.items-center
        small.text-grey {{$t('Add password')}}
        q-icon(name="warning" color="accent" size="20px").q-ml-xs
</template>
<script>
export default {
  name: 'passwordDialog',
  data () {
    return {
      newPas: '',
      currentPas: '',
      repPas: '',
      isPwd: true
    }
  },
  computed: {
    currentPassword () {
      return this.$store.state.objects.currentUser.settings.general.password
    }
  },
  methods: {
    validPassword (newPas) {
      var re = /(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z!@#$%^&*]{6,}/g
      return re.test(newPas)
    },
    checkInput (e) {
      this.errors = [];
      if (!this.validPassword(this.newPas)) {
        this.errors.push('Неверный пароль');
      }
      if (!this.errors.length) {
        return true;
      }
      e.preventDefault();
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
  }
}
</script>
