<template lang="pug">
.column.fit
  .col
    .row.fit.content-center.items-center.q-px-sm
      q-input(v-model="email" outlined label="Почта").full-width.q-mb-sm
      q-input(v-model="password" outlined label="Пароль" type="password").full-width.q-mb-sm
      .row.full-width.justify-end.q-px-sm
        small Забыли пароль?
      .row.full-width.q-my-sm
        q-btn(no-caps style=`height: 50px` color="primary" label="Войти" @click="handleLogin").full-width
</template>

<script>
export default {
  name: 'pageLoginEmail',
  data () {
    return {
      email: '',
      password: ''
    }
  },
  methods: {
    handleLogin () {
      this.$log('handleLogin')
      // TODO: login real
      this.$router.push('/app')
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
