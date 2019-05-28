<template lang="pug">
.column.fit
  .col
    .row.fit.content-center.q-px-md
      .row.full-width.q-my-sm
        q-btn(label="Войти через" icon-right="fab fa-vk" no-caps
          style="background: #45668e; color: white; height: 50px" @click="$router.push({name: 'vk'})").row.full-width
      .row.full-width.q-my-sm
        q-btn(label="Войти через Почту" no-caps color="grey" style=`height: 50px` @click="$router.push({name: 'email'})" ).row.full-width
      //- .row.full-width.q-my-sm
      //-   q-btn(label="Войти по Телефону")
</template>

<script>
export default {
  name: 'pageLoginIndex',
  data () {
    return {
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
