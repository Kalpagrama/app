<template lang="pug">
.column.full-width.bg-grey-8
  //- .col.full-width.scroll
  .row.full-width.items-start
    router-link(
      :to="{params: {page: p.id}}"
      v-for="(p,pi) in pages" :key="pi"
      :class=`{
        'bg-grey-7': $route.params.page === p.id
      }`
      :style=`{height: '40px'}`
      ).row.full-width.items-center.content-center.menu-item.q-px-md
      span(
        :class=`{
        }`
        ).text-white {{ p.name }}
</template>

<script>
export default {
  name: 'menuRight',
  data () {
    return {
      pages: [
        {id: 'info', name: 'Info'},
        {id: 'notes', name: 'Notes'},
        {id: 'users', name: 'People'},
        {id: 'ws', name: 'Workspace'}
      ]
    }
  }
}
</script>
