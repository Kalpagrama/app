<style lang="sass" scoped>
.item
  cursor: pointer
  &:hover
    background: rgb(90,90,90)
</style>

<template lang="pug">
div(
  :style=`{
    position: 'relative',
    borderRadius: $store.state.ui.borderRadius+'px',
    overflow: 'hidden'
  }`).column.full-width.b-50
  //- header
  div(:style=`{height: '100px'}`).row.full-width.items-center.content-center.q-px-md
    span(:style=`{fontSize: '16px'}`).text-white.text-bold {{$t('Настройки')}}
  //- body
  .col.full-width.scroll
    .row.full-width.items-start.content-start
      div(
        v-for="(p,pi) in pages" :key="p.id" @click="$router.push({params: {page: p.id}})"
        :class=`{
          'b-70': $route.params.page === p.id,
        }`
        :style=`{
          height: '40px', borderRadius: '10px',
        }`
        ).row.full-width.items-center.content-center.q-px-md.item
        span.text-white {{p.name}}
</template>

<script>
export default {
  name: 'pageApp-settings-menuRight',
  data () {
    return {
      pages: [
        {id: 'account', name: 'Аккаунт'},
        // {id: 'subscriptions', name: 'Подписки'},
        // {id: 'docs', name: 'Документы'}
      ]
    }
  }
}
</script>
