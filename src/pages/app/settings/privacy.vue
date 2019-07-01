<template lang="pug">
.column.fit
  div(style=`height: 60px; borderBottom: 1px solid #eee`
    ).row.full-width.items-center.q-px-md
    span Приватность
</template>

<script>
export default {
  name: 'pageApp__Settings__General',
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
