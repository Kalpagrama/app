<template lang="pug">
.column.fit
  div(style=`height: 60px; borderBottom: 1px solid #eee`).row.full-width.items-center.q-px-md
    span Поиск
  div(style=`height: 40px`).row.full-width.no-wrap.items-center
    div(v-for="(t, ti) in tags" :key="ti").row
      span {{ t }}
  .col.scroll.bg-grey-2
    div(v-for="(n, ni) in 100" :key="ni"
      style=`height: 500px`).row.full-width.q-my-sm.bg-white
</template>

<script>
export default {
  name: 'pageAppHot',
  data () {
    return {
      tag: '',
      tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5']
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
