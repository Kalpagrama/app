<template lang="pug">
.column.fit
  div(style=`height: 60px; borderBottom: 1px solid #eee`
    ).row.full-width.bg-white
    div(style=`height: 60px; width: 60px`).row.items-center.justify-center
      q-btn(icon="notifications_none" flat round color="primary")
    .col
      .row.fit.items-center.justify-center
        span Мои уведомления
    div(style=`height: 60px; width: 60px`).row.items-center.justify-center
      q-btn(icon="more_vert" flat round color="primary")
  .col.scroll.bg-grey-2
    div(style=`height: 60px;`).row.full-width.justify-center.items-center
      span У вас пока нет никаких уведомлений
</template>

<script>
export default {
  name: 'pageAppNotifications',
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
