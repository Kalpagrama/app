<template lang="pug">
.row.full-width.q-py-md.q-px-sm
  .row.full-width.q-px-sm
    span(v-if="header").text-bold.text-white {{ $t('Пароль') }}
  //- set password
  div(v-if="!$store.getters.currentUser.settings.hasPermanentPassword").row.full-width
    //- set header
    .row.full-width.q-py-xs
      small.text-white {{ $t('Вы можете установить постоянный пароль, если не хотите использовать одноразовые пароли') }}
    //- set action
    div(v-if="fold").row.full-width
      q-btn(flat color="white" no-caps @click="fold = false").b-50 {{ $t('Установить пароль') }}
    //- set body
    div(v-if="!fold").row.full-width.q-py-sm
      //- new password
      div(:style=`{position: 'relative', zIndex: 200, borderRadius: '10px', overflow: 'hidden'}`).row.full-width.q-mb-sm
        q-input(
          v-model="passwordNew"
          stack-label
          :label="$t('Новый пароль')"
          :placeholder="$t('Введите новый пароль')"
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
          :label="$t('Повторите пароль')"
          :placeholder="$t('Введите пароль')"
          type="password" required
          filled dark color="white"
          @keyup.enter="passwordSet()").full-width
          template(v-slot:append)
            q-btn(v-if="passwordNewConfirm.length > 0" round flat dense color="white" icon="clear" @click="passwordNewConfirm = ''")
      .row.full-width.items-center.content-center.justify-between.q-py-sm
        q-btn(
          @click="passwordSet()"
          color="green-8" dense outline size="12px" no-caps
          :disable="!passwordNew || !passwordNewConfirm"
          :loading="loading").q-px-sm {{ $t('Установить пароль') }}
        q-btn(
          @click="setting = false, reset()"
          flat color="grey-9" dense no-caps
          ) {{ $t('Отмена') }}
  //- change password
  div(v-if="$store.getters.currentUser.settings.hasPermanentPassword").row.full-width
    //- change action
    div(v-if="!changing").row.full-width.q-py-sm
      q-btn(flat color="white" no-caps @click="changing = true").b-50 {{ $t('Изменить пароль') }}
    //- change body
    div(v-if="changing").row.full-width.q-py-sm
      //- old password
      div(:style=`{position: 'relative', zIndex: 200, borderRadius: '10px', overflow: 'hidden'}`).row.full-width.q-mb-sm
        //- autocomplete="current-password"
        q-input(
          v-model="passwordOld"
          stack-label
          :label="$t('Старый пароль')"
          :placeholder="$t('Введите пароль')"
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
          :label="$t('Новый пароль')"
          :placeholder="$t('Введите новый пароль')"
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
          :label="$t('Повторите пароль')"
          :placeholder="$t('Введите пароль')"
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
          :loading="loading").q-px-sm {{$t('Изменить пароль')}}
        q-btn(
          @click="changing = false, reset()"
          flat color="grey-9" dense no-caps
          ) {{ $t('Отмена') }}
</template>

<script>
import { AuthApi } from 'src/api/auth'

export default {
  name: 'editPassword',
  props: {
    fold: { type: Boolean, default: true },
    header: { type: Boolean, default: true },
  },
  data () {
    return {
      loading: false,
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
        // await this.$wait(1000)
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
        // await this.$wait(1000)
        if (this.passwordOld.length === 0) throw new Error('Введите старый пароль!')
        if (this.passwordNew.length === 0) throw new Error('Введите новый пароль!')
        if (this.passwordNewConfirm.length === 0) throw new Error('Повторите новый пароль!')
        if (this.passwordNew !== this.passwordNewConfirm) throw new Error('Пароли не совпадают!')
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
