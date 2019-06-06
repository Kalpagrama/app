<template lang="pug">
.column.fit
  .col
    .row.fit.content-center.q-px-md
      .row.full-width.q-mb-sm
        q-btn(label="Войти через" icon-right="fab fa-vk" no-caps
          style="background: #45668e; color: white; height: 50px" @click="$router.push({name: 'vk'})").row.full-width
      .row.full-width.q-mb-sm
        q-btn(label="Войти по Телефону" no-caps color="blue" style=`height: 50px` @click="$router.push({name: 'phone'})").row.full-width
      .row.full-width.q-mb-sm
        q-btn(label="Войти через Почту" no-caps color="grey" style=`height: 50px` @click="$router.push({name: 'email'})" ).row.full-width
</template>

<script>
export default {
  name: 'pageLogin__Index',
  data () {
    return {
    }
  },
  mounted () {
    this.$log('mounted')
    localStorage.removeItem('ktoken')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
