<template lang="pug">
.row.full-width.q-py-md.q-px-sm
  .row.full-width.q-px-sm
    span.text-bold.text-white {{ $t('Password', 'Пароль') }}
  //- set password
  div(v-if="!$store.getters.currentUser().settings.hasPermanentPassword").row.full-width
    //- set header
    .row.full-width.q-py-xs
      small.text-white {{ $t('You can set a permanent password if you dont want to use temporary login codes.', 'Вы можете задать постоянный пароль, если не хотите использовать одноразовые пароли.') }}
    //- set action
    div(v-if="!setting").row.full-width
      q-btn(flat color="white" no-caps @click="setting = true").b-50 {{ $t('Set password', 'Задать пароль') }}
    //- set body
    div(v-if="setting").row.full-width.q-py-sm
      //- new password
      div(:style=`{position: 'relative', zIndex: 200, borderRadius: '10px', overflow: 'hidden'}`).row.full-width.q-mb-sm
        q-input(
          v-model="passwordNew"
          stack-label
          :label="$t('New passwor', 'Новый пароль')"
          :placeholder="$t('Enter new passwor', 'Введите новый пароль')"
          type="password" required
          filled dark color="white"
          ).full-width
          template(v-slot:append)
            q-btn(v-if="passwordNew.length > 0" round flat dense color="white" icon="clear" @click="passwordNew = ''")
      //- new password confirm
      div(:style=`{position: 'relative', zIndex: 200, borderRadius: '10px', overflow: 'hidden'}`).row.full-width.q-mb-sm
        q-input(
          v-model="passwordNewConfirm"
          stack-label
          :label="$t('Repeat passwor', 'Повторите пароль')"
          :placeholder="$t('Enter new passwor', 'Введите пароль')"
          type="password" required
          filled dark color="white"
          @keyup.enter="passwordSet()").full-width
          template(v-slot:append)
            q-btn(v-if="passwordNewConfirm.length > 0" round flat dense color="white" icon="clear" @click="passwordNewConfirm = ''")
      .row.full-width.items-center.content-center.justify-between.q-py-sm
        q-btn(
          @click="passwordSet()"
          color="green" dense no-caps
          :loading="loading").q-px-sm {{ $t('Set passwor', 'Задать пароль') }}
        q-btn(
          @click="setting = false, reset()"
          flat color="grey-9" dense no-caps
          ) {{ $t('Cancel', 'Отмена') }}
  //- change password
  div(v-if="$store.getters.currentUser().settings.hasPermanentPassword").row.full-width
    //- change action
    div(v-if="!changing").row.full-width.q-py-sm
      q-btn(flat color="white" no-caps @click="changing = true").b-50 {{ $t('Change passwor', 'Изменить пароль') }}
    //- change body
    div(v-if="changing").row.full-width.q-py-sm
      //- old password
      div(:style=`{position: 'relative', zIndex: 200, borderRadius: '10px', overflow: 'hidden'}`).row.full-width.q-mb-sm
        //- autocomplete="current-password"
        q-input(
          v-model="passwordOld"
          stack-label
          :label="$t('Old passwor', 'Старый пароль')"
          :placeholder="$t('Enter old passwor', 'Введите пароль')"
          type="password" required
          filled dark color="white"
          ).full-width
          template(v-slot:append)
            q-btn(v-if="passwordOld.length > 0" round flat dense color="white" icon="clear" @click="passwordOld = ''")
      //- new password
      div(:style=`{position: 'relative', zIndex: 200, borderRadius: '10px', overflow: 'hidden'}`).row.full-width.q-mb-sm
        q-input(
          v-model="passwordNew"
          stack-label
          :label="$t('New passwor', 'Новый пароль')"
          :placeholder="$t('Enter new passwor', 'Введите новый пароль')"
          type="password" required
          filled dark color="white"
          ).full-width
          template(v-slot:append)
            q-btn(v-if="passwordNew.length > 0" round flat dense color="white" icon="clear" @click="passwordNew = ''")
      //- new password confirm
      div(:style=`{position: 'relative', zIndex: 200, borderRadius: '10px', overflow: 'hidden'}`).row.full-width.q-mb-sm
        q-input(
          v-model="passwordNewConfirm"
          stack-label
          :label="$t('Repeat passwor', 'Повторите пароль')"
          :placeholder="$t('Enter new passwor', 'Введите пароль')"
          type="password" required
          filled dark color="white"
          @keyup.enter="passwordChange()").full-width
          template(v-slot:append)
            q-btn(v-if="passwordNewConfirm.length > 0" round flat dense color="white" icon="clear" @click="passwordNewConfirm = ''")
      //- footer
      .row.full-width.items-center.content-center.justify-between.q-py-sm
        q-btn(
          @click="passwordChange()"
          color="green" dense no-caps
          :loading="loading").q-px-sm {{$t('Change passwor', 'Изменить пароль')}}
        q-btn(
          @click="changing = false, reset()"
          flat color="grey-9" dense no-caps
          ) {{ $t('Cancel', 'Отмена') }}
</template>

<script>
import { AuthApi } from 'src/api/auth'

export default {
  name: 'passwordEditor',
  data () {
    return {
      loading: false,
      setting: false,
      changing: false,
      passwordOld: '',
      passwordNew: '',
      passwordNewConfirm: '',
    }
  },
  methods: {
    reset () {
      this.passwordOld = ''
      this.passwordNew = ''
      this.passwordNewConfirm = ''
    },
    async passwordSet () {
      try {
        this.$log('passwordSet start', this.passwordNew, this.passwordNewConfirm)
        this.loading = true
        await this.$wait(1000)
        if (this.passwordNew.length === 0) throw new Error('No new password!')
        if (this.passwordNewConfirm.length === 0) throw new Error('No new password repeat!')
        if (this.passwordNew !== this.passwordNewConfirm) throw new Error('Passwords dont match!')
        let {data} = await AuthApi.setPermanentPassword(null, this.passwordNew)
        this.$log('passwordSet done', data)
        this.loading = false
        this.setting = false
        this.reset()
        this.$q.notify({type: 'positive', position: 'top', message: 'Password changed!'})
      }
      catch (e) {
        this.$log('passwordSet error', e)
        this.$q.notify({type: 'negative', position: 'top', message: e.toString()})
        this.loading = false
        this.reset()
      }
    },
    async passwordChange () {
      try {
        this.$log('passwordChange start', this.passwordOld, this.passwordNew, this.passwordNewConfirm)
        this.loading = true
        await this.$wait(1000)
        if (this.passwordOld.length === 0) throw new Error('No old password!')
        if (this.passwordNew.length === 0) throw new Error('No new password!')
        if (this.passwordNewConfirm.length === 0) throw new Error('No new password repeat!')
        if (this.passwordNew !== this.passwordNewConfirm) throw new Error('Passwords dont match!')
        let {data} = await AuthApi.setPermanentPassword(this.passwordOld, this.passwordNew)
        this.$log('passwordSet done', data)
        this.$log('passwordChange done')
        this.loading = false
        this.changing = false
        this.reset()
        this.$q.notify({type: 'positive', position: 'top', message: 'Password changed!'})
      }
      catch (e) {
        this.$log('passwordChange error', e)
        this.$q.notify({type: 'negative', position: 'top', message: e.toString()})
        this.loading = false
        this.reset()
      }
    }
  }
}
</script>
