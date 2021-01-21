<template lang="pug">
.row.full-width.q-pa-md
  .row.full-width
    span.text-bold.text-white Почта и пароль
  .row.full-width.items-center.content-center.q-py-sm
    .row.full-width.q-px-xs
      span(:style=`{}`).text-white.text-bold {{ email || 'user@mail.com' }}
    .row.full-width
      q-btn(
        @click="editing = true"
        flat dense color="grey-6" no-caps size="sm") Изменить почту
    .row.full-width
      q-btn(
        @click="editing = true"
        flat dense color="grey-6" no-caps size="sm") Задать постоянный пароль
</template>

<script>
export default {
  name: 'editEmail',
  data () {
    return {
      editing: true,
    }
  },
  computed: {
    email () {
      return this.$store.getters.currentUser().profile.email
    }
  }
}
</script>
