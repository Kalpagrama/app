<template lang="pug">
div(:style=`{position: 'relative', borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden'}`).column.full-width.bg-grey-9
  div(:style=`{height: '60px'}`).row.full-width.items-center
  .col.full-width.scroll
    .row.full-width.items-start.content-start
      div(
        v-for="(p,pi) in pages" :key="p.id" @click="$router.push({params: {page: p.id}})"
        :style=`{
          height: '40px'
        }`
        ).row.full-width.items-center.content-center.q-px-md
        span.text-white {{p.name}}
</template>

<script>
export default {
  name: 'pageApp-settings-menuRight',
  data () {
    return {
      pages: [
        {id: 'account', name: 'Account'},
        {id: 'subscriptions', name: 'Subscriptions'},
        {id: 'docs', name: 'Documents'}
      ]
    }
  }
}
</script>
