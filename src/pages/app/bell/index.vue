<template lang="pug">
.column.fit
  div(style=`height: 60px`).row.full-width.items-center.q-px-sm.bg-white
    span Мои уведомления
  .col.scroll.bg-grey-2
    div(v-for="(b) in 100" :key="b"
      style=`height: 70px`).row.full-width.bg-white.q-px-sm.q-my-sm
      span Уведомление {{ b }}
</template>

<script>
export default {
  name: 'pageAppBell',
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
