<template lang="pug">
.row.full-width
  div(:style=`{height: '40px'}`).row.full-width.items-start.content-start.q-px-sm
    span.text-bold.text-white {{$t('User settings', 'Настройки пользователя')}}
    .col
  .row.full-width.items-start.content-start
    //- cover
    //- avatar
    //- set status
    q-input(
      v-model="user.profile.about"
      filled dark color="green" label="Set your status"
      :style=`{borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden'}`).full-width.bg-grey-9.q-mb-md
    //- name
    q-input(
      v-model="user.name"
      filled dark color="green" label="Set your name"
      :style=`{borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden'}`).full-width.bg-grey-9.q-mb-md
    //- set about
    q-input(
      v-model="user.profile.about"
      type="textarea"
      filled dark color="green" label="Tell about youtself"
      :style=`{borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden'}`).full-width.bg-grey-9.q-mb-md
    //- login
    //- password
    //- email
    //- phone
    //- span {{ user }}
  div(:style=`{height: '70px'}`).row.full-width.q-py-sm
    q-btn(push no-caps color="green" @click="save()").fit
      span.text-bold {{$t('Save settings', 'Сохранить настройки')}}
</template>

<script>
export default {
  name: 'pageAppUser_userSettings',
  props: ['value'],
  data () {
    return {
      user: null
    }
  },
  watch: {
    value: {
      immediate: true,
      handler (to, from) {
        this.$log('value CHANGED', to)
        if (to) this.user = JSON.parse(JSON.stringify(to))
      }
    }
  },
  methods: {
    cancel () {
      this.$log('cancel')
      this.$emit('hide')
    },
    async save () {
      this.$log('save')
      // todo
      // let res = await this.$store.dispatch('objects/update', {
      //   oid: this.user.oid,
      //   path: 'profile.nameFull',
      //   newValue: this.user.name
      // })
    }
  }
}
</script>
