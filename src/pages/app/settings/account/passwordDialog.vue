<template lang="pug">
.row.full-width
  //- Password
  q-dialog(ref="changePassword" :maximized="$q.screen.xs" transition-show="slide-left" transition-hide="slide-right").bg-secondary
    .column.bg-white.q-px-md
      div(style=`height: 60px`).row.items-center
        div(style=`height: 60px; width: 60px`).row.justify-center.items-center
          q-btn(round flat icon="arrow_back" color="primary" @click="closing()")
        .col.row.justify-start.items-center.q-px-sm
          span.text-bold {{$t('Changing password')}}
          .col
        div(style=`height: 60px; width: 60px`).row.items-center.justify-center
          q-icon(
            :name="isPwd ? 'visibility_off' : 'visibility'"
            size="25px"
            color="primary"
            @click="isPwd = !isPwd")
      .row.content-start.justify-center
        //- q-input(v-model="currentPas" stack-label label="Current password" filled).full-width.q-my-md
        q-input(v-model="newPas" ref="password" stack-label :label="$t('New password')" filled :type="isPwd ? 'password' : 'text'").full-width.q-my-md
        q-input(v-model="repPas" ref="password" stack-label :label="$t('Repeat password')" lazy-rules filled :type="isPwd ? 'password' : 'text'" :rules="[val => !!val || '* Required', val => val === newPas || 'Please enter correct password',]").full-width
        q-btn(
          v-if="newPas === repPas && newPas"
          push no-caps dense color="accent" @click="changePassword()"
          :style=`{height: '60px', borderRadius: '10px'}`).full-width {{ $t('Change password') }}
        .row.full-width.q-py-sm
          small.text-grey-8.q-px-xs.q-mt-sm {{$t('Пароль должен состоять не менее чем из 6 символов, включающих буквы разных регистров, цифр и спецсимволов!')}}
  div(:style=`{height: '60px', borderBottom: '1px solid #eee'}` @click="$refs.changePassword.show()").row.full-width.justify-left.items-center.q-py-sm.cursor-pointer.hr
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
      isPwd: true,
      errors: ''
    }
  },
  computed: {
    currentPassword () {
      return this.$store.getters.currentUser.profile.password
    },
    errorLength () {
      if (this.errors) return this.errors.length
      else return 0
    }
  },
  methods: {
    closing () {
      this.$log('reset start')
      this.newPas = null
      this.repPas = null
      this.isPwd = true
      this.$refs.changePassword.toggle()
    },
    // validPassword (newPas) {
    //   var re = /(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z!@#$%^&*]{6,}/g
    //   return re.test(newPas)
    // },
    // checkInput (e) {
    //   this.errors = [];
    //   if (!this.validPassword(this.newPas)) {
    //     this.errors.push('Пароль должен содержать не менее одной буквы нижнего и верхнего регистра, цифры и символа');
    //   }
    //   if (!this.errors.length) {
    //     return true;
    //   }
    //   e.preventDefault();
    // },
    async changePassword () {
      try {
        this.$log('changePassword start')
        let res = await this.$store.dispatch('objects/update', {
          oid: this.$store.getters.currentUser.oid,
          path: 'profile.password',
          value: this.newPas
        })
        this.$log('changePassword done', res)
        this.$q.notify({message: 'Changed password', color: 'green', textColor: 'white'})
      } catch (e) {
        this.$log('changePassword ERROR', e)
        this.$q.notify({message: 'Incorrect password', color: 'red', textColor: 'white'})
      }
    },
  }
}
</script>
