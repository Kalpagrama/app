<template lang="pug">
.row.full-width.q-pa-md
  .row.full-width
    span.text-bold.text-white Password
  .row.full-width
    small.text-white You can set a permanent password if you don't want to use temporary login codes.
  div(v-if="!editing").row.full-width.q-py-sm
    q-btn(flat color="white" no-caps @click="editing = true").b-50 Change password
  div(v-if="editing").row.full-width.q-py-sm
    div(:style=`{position: 'relative', zIndex: 200, borderRadius: '10px', overflow: 'hidden'}`).row.full-width.q-mb-sm
      //- autocomplete="current-password"
      q-input(
        v-model="passwordOld"
        stack-label label="Old password"
        placeholder="Enter old password..."
        type="password" required
        filled dark color="white"
        ).full-width
        template(v-slot:append)
          q-btn(v-if="passwordOld.length > 0" round flat dense color="white" icon="clear" @click="passwordOld = ''")
    div(:style=`{position: 'relative', zIndex: 200, borderRadius: '10px', overflow: 'hidden'}`).row.full-width.q-mb-sm
      q-input(
        v-model="passwordNew"
        stack-label label="New password"
        placeholder="Enter new password..."
        type="password" required
        filled dark color="white"
        ).full-width
        template(v-slot:append)
          q-btn(v-if="passwordNew.length > 0" round flat dense color="white" icon="clear" @click="passwordNew = ''")
    div(:style=`{position: 'relative', zIndex: 200, borderRadius: '10px', overflow: 'hidden'}`).row.full-width.q-mb-sm
      q-input(
        v-model="passwordNewConfirm"
        stack-label label="Repeat password"
        placeholder="Enter new password..."
        type="password" required
        filled dark color="white"
        @keyup.enter="passwordChange()").full-width
        template(v-slot:append)
          q-btn(v-if="passwordNewConfirm.length > 0" round flat dense color="white" icon="clear" @click="passwordNewConfirm = ''")
    .row.full-width.items-center.content-center.justify-between.q-py-sm
      q-btn(
        @click="passwordChange()"
        color="green" dense no-caps
        :loading="loading").q-px-sm Change password
      q-btn(
        @click="editing = false, reset()"
        flat color="grey-9" dense no-caps
        ) Cancel
</template>

<script>
export default {
  name: 'passwordEditor',
  data () {
    return {
      loading: false,
      editing: false,
      passwordOld: '',
      passwordNew: '',
      passwordNewConfirm: '',
    }
  },
  methods: {
    check () {
      this.$log('check')
      if (this.passwordOld.length === 0) throw new Error('No old password!')
      if (this.passwordNew.length === 0) throw new Error('No new password!')
      if (this.passwordNewConfirm.length === 0) throw new Error('No new password repeat!')
    },
    reset () {
      this.passwordOld = ''
      this.passwordNew = ''
      this.passwordNewConfirm = ''
    },
    async passwordChange () {
      try {
        this.$log('passwordChange start', this.passwordOld, this.passwordNew, this.passwordNewConfirm)
        this.loading = true
        await this.$wait(1000)
        this.check()
        this.$log('passwordChange done')
        this.loading = false
        this.editing = false
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
